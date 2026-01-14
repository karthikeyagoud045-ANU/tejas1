import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, Info } from 'lucide-react';
import { ConditionType, WorkoutRoutine } from '../types';

interface ExercisePlayerProps {
  onExerciseComplete?: (minutes: number) => void;
}

const WORKOUTS: Record<ConditionType, WorkoutRoutine> = {
  [ConditionType.Pregnancy]: {
    badge: 'Pregnancy · Trimester Safe',
    title: 'Prenatal Gentle Flow',
    meta: '10 min · Low Intensity · Mobility & Circulation',
    exercises: [
      { name: 'Seated Pelvic Tilts', duration: 60, instructions: 'Sit on edge of chair. Gently rock pelvis forward and back.' },
      { name: 'Supported Squats', duration: 60, instructions: 'Stand holding chair back. Lower hips slightly, keep chest up.' },
      { name: 'Cat-Cow Stretch', duration: 60, instructions: 'On hands and knees. Gently arch and round spine. Breathe deeply.' },
      { name: 'Side-Lying Leg Lifts', duration: 60, instructions: 'Lie on side, bottom leg bent. Lift top leg slowly.' },
      { name: 'Butterfly Stretch', duration: 60, instructions: 'Sit, soles of feet together. Gently press knees down.' }
    ],
    safety: ['Stop immediately if dizzy', 'Avoid lying flat on back', 'Keep hydration nearby', 'Move slowly between positions'],
    modifications: 'Use a pillow for support under belly or knees.'
  },
  [ConditionType.Diabetes]: {
    badge: 'Diabetes · Glucose Control',
    title: 'Steady Rhythm Routine',
    meta: '12 min · Low-Moderate · Insulin Sensitivity',
    exercises: [
      { name: 'March in Place', duration: 120, instructions: 'Stand tall. March lifting knees to hip height rhythmically.' },
      { name: 'Wall Push-Ups', duration: 60, instructions: 'Face wall, hands shoulder-width. Lower chest to wall, push back.' },
      { name: 'Chair Sit-to-Stand', duration: 60, instructions: 'Sit on chair. Stand up pushing through heels. Sit back down.' },
      { name: 'Side Steps', duration: 60, instructions: 'Step right, bring left foot to meet it. Step left, bring right foot.' },
      { name: 'Calf Raises', duration: 60, instructions: 'Stand holding chair. Lift heels off ground, lower slowly.' }
    ],
    safety: ['Check blood sugar before starting', 'Stop if feeling shaky or weak', 'Wear comfortable footwear'],
    modifications: 'Perform movements seated if balance is unsteady.'
  },
  [ConditionType.Hypertension]: {
    badge: 'Hypertension · Heart Care',
    title: 'Calm Cardio Walk',
    meta: '10 min · Low Impact · Blood Pressure Management',
    exercises: [
      { name: 'Gentle March', duration: 120, instructions: 'March in place at a conversational pace. breathe naturally.' },
      { name: 'Arm Circles', duration: 60, instructions: 'Stand. Slowly circle arms forward, then backward. Keep shoulders down.' },
      { name: 'Heel Digs', duration: 60, instructions: 'Tap heel forward, alternating legs. Keep knees soft.' },
      { name: 'Chair Torso Twist', duration: 60, instructions: 'Sit tall. Gently twist torso to right, then left. Do not force.' },
      { name: 'Slow Deep Breathing', duration: 60, instructions: 'Inhale 4 counts, exhale 4 counts. Focus on relaxing tension.' }
    ],
    safety: ['Do not hold your breath (Valsalva)', 'Avoid sudden changes in head position', 'Keep intensity moderate'],
    modifications: 'Rest between exercises if heart rate feels too high.'
  },
  [ConditionType.Arthritis]: {
    badge: 'Arthritis · Joint Relief',
    title: 'Morning Mobility',
    meta: '8 min · Gentle · Stiffness Reduction',
    exercises: [
      { name: 'Hand & Finger Openers', duration: 60, instructions: 'Clench fist gently, then spread fingers wide. Repeat.' },
      { name: 'Wrist Rolls', duration: 60, instructions: 'Interlace fingers. Roll wrists in figure-8 motion.' },
      { name: 'Seated Knee Extension', duration: 60, instructions: 'Sit. Straighten one leg, hold 3s, lower. Alternate.' },
      { name: 'Ankle Pumps', duration: 60, instructions: 'Sit/Lie. Point toes away, then pull toes toward shins.' },
      { name: 'Shoulder Shrugs', duration: 60, instructions: 'Lift shoulders to ears, roll back and down.' }
    ],
    safety: ['Move within pain-free range', 'Stop if sharp pain occurs', 'Warmth helps joints before starting'],
    modifications: 'Reduce range of motion if stiffness is severe.'
  },
  [ConditionType.BackPain]: {
    badge: 'Back Care · Spine Health',
    title: 'Core & Stability',
    meta: '10 min · Mat Work · Back Strength',
    exercises: [
      { name: 'Pelvic Tilts', duration: 60, instructions: 'Lie on back, knees bent. Press lower back into floor, release.' },
      { name: 'Single Knee to Chest', duration: 60, instructions: 'Lie on back. Hug one knee to chest gently. Hold, switch.' },
      { name: 'Glute Bridges', duration: 60, instructions: 'Lie on back, knees bent. Lift hips until body is in line. Lower.' },
      { name: 'Bird Dog (Modified)', duration: 60, instructions: 'Hands/knees. Lift opposite arm and leg. Keep spine neutral.' },
      { name: 'Child’s Pose', duration: 60, instructions: 'Kneel, sit back on heels. Stretch arms forward on floor.' }
    ],
    safety: ['Avoid twisting under load', 'Keep movements slow and controlled', 'Stop if pain radiates down leg'],
    modifications: 'Place cushion under knees for comfort.'
  },
  [ConditionType.Cardiac]: {
    badge: 'Cardiac · Recovery',
    title: 'Gradual Return',
    meta: '10 min · Very Low · Heart Recovery',
    exercises: [
        {name: 'Seated March', duration: 120, instructions: 'Sit comfortably. March feet rhythmically.'},
        {name: 'Seated Arm Raises', duration: 60, instructions: 'Lift arms to shoulder height, lower slowly.'},
        {name: 'Ankle Circles', duration: 60, instructions: 'Rotate ankles in circles to improve circulation.'},
        {name: 'Shoulder Rolls', duration: 60, instructions: 'Roll shoulders back and down to open chest.'},
        {name: 'Rest & Monitor', duration: 60, instructions: 'Sit quietly, check pulse and breathing.'}
    ],
    safety: ['Stop if chest pain/tightness', 'Consult doctor before progressing', 'Monitor breathing'],
    modifications: 'Perform all exercises seated.'
  }
};

