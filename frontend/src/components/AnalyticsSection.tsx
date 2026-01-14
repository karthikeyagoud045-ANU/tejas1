import React, { useState, useEffect } from 'react';
import { Heart, Clock, CheckCircle2 } from 'lucide-react';

interface AnalyticsSectionProps {
  water: number;
  exercisesCompleted: number;
  streak: number;
  calories: number;
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ water, exercisesCompleted, streak, calories }) => {
  const [timeLeft, setTimeLeft] = useState('');

  // Update countdown to midnight every second
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();

      const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hrs}h ${mins}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute is enough
    return () => clearInterval(interval);
  }, []);

  const WATER_GOAL = 8;
  const EXERCISE_GOAL_COUNT = 3;
  const CALORIE_GOAL = 2200;

  return (
    <div className="animate-fade-in space-y-16">
      <section className="py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Progress & Analytics</h2>
          <p className="text-slate-600 font-medium text-lg">24-hour goals • Streaks • Activity Stats</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* Card 1: Today's Goals */}
          <div className="bg-white/90 border border-slate-200 rounded-[28px] p-8 shadow-sm backdrop-blur-md">
            <div className="flex justify-between items-start mb-8">
               <h3 className="font-bold text-xl text-slate-900 tracking-tight">Today's Goals</h3>
               <span className="text-[11px] font-bold uppercase tracking-wide text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">Resets in {timeLeft}</span>
            </div>
            
            <div className="space-y-8">
              {/* Water Goal */}
              <div>
                  <div className="flex justify-between text-xs mb-3 font-bold uppercase tracking-wide text-slate-500">
                    <span className="flex items-center gap-2">💧 Hydration</span>
                    <span className="text-slate-900">{water}/{WATER_GOAL} Cups</span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-700 ease-out shadow-sm" 
                      style={{ width: `${Math.min(100, (water / WATER_GOAL) * 100)}%` }}
                    ></div>
                  </div>
              </div>

              {/* Nutrition Goal */}
              <div>
                  <div className="flex justify-between text-xs mb-3 font-bold uppercase tracking-wide text-slate-500">
                    <span className="flex items-center gap-2">🥗 Calories</span>
                    <span className="text-slate-900">{calories}/{CALORIE_GOAL} kcal</span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className={`h-full transition-all duration-700 ease-out shadow-sm ${calories > CALORIE_GOAL ? 'bg-orange-500' : 'bg-purple-500'}`} 
                      style={{ width: `${Math.min(100, (calories / CALORIE_GOAL) * 100)}%` }}
                    ></div>
                  </div>
              </div>

              {/* Exercise Goal */}
              <div>
                  <div className="flex justify-between text-xs mb-3 font-bold uppercase tracking-wide text-slate-500">
                    <span className="flex items-center gap-2">💪 Exercises</span>
                    <span className="text-slate-900">{exercisesCompleted}/{EXERCISE_GOAL_COUNT} Done</span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-700 ease-out shadow-sm" 
                      style={{ width: `${Math.min(100, (exercisesCompleted / EXERCISE_GOAL_COUNT) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 font-medium">Complete 3 exercises to maintain streak.</p>
              </div>
            </div>
          </div>

          {/* Card 2: Streak */}
          <div className="bg-white/90 border border-slate-200 rounded-[28px] p-8 shadow-sm backdrop-blur-md flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xl text-slate-900 tracking-tight mb-2">Current Streak</h3>
                <p className="text-slate-600 text-sm font-medium">Keep your momentum going!</p>
              </div>
              
              <div className="flex items-center gap-5 my-6">
                 <span className="text-7xl font-extrabold text-slate-900 tracking-tighter">{streak}</span>
                 <div className="flex flex-col">
                    <span className="text-xl font-bold text-slate-800">Days</span>
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-wide bg-emerald-50 px-2 py-0.5 rounded-md w-fit">Active</span>
                 </div>
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between text-xs font-bold uppercase tracking-wide text-slate-500">
                    <span>Daily Progress</span>
                    <span className={exercisesCompleted >= EXERCISE_GOAL_COUNT ? 'text-emerald-600' : 'text-orange-500'}>
                        {exercisesCompleted >= EXERCISE_GOAL_COUNT ? 'Streak Safe' : 'At Risk'}
                    </span>
                 </div>
                 <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                   <div 
                     className={`h-full w-[70%] ${exercisesCompleted >= EXERCISE_GOAL_COUNT ? 'bg-emerald-500' : 'bg-orange-400 animate-pulse'}`}
                     style={{ width: `${Math.min(100, (exercisesCompleted / EXERCISE_GOAL_COUNT) * 100)}%` }}
                   ></div>
                 </div>
              </div>
          </div>

          {/* Card 3: Active Routine Name */}
          <div className="bg-white/90 border border-slate-200 rounded-[28px] p-8 shadow-sm backdrop-blur-md flex flex-col">
              <div className="flex justify-between items-start mb-6">
                 <h3 className="font-bold text-xl text-slate-900 tracking-tight">Active Routine</h3>
                 <span className="text-[11px] font-bold uppercase tracking-wide text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">Cardiac Recovery</span>
              </div>
              
              <div className="flex-1 flex flex-col w-full">
                 <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 shrink-0">
                       <Heart className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-slate-900 leading-tight">Gradual Return</h4>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wide mt-1">Very Low Intensity</p>
                    </div>
                 </div>

                 <div className="space-y-2">
                    {[
                        'Seated March',
                        'Seated Arm Raises',
                        'Ankle Circles',
                        'Shoulder Rolls',
                        'Rest & Monitor'
                    ].map((exercise, index) => (
                       <div key={index} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold shrink-0 border border-slate-200">
                             {index + 1}
                          </span>
                          <span className="text-sm font-semibold text-slate-700">{exercise}</span>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wide">
                 <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> ~10 Min</span>
                 <span className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5" /> 5 Exercises</span>
              </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AnalyticsSection;