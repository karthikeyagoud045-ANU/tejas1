import React, { useState } from 'react';
import { Twitter, Instagram, X, Mail, User, ShieldCheck, Lock, FileCheck } from 'lucide-react';

const Footer: React.FC = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const teamContacts = [
    { name: 'Karthikeya', email: 'ukarthikeyagoud2007@gmail.com' },
    { name: 'Aishwanth', email: 'tungaturtiaishu@gmail.com' },
    { name: 'Vinuthna', email: 'kurallachathurya@gmail.com' }
  ];

  return (
    <div className="mt-auto relative">
      {/* Team Section */}
      <section className="py-16 text-center">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Built by Team Gen Spark</h2>
          <p className="text-slate-500 font-medium">Hackathon Project • Powered by Innovation & AI</p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 mb-12 px-4">
          {/* Synchronized names with contact list for consistency */}
          {['Aishwanth', 'Karthikeya', 'Vinuthna'].map((name) => (
            <div key={name} className="bg-white border border-slate-100 w-80 py-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all cursor-default">
              <strong className="block text-lg text-slate-900 mb-1">{name}</strong>
              <span className="text-sm text-slate-500">Team Member</span>
            </div>
          ))}
        </div>

        {/* Security & Trust Badges */}
        <div className="mb-12 max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-800 text-sm">Secure Data</p>
                <p className="text-xs text-slate-500">End-to-End Encrypted</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                <Lock className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-800 text-sm">Privacy First</p>
                <p className="text-xs text-slate-500">HIPAA Compliant Protocols</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-full">
                <FileCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-800 text-sm">AI Verification</p>
                <p className="text-xs text-slate-500">Dual-layer Analysis</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-50 text-blue-600 font-bold text-sm border border-blue-100 shadow-sm">
            <span>🚀</span> Team Gen Spark - Innovating Healthcare with AI
          </div>
        </div>
      </section>

      {/* Dark Footer Bar */}
      <footer className="bg-slate-900 text-slate-300 py-8">
        <div className="w-[92%] max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm font-medium">
            © 2025 Team Gen Spark • Hackathon Project
          </div>

          <div className="flex gap-8 text-sm text-slate-400 flex-wrap justify-center">
            <button
              onClick={() => setShowAbout(true)}
              className="hover:text-white transition-colors focus:outline-none"
            >
              About
            </button>
            <button
              onClick={() => setShowPrivacy(true)}
              className="hover:text-white transition-colors focus:outline-none"
            >
              Privacy
            </button>
            <button
              onClick={() => setShowTerms(true)}
              className="hover:text-white transition-colors focus:outline-none"
            >
              Terms
            </button>
            <button
              onClick={() => setShowContact(true)}
              className="hover:text-white transition-colors focus:outline-none"
            >
              Contact
            </button>
            <a
              href="mailto:ukarthikeyagoud2007@gmail.com?subject=HealthWise%20AI%20Feedback"
              className="hover:text-white transition-colors text-blue-400 hover:text-blue-300 font-medium"
            >
              Feedback
            </a>
          </div>

          <div className="flex gap-3">
            <a
              href="#"
              className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="https://www.instagram.com/aishwanth_315?igsh=MThoM3FnMzM1dGp5eQ=="
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Privacy Policy</h2>
              <button
                onClick={() => setShowPrivacy(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="prose prose-slate text-slate-600 leading-relaxed text-sm overflow-y-auto">
              <p>
                HealthWise.ai respects your privacy and is committed to protecting your personal and health information. We collect only the information necessary to provide healthcare services, including personal details, health records, and app usage data. This information is used to deliver features, improve user experience, ensure security, and comply with legal requirements. Your data is stored securely using industry-standard safeguards, and we do not sell or misuse your personal or medical information. Information may be shared only with authorized healthcare professionals, trusted service providers, or legal authorities when required and only with your consent or as mandated by law. Users have the right to access, update, or request deletion of their data at any time. By using this application, you agree to the collection and use of information in accordance with this Privacy Policy.
              </p>
            </div>

            <div className="mt-6 flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowPrivacy(false)}
                className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Contact Us</h2>
              <button
                onClick={() => setShowContact(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {teamContacts.map((contact, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-4">
                  <div className="bg-blue-100 p-2.5 rounded-full text-blue-600 mt-0.5">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900">{contact.name}</h3>
                    <a href={`mailto:${contact.email}`} className="text-sm text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1.5 mt-0.5 break-all">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      {contact.email}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowContact(false)}
                className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">About HealthWise.AI</h2>
              <button
                onClick={() => setShowAbout(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="prose prose-slate text-slate-600 leading-relaxed text-sm overflow-y-auto space-y-4">
              <p>
                <strong>HealthWise.AI</strong> is an innovative AI-powered healthcare platform designed to make health management accessible, intelligent, and personalized for everyone.
              </p>

              <h3 className="text-lg font-bold text-slate-900 mt-4">🎯 Our Mission</h3>
              <p>
                To democratize healthcare insights by leveraging cutting-edge AI technology, helping individuals understand their health reports, track nutrition, and make informed wellness decisions.
              </p>

              <h3 className="text-lg font-bold text-slate-900 mt-4">✨ Key Features</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>AI-powered medical report analysis</li>
                <li>Personalized nutrition tracking & insights</li>
                <li>Smart medication reminders</li>
                <li>Doctor finder with real recommendations</li>
                <li>Multi-language chatbot support (11+ languages)</li>
                <li>Exercise & wellness tracking</li>
              </ul>

              <h3 className="text-lg font-bold text-slate-900 mt-4">🏆 Built by Team Gen Spark</h3>
              <p>
                Created as a hackathon project, HealthWise.AI represents our vision of making healthcare smarter and more accessible. Our team combines expertise in AI, healthcare, and user experience design.
              </p>

              <h3 className="text-lg font-bold text-slate-900 mt-4">🤖 Technology</h3>
              <p>
                Powered by Google Gemini AI with multi-provider fallback support, React for the frontend, and secure cloud infrastructure for data protection.
              </p>
            </div>

            <div className="mt-6 flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowAbout(false)}
                className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Terms of Service</h2>
              <button
                onClick={() => setShowTerms(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="prose prose-slate text-slate-600 leading-relaxed text-sm overflow-y-auto space-y-4">
              <p className="font-medium">
                By using HealthWise.AI, you agree to the following terms:
              </p>

              <h3 className="text-lg font-bold text-slate-900 mt-4">1. Medical Disclaimer</h3>
              <p>
                HealthWise.AI provides AI-generated health insights for informational purposes only. It is <strong>NOT</strong> a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for medical decisions.
              </p>

              <h3 className="text-lg font-bold text-slate-900 mt-4">2. User Responsibilities</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Provide accurate information for personalized insights</li>
                <li>Do not use the platform for emergency medical situations</li>
                <li>Seek immediate medical attention for serious symptoms</li>
                <li>Use the app responsibly and for personal health tracking only</li>
              </ul>

              <h3 className="text-lg font-bold text-slate-900 mt-4">3. AI Limitations</h3>
              <p>
                Our AI can make mistakes. Analysis results should be verified with healthcare professionals. The AI does not have access to your complete medical history and cannot replace in-person consultations.
              </p>

              <h3 className="text-lg font-bold text-slate-900 mt-4">4. Data Usage</h3>
              <p>
                Your health data is used solely to provide personalized insights within the app. We do not sell or share your personal health information with third parties for marketing purposes.
              </p>

              <h3 className="text-lg font-bold text-slate-900 mt-4">5. Service Availability</h3>
              <p>
                As a hackathon project, HealthWise.AI is provided "as is" without warranties. We strive for uptime but cannot guarantee uninterrupted service.
              </p>

              <h3 className="text-lg font-bold text-slate-900 mt-4">6. Updates to Terms</h3>
              <p>
                These terms may be updated periodically. Continued use of the platform constitutes acceptance of any changes.
              </p>

              <p className="text-xs text-slate-400 mt-4">
                Last updated: January 2025
              </p>
            </div>

            <div className="mt-6 flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowTerms(false)}
                className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Footer;