const ExercisePlayer: React.FC<ExercisePlayerProps> = ({ onExerciseComplete }) => {
  const [condition, setCondition] = useState<ConditionType>(ConditionType.Pregnancy);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);

  const workout = WORKOUTS[condition];
  const currentExercise = workout.exercises[currentIdx];

  // Initialize
  useEffect(() => {
    setCurrentIdx(0);
    setIsPlaying(false);
    if (WORKOUTS[condition] && WORKOUTS[condition].exercises.length > 0) {
        setTimeRemaining(WORKOUTS[condition].exercises[0].duration);
    }
  }, [condition]);

  // Exercise Change
  useEffect(() => {
    if (currentExercise) {
        setTimeRemaining(currentExercise.duration);
        setIsPlaying(false);
    }
  }, [currentExercise]);

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isPlaying) {
      setIsPlaying(false);
      
      // LOGIC: Exercise Complete
      if (onExerciseComplete) {
        // Simple heuristic: add minutes equal to duration / 60
        onExerciseComplete(currentExercise.duration / 60);
      }

      if (autoAdvance && currentIdx < workout.exercises.length - 1) {
        setCurrentIdx(prev => prev + 1);
        setIsPlaying(true);
      }
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeRemaining, autoAdvance, currentIdx, workout.exercises.length, currentExercise.duration, onExerciseComplete]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const totalTime = workout.exercises.reduce((acc, curr) => acc + curr.duration, 0);
  const elapsedTime = workout.exercises.slice(0, currentIdx).reduce((acc, curr) => acc + curr.duration, 0) + (currentExercise.duration - timeRemaining);

  return (
    <section className="py-8 animate-fade-in">
      {/* Selector Dropdown */}
      <div className="mb-8">
        <select 
          value={condition}
          onChange={(e) => setCondition(e.target.value as ConditionType)}
          className="px-6 py-4 border border-white/60 rounded-2xl bg-white/60 backdrop-blur-md text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm cursor-pointer hover:border-blue-300 transition-colors min-w-[280px]"
        >
          {Object.entries(WORKOUTS).map(([key, data]) => (
            <option key={key} value={key}>{data.badge.split(' · ')[0]}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Exercises List */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-sm">
          <div className="mb-6">
             <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wide rounded-full mb-3 border border-blue-100">
                {workout.badge}
             </div>
             <h3 className="text-2xl font-extrabold text-slate-900 leading-tight mb-2 tracking-tight">{workout.title}</h3>
             <p className="text-sm text-slate-600 font-medium">{workout.meta}</p>
          </div>

          <div className="border border-white/60 rounded-2xl overflow-hidden bg-white/30 backdrop-blur-sm">
            <div className="bg-slate-50/80 px-4 py-3 border-b border-white/60 font-bold text-xs uppercase tracking-wide text-slate-500 backdrop-blur-sm">
              Sequence
            </div>
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-3 space-y-2">
              {workout.exercises.map((ex, idx) => (
                <div 
                  key={idx}
                  onClick={() => { setCurrentIdx(idx); setIsPlaying(false); }}
                  className={`px-4 py-3 flex items-center justify-between cursor-pointer rounded-2xl border transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    idx === currentIdx 
                      ? 'bg-white border-blue-100 shadow-[0_8px_20px_-6px_rgba(59,130,246,0.15)] scale-[1.02] -translate-y-0.5 relative z-10' 
                      : 'bg-transparent border-transparent hover:bg-white/40 hover:border-white/40 hover:translate-x-1'
                  } ${
                    idx < currentIdx ? 'opacity-50 saturate-0 bg-slate-100/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm transition-all duration-300 ${
                      idx === currentIdx 
                        ? 'bg-blue-600 text-white scale-110 shadow-blue-500/30' 
                        : idx < currentIdx 
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-white text-slate-400'
                    }`}>
                      {idx < currentIdx ? '✓' : idx + 1}
                    </div>
                    <span className={`font-bold text-sm transition-colors duration-300 ${idx === currentIdx ? 'text-blue-900' : 'text-slate-600'}`}>
                      {ex.name}
                    </span>
                  </div>
                  <span className={`text-xs font-bold tabular-nums transition-colors duration-300 ${idx === currentIdx ? 'text-blue-500' : 'text-slate-400'}`}>
                    {formatDuration(ex.duration)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: Timer Player */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-sm flex flex-col items-center justify-center min-h-[520px]">
           <div className="relative w-80 h-80 mb-10 flex items-center justify-center">
              {/* Outer Shadow Ring */}
              <div className="absolute inset-4 rounded-full shadow-[0_12px_30px_rgba(0,0,0,0.06)] bg-white/40 backdrop-blur-sm"></div>
              
              <svg className="w-full h-full transform -rotate-90 overflow-visible drop-shadow-sm" viewBox="0 0 100 100">
                {/* Background Card Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  className="text-white/80"
                  fill="currentColor"
                />
                 {/* Track */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="text-slate-200"
                  stroke="currentColor"
                  strokeWidth="5"
                  fill="none"
                />
                {/* Progress */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="text-blue-500 transition-all duration-1000 ease-linear drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                  stroke="currentColor"
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - (timeRemaining / currentExercise.duration))}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <span className="text-8xl font-extrabold text-slate-900 tabular-nums tracking-tighter drop-shadow-sm">
                  {formatTime(timeRemaining)}
                </span>
                <span className="text-lg font-bold text-slate-500 mt-3 text-center px-4 leading-tight tracking-tight">
                  {currentExercise.name}
                </span>
              </div>
           </div>

           <div className="w-full max-w-xs space-y-4">
             <div className="flex gap-4">
               <button 
                 onClick={() => setIsPlaying(!isPlaying)}
                 className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
               >
                 {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                 {isPlaying ? 'Pause' : 'Start'}
               </button>
               <button 
                 onClick={() => {
                    if (currentIdx < workout.exercises.length - 1) {
                      setCurrentIdx(prev => prev + 1);
                      setIsPlaying(false);
                    }
                 }}
                 disabled={currentIdx === workout.exercises.length - 1}
                 className="flex-1 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
               >
                 <SkipForward className="w-5 h-5" />
                 Next
               </button>
             </div>
             
             <div className="flex gap-4">
               <button 
                 onClick={() => setAutoAdvance(!autoAdvance)}
                 className={`flex-1 py-3 border rounded-2xl text-xs font-bold uppercase tracking-wide transition-all backdrop-blur-sm ${
                   autoAdvance 
                    ? 'bg-blue-50/50 border-blue-200 text-blue-600' 
                    : 'bg-white/40 border-white/60 text-slate-500 hover:bg-white/60'
                 }`}
               >
                 Auto-advance {autoAdvance ? 'ON' : 'OFF'}
               </button>
               <button 
                 onClick={() => setShowInstructions(!showInstructions)}
                 className={`flex-1 py-3 border rounded-2xl text-xs font-bold uppercase tracking-wide transition-all backdrop-blur-sm flex items-center justify-center gap-1.5 ${
                    showInstructions 
                        ? 'bg-slate-100/50 border-slate-300 text-slate-800' 
                        : 'bg-white/40 border-white/60 text-slate-500 hover:bg-white/60'
                 }`}
               >
                 <Info className="w-3.5 h-3.5" /> Instructions
               </button>
             </div>
           </div>
           
           {showInstructions && (
             <div className="mt-6 p-5 bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 text-sm font-semibold text-slate-700 w-full animate-fade-in text-center shadow-sm leading-relaxed">
               {currentExercise.instructions}
             </div>
           )}
        </div>

        {/* Right Column: Info Cards */}
        <div className="flex flex-col gap-6">
          {/* Safety Card */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-sm">
             <h3 className="font-bold text-lg text-slate-900 mb-4 tracking-tight">Safety First</h3>
             <ul className="space-y-3">
               {workout.safety.map((item, i) => (
                 <li key={i} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0 shadow-[0_0_5px_rgba(0,0,0,0.1)]" />
                   {item}
                 </li>
               ))}
             </ul>
          </div>

          {/* Modifications Card */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-sm">
             <h3 className="font-bold text-lg text-slate-900 mb-2 tracking-tight">Modifications</h3>
             <p className="text-sm text-slate-600 leading-relaxed font-medium">
               {workout.modifications}
             </p>
          </div>

          {/* Progress Card */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-sm">
             <h3 className="font-bold text-lg text-slate-900 mb-4 tracking-tight">Session Progress</h3>
             <div className="h-4 bg-slate-100 rounded-full overflow-hidden mb-3 backdrop-blur-sm border border-slate-200">
               <div 
                 className="h-full bg-slate-200 transition-all duration-500" 
                 style={{ width: '100%' }}
               >
                  <div 
                    className="h-full bg-slate-800 transition-all duration-500 shadow-sm"
                    style={{ width: `${(elapsedTime / totalTime) * 100}%` }}
                  />
               </div>
             </div>
             <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">
               {currentIdx} / {workout.exercises.length} exercises · {formatDuration(elapsedTime)} / {formatDuration(totalTime)}
             </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ExercisePlayer;