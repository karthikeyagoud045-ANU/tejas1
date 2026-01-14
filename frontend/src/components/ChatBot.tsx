import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Loader2, Sparkles, Paperclip, Mic, Image as ImageIcon, FileText, Trash2, Globe, Server, Cloud } from 'lucide-react';
import { sendMessageWithFallback, ChatMessage } from '../services/aiService';
import localApiService, { ServiceStatus } from '../services/localApiService';
import { transcribeWithWhisper } from '../services/whisperService';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: Event & { error: string }) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string; // Optional base64 preview for user messages
}

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English' },
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'te-IN', name: 'Telugu' },
  { code: 'ta-IN', name: 'Tamil' },
  { code: 'kn-IN', name: 'Kannada' },
  { code: 'ml-IN', name: 'Malayalam' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'zh-CN', name: 'Chinese' },
  { code: 'ja-JP', name: 'Japanese' }
];

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hello! I'm HealthWise AI. How can I assist you with your health questions today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [language, setLanguage] = useState('en-US');

  // Use audio recorder hook
  const audioRecorder = useAudioRecorder({
    maxDuration: 60000, // 60 seconds
    enableAudioLevel: true,
    onMaxDuration: () => {
      alert('Maximum recording duration (60 seconds) reached.');
    }
  });

  // Local backend state
  const [backendStatus, setBackendStatus] = useState<ServiceStatus | null>(null);
  const [useLocalApi, setUseLocalApi] = useState(true);
  const [lastSource, setLastSource] = useState<'local' | 'cloud' | null>(null);

  const chatHistoryRef = useRef<ChatMessage[]>([
    {
      role: 'system',
      content: "You are HealthWise AI, a helpful medical assistant. Provide very brief, concise, and direct answers. Avoid long paragraphs and detailed explanations unless explicitly asked. Use short bullet points if necessary. Always clarify you are an AI, not a doctor. If symptoms are severe, advise seeing a doctor immediately."
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessionIdRef = useRef(`session-${Date.now()}`);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Check backend status on mount and periodically
  useEffect(() => {
    const checkStatus = async () => {
      const status = await localApiService.getServiceStatus();
      setBackendStatus(status);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, attachment, audioRecorder.isRecording]);

  // --- Helper: Convert Blob/File to Base64 ---
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleVoiceInput = async () => {
    // If already recording, stop and transcribe
    if (audioRecorder.isRecording) {
      const result = await audioRecorder.stopRecording();

      if (result && result.blob && result.blob.size > 0) {
        setIsTranscribing(true);
        console.log(`Transcribing ${(result.blob.size / 1024).toFixed(1)}KB of audio with language: ${language}`);

        try {
          const transcriptionResult = await transcribeWithWhisper(result.blob, language);

          if (transcriptionResult.success && transcriptionResult.text) {
            setInput(prev => prev + transcriptionResult.text.trim() + ' ');
            console.log(`Transcription successful: ${transcriptionResult.text}`);
          } else {
            console.error('Whisper transcription failed:', transcriptionResult.error);
            // Show error message based on language
            const errorMessages: Record<string, string> = {
              'hi-IN': 'ट्रांसक्रिप्शन विफल। कृपया पुनः प्रयास करें।',
              'te-IN': 'ట్రాన్స్క్రిప్షన్ విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.',
              'en-US': `Transcription failed: ${transcriptionResult.error || 'Please try again'}`
            };
            alert(errorMessages[language] || errorMessages['en-US']);
          }
        } catch (error) {
          console.error('Whisper transcription error:', error);
          alert('Transcription failed. Is the backend running?');
        } finally {
          setIsTranscribing(false);
        }
      }
      return;
    }

    // Start recording
    await audioRecorder.startRecording();

    // Show error if recording failed to start
    if (audioRecorder.error) {
      const errorMessages: Record<string, string> = {
        'hi-IN': 'माइक्रोफ़ोन एक्सेस अस्वीकृत। कृपया अपनी ब्राउज़र सेटिंग्स में अनुमतियाँ दें।',
        'te-IN': 'మైక్రోఫోన్ యాక్సెస్ నిరాకరించబడింది. దయచేసి మీ బ్రౌజర్ సెట్టింగులలో అనుమతులు ఇవ్వండి.',
        'en-US': audioRecorder.error.message
      };
      alert(errorMessages[language] || errorMessages['en-US']);
      audioRecorder.clearError();
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !attachment) return;

    const userMsgText = input.trim();
    const currentAttachment = attachment;

    // Clear input state immediately
    setInput('');
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Optimistically add user message
    setMessages(prev => [
      ...prev,
      {
        role: 'user',
        text: userMsgText,
        image: currentAttachment ? URL.createObjectURL(currentAttachment) : undefined
      }
    ]);
    setIsTyping(true);

    try {
      // Add user message to chat history
      chatHistoryRef.current.push({
        role: 'user',
        content: userMsgText || "Analyze this image."
      });

      let fullResponse = "";

      // Try local backend first if enabled and available
      if (useLocalApi && backendStatus?.ready) {
        try {
          console.log('Using local backend API...');

          // Handle file uploads through local backend
          if (currentAttachment) {
            const uploadResult = await localApiService.uploadAndAnalyze(currentAttachment, 'summarize');
            fullResponse = uploadResult.analysis.result;
            setLastSource(uploadResult.analysis.source as 'local' | 'cloud');
          } else {
            const response = await localApiService.sendMessage(
              userMsgText,
              sessionIdRef.current,
              false,
              language // Pass language for strict language mode enforcement
            );
            fullResponse = response.reply;
            setLastSource(response.source);
          }

          setMessages(prev => [...prev, { role: 'model', text: fullResponse }]);
        } catch (localError) {
          console.warn('Local backend failed, falling back to cloud:', localError);
          // Fall through to cloud fallback
          fullResponse = "";
        }
      }

      // Fallback to cloud APIs if local failed or not available
      if (!fullResponse) {
        console.log('Using cloud API fallback...');
        setLastSource('cloud');
        setMessages(prev => [...prev, { role: 'model', text: "" }]);

        // Get language-aware system prompt for cloud fallback
        const languagePrompts: Record<string, string> = {
          'hi-IN': 'आप HealthWise AI हैं। आपको केवल हिंदी में जवाब देना है। कोई अंग्रेजी या अन्य भाषा का उपयोग न करें। संक्षिप्त और स्पष्ट उत्तर दें।',
          'te-IN': 'మీరు HealthWise AI. మీరు కేవలం తెలుగులో మాత్రమే సమాధానం ఇవ్వాలి. ఆంగ్లం కలపకూడదు.',
          'ta-IN': 'நீங்கள் HealthWise AI. தமிழில் மட்டுமே பதிலளிக்கவும். ஆங்கிலம் கலக்க வேண்டாம்.',
          'kn-IN': 'ನೀವು HealthWise AI. ಕನ್ನಡದಲ್ಲಿ ಮಾತ್ರ ಉತ್ತರಿಸಿ. ಇಂಗ್ಲಿಷ್ ಬೆರೆಸಬೇಡಿ.',
          'ml-IN': 'നിങ്ങൾ HealthWise AI ആണ്. മലയാളത്തിൽ മാത്രം മറുപടി നൽകുക. ഇംഗ്ലീഷ് കലർത്തരുത്.',
          'en-US': 'You are HealthWise AI, a helpful medical assistant. Give brief, concise answers. Always clarify you are an AI, not a doctor.',
          'es-ES': 'Eres HealthWise AI. Responde únicamente en español. No mezcles inglés.',
          'fr-FR': 'Vous êtes HealthWise AI. Répondez uniquement en français. Ne mélangez pas l\'anglais.',
          'de-DE': 'Sie sind HealthWise AI. Antworten Sie ausschließlich auf Deutsch.',
          'zh-CN': '你是HealthWise AI。只用中文回答。不要混用英语。',
          'ja-JP': 'あなたはHealthWise AIです。日本語のみで回答してください。'
        };

        // Update the system message in chat history for cloud fallback
        const systemPrompt = languagePrompts[language] || languagePrompts['en-US'];
        const messagesWithLanguage: ChatMessage[] = [
          { role: 'system', content: systemPrompt },
          ...chatHistoryRef.current.filter(m => m.role !== 'system')
        ];

        for await (const chunk of sendMessageWithFallback(messagesWithLanguage)) {
          if (chunk.text) {
            fullResponse += chunk.text;
            setMessages(prev => {
              const newHistory = [...prev];
              newHistory[newHistory.length - 1].text = fullResponse;
              return newHistory;
            });
          }
        }
      }

      // Add assistant response to chat history
      chatHistoryRef.current.push({
        role: 'assistant',
        content: fullResponse
      });

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: "I apologize, but all API providers failed. Please check your API keys or try again later."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-[0_4px_20px_rgba(37,99,235,0.4)] hover:shadow-[0_8px_25px_rgba(37,99,235,0.6)] hover:scale-110 transition-all duration-300 group ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <Bot className="w-8 h-8 group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[90vw] md:w-[380px] h-[600px] max-h-[80vh] bg-white/90 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)] flex flex-col animate-fade-in overflow-hidden ring-1 ring-slate-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">HealthWise Assistant</h3>
                <p className="text-[10px] font-medium opacity-80 flex items-center gap-1">
                  {backendStatus?.ollama.running ? (
                    <>
                      <Server className="w-2 h-2" />
                      <span className="text-green-300">Local AI ({backendStatus.ollama.model})</span>
                    </>
                  ) : (
                    <>
                      <Cloud className="w-2 h-2" />
                      <span>Cloud API</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <div className="relative group">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="appearance-none bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold py-1.5 pl-2 pr-6 rounded-lg border border-white/20 focus:outline-none focus:ring-1 focus:ring-white/50 cursor-pointer transition-colors"
                >
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code} className="text-slate-900">{lang.name}</option>
                  ))}
                </select>
                <Globe className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-80" />
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.image && (
                  <div className="mb-2 max-w-[85%] rounded-2xl overflow-hidden border border-blue-200 shadow-sm">
                    <img src={msg.image} alt="User upload" className="w-full h-auto max-h-40 object-cover" />
                  </div>
                )}
                {msg.text && (
                  <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                    }`}>
                    {msg.text}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            {/* File Preview */}
            {attachment && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl p-2 mb-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 border border-blue-100 text-blue-500">
                    {attachment.type.startsWith('image/') ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>
                  <span className="text-xs font-bold text-blue-700 truncate max-w-[180px]">{attachment.name}</span>
                </div>
                <button onClick={() => { setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="p-1 hover:bg-blue-100 rounded-full text-blue-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-end gap-2 relative">
              {/* Hidden Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,application/pdf"
              />

              {/* Tools Button Group */}
              <div className="flex gap-1 mb-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-95"
                  title="Attach file"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask..."
                  rows={1}
                  className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 resize-none custom-scrollbar"
                  style={{ minHeight: '46px', maxHeight: '100px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={(!input.trim() && !attachment) || isTyping || isTranscribing}
                  className="absolute right-1.5 bottom-1.5 p-2 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                >
                  {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">
              AI can make mistakes. Please consult a doctor.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;