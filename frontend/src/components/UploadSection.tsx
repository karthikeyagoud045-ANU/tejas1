import React, { useState, useRef } from 'react';
import { Upload, FileText, Check, AlertCircle, Loader2, Search, CheckSquare, Salad, Download, Share2, X, ChevronRight, Info, Sparkles } from 'lucide-react';
import { analyzeMedicalReport } from '../services/geminiService';
import { AnalysisResult } from '../types';
import { downloadHealthReport } from '../services/pdfGenerator';

interface UploadSectionProps {
  id: string;
}

const UploadSection: React.FC<UploadSectionProps> = ({ id }) => {
  const [file, setFile] = useState<File | null>(null);
  const [reportType, setReportType] = useState('Blood Test');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Patient Inputs
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Gender');
  const [conditions, setConditions] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // --- VALIDATION START ---
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(selectedFile.type)) {
        setError("Invalid file type. Please upload a PDF or Image (JPG/PNG).");
        setFile(null);
        setAnalysis(null);
        return;
      }

      // 10MB limit
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit. Please compress your file.");
        setFile(null);
        setAnalysis(null);
        return;
      }
      // --- VALIDATION END ---

      setFile(selectedFile);
      setError(null);
      setAnalysis(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        // Remove data url prefix (e.g. "data:image/png;base64,")
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload a file first.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const base64Data = await fileToBase64(file);
      const mimeType = file.type;

      const result = await analyzeMedicalReport(
        base64Data,
        mimeType,
        age,
        gender,
        conditions
      );

      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze report. Ensure the image is clear and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityDescription = (severity: string) => {
    switch (severity) {
      case 'red': return '(High - Immediate Attention Required)';
      case 'yellow': return '(Moderate - Consult Doctor)';
      case 'green': return '(Low - Healthy Range)';
      default: return '';
    }
  };

  return (
    <section id={id} className="py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Upload & Analyze</h2>
        <p className="text-slate-600 font-medium text-lg">Drop a report, pick type, see AI findings and recommendations.</p>
      </div>

      <div className={`grid grid-cols-1 ${analysis ? 'lg:grid-cols-1' : 'lg:grid-cols-2'} gap-8 transition-all duration-500`}>
        {/* Left Panel: Inputs (Full width if analysis is done, otherwise half) */}
        <div className={`bg-white/80 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-sm h-fit transition-all duration-500 ${analysis ? 'max-w-3xl mx-auto w-full' : ''}`}>
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${file
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/20 hover:shadow-inner group'
              }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".jpg,.jpeg,.png,.pdf"
            />
            {file ? (
              <div className="flex flex-col items-center text-blue-700">
                <FileText className="w-12 h-12 mb-3 drop-shadow-sm" />
                <p className="font-bold text-base truncate max-w-full">{file.name}</p>
                <p className="text-xs font-bold text-blue-500 mt-1 uppercase tracking-wide">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); setAnalysis(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="mt-2 text-xs hover:underline text-slate-500 p-2"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-slate-500">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-8 h-8 text-blue-500 opacity-80" />
                </div>
                <p className="text-base font-bold text-slate-700">
                  Drop your medical report here or <span className="text-blue-500 hover:underline">click to browse</span>
                </p>
                <p className="text-xs text-slate-400 mt-2 font-semibold uppercase tracking-wide">PDF, JPG, PNG (Max 10MB)</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 my-6 justify-center">
            {['Blood Test', 'Ultrasound', 'X-Ray', 'Prescription', 'Other'].map(type => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all duration-300 active:scale-95 ${reportType === type
                  ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/50 backdrop-blur-md border border-slate-200 rounded-2xl p-5 shadow-sm">
              <strong className="text-xs font-bold uppercase tracking-wide block mb-3 text-slate-500">Patient Info</strong>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-20 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 flex-1 cursor-pointer"
                >
                  <option disabled>Gender</option>
                  <option>M</option>
                  <option>F</option>
                  <option>Other</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Conditions (e.g. Diabetes)"
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                className="w-full mt-2 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {file && (
              <div className="bg-white/50 backdrop-blur-md border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <strong className="text-xs font-bold uppercase tracking-wide block mb-1 text-slate-500">Ready to Analyze</strong>
                  <p className="text-xs font-bold text-slate-400">1 report selected</p>
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-slate-900/10 hover:shadow-xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze Now'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Results */}
        <div className={`space-y-6 ${analysis ? 'w-full animate-fade-in' : ''}`}>
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-start gap-3 animate-fade-in shadow-sm">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="font-bold text-sm leading-relaxed">{error}</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white/60 backdrop-blur-xl border border-white/60 rounded-[32px] p-8">
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2 animate-pulse">Analyzing Report...</h3>
              <p className="text-slate-500 font-medium text-lg">Extracting medical data & generating insights</p>
            </div>
          )}

          {/* Placeholder if no analysis */}
          {!analysis && !isAnalyzing && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white/40 backdrop-blur-xl border-2 border-dashed border-slate-200 rounded-[32px] p-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-400 font-bold text-lg">Analysis results will appear here</p>
            </div>
          )}

          {/* Results Card */}
          {analysis && !isAnalyzing && (
            <div className="bg-white rounded-[32px] p-8 shadow-xl animate-fade-in border border-slate-100">
              {/* Header */}
              <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border border-blue-100 flex items-center gap-2">
                  <Check className="w-4 h-4" /> Analysis Complete
                </div>
                <div className={`px-4 py-1.5 rounded-lg border text-sm font-bold uppercase tracking-wide shadow-sm flex items-center gap-2 ${analysis.severity === 'red' ? 'bg-red-50 border-red-200 text-red-700' :
                  analysis.severity === 'green' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                    'bg-amber-50 border-amber-200 text-amber-700'
                  }`}>
                  {analysis.severity === 'red' && <AlertCircle className="w-4 h-4" />}
                  {analysis.severity === 'yellow' && <Info className="w-4 h-4" />}
                  {analysis.severity === 'green' && <Check className="w-4 h-4" />}
                  Severity: {analysis.severity}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">Report Analysis</h3>
                <p className="text-slate-400 font-medium">Powered by Gemini 2.5 Flash</p>
              </div>

              {/* Status Banner */}
              <div className={`p-6 rounded-2xl border mb-8 flex items-start gap-4 ${analysis.severity === 'red' ? 'bg-red-50 border-red-100' :
                analysis.severity === 'green' ? 'bg-emerald-50 border-emerald-100' :
                  'bg-amber-50 border-amber-100'
                }`}>
                <div className={`p-2.5 rounded-full shrink-0 ${analysis.severity === 'red' ? 'bg-red-100 text-red-600' :
                  analysis.severity === 'green' ? 'bg-emerald-100 text-emerald-600' :
                    'bg-amber-100 text-amber-600'
                  }`}>
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className={`text-lg font-bold mb-1 flex items-center gap-2 ${analysis.severity === 'red' ? 'text-red-900' :
                    analysis.severity === 'green' ? 'text-emerald-900' :
                      'text-amber-900'
                    }`}>
                    {analysis.severity === 'green' ? 'Report Status: Good' : 'Report Status'}
                    <span className="text-sm font-medium opacity-80">
                      {getSeverityDescription(analysis.severity)}
                    </span>
                  </h4>
                  <p className={`font-medium text-sm md:text-base leading-relaxed ${analysis.severity === 'red' ? 'text-red-800' :
                    analysis.severity === 'green' ? 'text-emerald-800' :
                      'text-amber-800'
                    }`}>
                    {analysis.severity === 'green'
                      ? 'All values appear to be within normal range. Keep up the healthy lifestyle!'
                      : 'Some values require attention. Consult a doctor for professional advice.'}
                  </p>
                </div>
              </div>

              {/* 3 Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Key Findings */}
                <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                  <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold text-lg">
                    <Search className="w-5 h-5 text-slate-400" /> Key Findings
                  </div>
                  <ul className="space-y-3.5">
                    {analysis.keyFindings.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-600">
                        <div className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 shadow-sm ${item.status === 'high' || item.status === 'low' ? 'bg-red-400' : 'bg-emerald-400'
                          }`} />
                        <span className="leading-snug">
                          <span className="text-slate-900 font-semibold">{item.item}</span>
                          {item.status !== 'normal' && <span className="text-slate-400 text-xs ml-1 font-bold">({item.status})</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                  <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold text-lg">
                    <CheckSquare className="w-5 h-5 text-emerald-500" /> Recommendations
                  </div>
                  <ul className="space-y-3.5">
                    {analysis.dos.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-600">
                        <Check className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                    {analysis.donts.map((item, i) => (
                      <li key={`dont-${i}`} className="flex items-start gap-3 text-sm font-medium text-slate-600">
                        <X className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <span className="leading-snug">Avoid {item.toLowerCase()}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Diet & Exercise */}
                <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                  <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold text-lg">
                    <Salad className="w-5 h-5 text-emerald-600" /> Diet & Exercise
                  </div>
                  <div className="space-y-5 text-sm font-medium text-slate-600">
                    <div>
                      <span className="font-bold text-slate-900 block mb-1.5">Eat:</span>
                      <span className="leading-relaxed">{analysis.diet.include.join(', ')}.</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block mb-1.5">Avoid:</span>
                      <span className="leading-relaxed">{analysis.diet.avoid.join(', ')}.</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block mb-1.5">Do:</span>
                      <span className="leading-relaxed">{analysis.exercises.join(', ')}.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    if (analysis) {
                      downloadHealthReport({
                        userName: age && gender !== 'Gender' ? `${gender}, ${age} years` : 'Patient',
                        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                        severity: analysis.severity,
                        keyFindings: analysis.keyFindings,
                        dos: analysis.dos,
                        donts: analysis.donts,
                        exercises: analysis.exercises,
                        diet: analysis.diet
                      });
                    }
                  }}
                  className="flex-1 py-3.5 border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Save PDF
                </button>
                <button
                  onClick={async () => {
                    if (analysis) {
                      const shareText = `HealthWise.AI Report\n\nSeverity: ${analysis.severity.toUpperCase()}\n\nKey Findings:\n${analysis.keyFindings.map(f => `• ${f.item}: ${f.status}`).join('\n')}\n\nRecommendations:\n${analysis.dos.slice(0, 3).map(d => `✓ ${d}`).join('\n')}\n\n${analysis.donts.slice(0, 3).map(d => `✗ Avoid: ${d}`).join('\n')}\n\nGenerated by HealthWise.AI`;

                      if (navigator.share) {
                        try {
                          await navigator.share({
                            title: 'HealthWise.AI Report',
                            text: shareText
                          });
                        } catch (err) {
                          console.log('Share cancelled');
                        }
                      } else {
                        // Fallback: Copy to clipboard
                        try {
                          await navigator.clipboard.writeText(shareText);
                          alert('Report copied to clipboard!');
                        } catch (err) {
                          console.error('Copy failed:', err);
                        }
                      }
                    }
                  }}
                  className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default UploadSection;