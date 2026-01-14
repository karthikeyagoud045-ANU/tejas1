import React from 'react';
import { AlertCircle, Search, CheckSquare, Salad, Check, X } from 'lucide-react';

interface HeroProps {
   onUploadClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onUploadClick }) => {
   return (
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-500 via-cyan-500 to-violet-600 animate-gradient rounded-[32px] p-8 md:p-12 mb-12 shadow-[0_20px_60px_rgba(59,130,246,0.2)]">
         {/* Abstract Shapes */}
         <div className="absolute -top-16 -right-20 w-80 h-80 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
         <div className="absolute -bottom-20 -left-28 w-80 h-80 rounded-full bg-purple-400/20 blur-3xl pointer-events-none" />

         <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">

            {/* Left Column: Text Content */}
            <div className="text-left space-y-8">
               <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-[1.1] tracking-tight drop-shadow-sm">
                  Your Medical Reports,<br />
                  <span className="text-blue-50">Simplified by AI</span>
               </h1>
               <p className="text-blue-50 text-lg md:text-xl font-medium leading-relaxed max-w-lg drop-shadow-sm opacity-95">
                  Upload your medical reports and get personalized health recommendations, dietary guidance, and condition-specific exercises—all powered by Gemini.
               </p>
               <div className="flex flex-col sm:flex-row gap-4 pt-2 w-full sm:w-auto">
                  <button
                     onClick={onUploadClick}
                     aria-label="Upload your medical report"
                     className="px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_32px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 tracking-wide w-full sm:w-auto"
                  >
                     Upload Report
                  </button>
                  <button
                     onClick={onUploadClick}
                     aria-label="Watch a demo of the application"
                     className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white font-bold rounded-2xl hover:bg-white/20 transition-all duration-300 active:scale-95 tracking-wide w-full sm:w-auto text-center"
                  >
                     See Demo
                  </button>
               </div>
            </div>

            {/* Right Column: AI Dashboard Preview Card (Static Mock of Analysis Result) */}
            <div className="relative hidden lg:block perspective-1000" aria-hidden="true">
               {/* Floating glow behind */}
               <div className="absolute inset-0 bg-white/20 blur-2xl rounded-[32px] transform rotate-2 scale-95 pointer-events-none"></div>

               <div className="bg-white/95 backdrop-blur-xl rounded-[24px] p-6 shadow-2xl border border-white/40 relative transform transition-transform hover:scale-[1.01] duration-500">

                  {/* Header Badges */}
                  <div className="flex justify-between items-center mb-4">
                     <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm border border-blue-100">
                        Analysis Complete
                     </div>
                     <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-lg border border-amber-200 text-[10px] font-bold uppercase tracking-wide shadow-sm flex items-center gap-1">
                        <span>⚠️</span> Severity: YELLOW
                     </div>
                  </div>

                  {/* Title */}
                  <div className="mb-4">
                     <h3 className="text-xl font-bold text-slate-900 leading-tight">Report Analysis</h3>
                     <p className="text-xs text-slate-400 font-medium">Powered by Gemini 2.5 Flash</p>
                  </div>

                  {/* Warning Banner */}
                  <div className="p-3 rounded-xl border mb-4 flex items-start gap-3 bg-amber-50 border-amber-100">
                     <div className="p-1.5 rounded-full shrink-0 bg-amber-100 text-amber-600">
                        <AlertCircle className="w-4 h-4" />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-amber-900">Report Status</h4>
                        <p className="font-medium text-[10px] text-amber-800 leading-snug">
                           Some values require attention. Consult a doctor.
                        </p>
                     </div>
                  </div>

                  {/* Grid Content (Simplified for Preview) */}
                  <div className="grid grid-cols-2 gap-3">
                     {/* Key Findings */}
                     <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 col-span-1">
                        <div className="flex items-center gap-1.5 mb-2 text-slate-900 font-bold text-xs">
                           <Search className="w-3.5 h-3.5 text-slate-400" /> Key Findings
                        </div>
                        <ul className="space-y-1.5">
                           {['MCV', 'Absolute Basophils', 'Triiodothyronine (TT3)', 'Thyroxine (TT4)'].map((item, i) => (
                              <li key={i} className="flex items-center gap-2 text-[10px] font-medium text-slate-600">
                                 <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-red-400" />
                                 <span className="truncate">{item}</span>
                              </li>
                           ))}
                        </ul>
                     </div>

                     {/* Recommendations & Diet Combined for space */}
                     <div className="space-y-3 col-span-1">
                        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                           <div className="flex items-center gap-1.5 mb-2 text-slate-900 font-bold text-xs">
                              <CheckSquare className="w-3.5 h-3.5 text-emerald-500" /> Recommendations
                           </div>
                           <ul className="space-y-1.5">
                              <li className="flex items-start gap-1.5 text-[10px] font-medium text-slate-600 leading-tight">
                                 <Check className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                                 <span>Consult healthcare prof...</span>
                              </li>
                              <li className="flex items-start gap-1.5 text-[10px] font-medium text-slate-600 leading-tight">
                                 <X className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                                 <span>Avoid strenuous activity</span>
                              </li>
                           </ul>
                        </div>

                        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                           <div className="flex items-center gap-1.5 mb-2 text-slate-900 font-bold text-xs">
                              <Salad className="w-3.5 h-3.5 text-emerald-600" /> Diet & Exercise
                           </div>
                           <div className="space-y-1 text-[10px] font-medium text-slate-600 leading-tight">
                              <div><span className="font-bold text-slate-900">Eat:</span> Fluids, soups...</div>
                              <div><span className="font-bold text-slate-900">Do:</span> Light walking...</div>
                           </div>
                        </div>
                     </div>
                  </div>

               </div>
            </div>

         </div>
      </section>
   );
};

export default Hero;