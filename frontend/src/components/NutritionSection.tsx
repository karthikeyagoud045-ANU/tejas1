import React, { useState, useEffect, useRef } from 'react';
import { Plus, TrendingUp, Droplet, Flame, AlertCircle, Trash2, Utensils, Camera, Loader2, Sparkles, ChevronDown, ChevronUp, Apple, Beef, Cookie } from 'lucide-react';
import { analyzeMeal } from '../services/geminiService';
import { Meal } from '../types';

interface NutritionSectionProps {
  water: number;
  onAddWater: () => void;
  streak: number;
  meals: Meal[];
  setMeals: React.Dispatch<React.SetStateAction<Meal[]>>;
}

const NutritionSection: React.FC<NutritionSectionProps> = ({ water, onAddWater, streak, meals, setMeals }) => {
  // --- State Management ---
  const [history, setHistory] = useState<number[]>([65, 68, 72, 70, 75, 78, 0]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isAnalyzingMeal, setIsAnalyzingMeal] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [waterRipple, setWaterRipple] = useState(false);
  const [celebrationMode, setCelebrationMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Constants
  const WATER_GOAL = 8;
  const CALORIE_GOAL = 2200;
  const PROTEIN_GOAL = 150; // grams
  const CARBS_GOAL = 250; // grams
  const FAT_GOAL = 70; // grams

  // --- Calculations ---
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFat = meals.reduce((sum, meal) => sum + meal.fat, 0);

  // Dynamic Score Calculation (0-100)
  const waterScore = Math.min(100, (water / WATER_GOAL) * 100);
  const calorieScore = Math.min(100, (totalCalories / CALORIE_GOAL) * 100);
  const calorieAdjusted = totalCalories > CALORIE_GOAL ? Math.max(0, 100 - ((totalCalories - CALORIE_GOAL) / 500 * 20)) : calorieScore;

  const overallScore = Math.round(
    (waterScore * 0.3) +
    (calorieAdjusted * 0.4) +
    (Math.min(meals.length, 3) / 3 * 30)
  );

  // Macro percentages
  const proteinProgress = Math.min(100, (totalProtein / PROTEIN_GOAL) * 100);
  const carbsProgress = Math.min(100, (totalCarbs / CARBS_GOAL) * 100);
  const fatProgress = Math.min(100, (totalFat / FAT_GOAL) * 100);

  // Update history state for the chart
  useEffect(() => {
    setHistory(prev => {
      const newHistory = [...prev];
      newHistory[6] = overallScore;
      return newHistory;
    });
  }, [overallScore]);

  // Confetti effect on goal
  useEffect(() => {
    if (overallScore >= 90 && !celebrationMode) {
      setCelebrationMode(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [overallScore, celebrationMode]);

  // Water celebration
  useEffect(() => {
    if (water >= WATER_GOAL && !celebrationMode) {
      setCelebrationMode(true);
    }
  }, [water, celebrationMode]);

  // --- Actions ---
  const removeMeal = (id: number) => {
    setMeals(prev => prev.filter(m => m.id !== id));
  };

  const handleMealUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingMeal(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const result = await analyzeMeal(base64Data, file.type);

        const newMeal: Meal = {
          id: Date.now(),
          name: result.meal_name,
          calories: result.total_calories,
          protein: result.macros?.protein || 0,
          carbs: result.macros?.carbs || 0,
          fat: result.macros?.fat || 0,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMeals(prev => [...prev, newMeal]);
      };
    } catch (error) {
      console.error("Error analyzing meal", error);
      alert("Could not analyze meal image. Please try again.");
    } finally {
      setIsAnalyzingMeal(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleWaterClick = () => {
    onAddWater();
    setWaterRipple(true);
    setTimeout(() => setWaterRipple(false), 600);
  };

  // --- Helpers for Visuals ---
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-blue-500 via-indigo-500 to-violet-600';
    if (score >= 60) return 'from-emerald-400 via-teal-500 to-cyan-600';
    if (score >= 40) return 'from-amber-400 via-orange-500 to-red-500';
    return 'from-red-400 via-rose-500 to-pink-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'OUTSTANDING';
    if (score >= 80) return 'EXCELLENT';
    if (score >= 60) return 'GOOD';
    if (score >= 40) return 'FAIR';
    return 'NEEDS WORK';
  };

  // SVG Circular Progress logic
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  // Macro ring dimensions
  const macroRadius = 45;
  const macroCircumference = 2 * Math.PI * macroRadius;

  const getMacroStroke = (progress: number) => macroCircumference - (progress / 100) * macroCircumference;

  // AI Insights - includes daily rotating tips that change at midnight
  const getAIInsights = () => {
    const insights = [];

    // Get today's date seed for consistent daily rotation
    const today = new Date();
    const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

    // Daily rotating health tips pool
    const dailyTipPool = [
      { message: 'Start your day with warm lemon water', suggestions: ['Boosts metabolism', 'Aids digestion', 'Rich in Vitamin C'], icon: Droplet },
      { message: 'Include colorful vegetables in every meal', suggestions: ['Bell peppers', 'Spinach', 'Carrots', 'Beetroot'], icon: Apple },
      { message: 'Try mindful eating today - chew slowly', suggestions: ['Put fork down between bites', 'No screens while eating', 'Savor each bite'], icon: Utensils },
      { message: 'Add fermented foods for gut health', suggestions: ['Yogurt', 'Kimchi', 'Sauerkraut', 'Kefir'], icon: Apple },
      { message: 'Healthy fats are essential - include them today', suggestions: ['Avocado', 'Nuts', 'Olive oil', 'Fatty fish'], icon: Cookie },
      { message: 'Reduce sugar intake for better energy levels', suggestions: ['Choose whole fruits', 'Read labels', 'Avoid sugary drinks'], icon: AlertCircle },
      { message: 'Fiber is key - aim for 25-30g daily', suggestions: ['Oats', 'Beans', 'Broccoli', 'Chia seeds'], icon: Apple },
      { message: 'Pre-plan your meals to avoid unhealthy choices', suggestions: ['Meal prep Sundays', 'Keep healthy snacks ready', 'Pack lunch'], icon: Utensils },
      { message: 'Stay consistent with meal timings', suggestions: ['Eat at regular intervals', 'Avoid late night eating', 'Don\'t skip meals'], icon: TrendingUp },
      { message: 'Balance your plate - protein, carbs, veggies', suggestions: ['50% vegetables', '25% protein', '25% whole grains'], icon: Beef },
      { message: 'Omega-3s boost brain health', suggestions: ['Salmon', 'Walnuts', 'Flaxseeds', 'Sardines'], icon: Apple },
      { message: 'Spices add flavor and health benefits', suggestions: ['Turmeric', 'Ginger', 'Cinnamon', 'Garlic'], icon: Cookie },
      { message: 'Eat protein with every meal for satiety', suggestions: ['Eggs', 'Chicken', 'Tofu', 'Cottage cheese'], icon: Beef },
      { message: 'Snack smart - choose nutrient-dense options', suggestions: ['Almonds', 'Apple with peanut butter', 'Greek yogurt', 'Hummus'], icon: Apple },
    ];

    // Select today's rotating tip based on date seed
    const dailyTipIndex = dateSeed % dailyTipPool.length;
    const dailyTip = dailyTipPool[dailyTipIndex];

    // Always add the daily rotating tip first
    insights.push({
      type: 'daily',
      message: `💡 Daily Tip: ${dailyTip.message}`,
      suggestions: dailyTip.suggestions,
      icon: dailyTip.icon
    });

    // Add personalized insights based on current progress
    if (totalProtein < PROTEIN_GOAL * 0.7) {
      insights.push({
        type: 'protein',
        message: `Add ${Math.round(PROTEIN_GOAL * 0.7 - totalProtein)}g more protein today`,
        suggestions: ['Grilled chicken breast', 'Greek yogurt', 'Lentils', 'Eggs'],
        icon: Beef
      });
    }

    if (water < WATER_GOAL * 0.6) {
      insights.push({
        type: 'water',
        message: `You're behind on hydration - drink ${WATER_GOAL - water} more glasses`,
        suggestions: ['Set hourly reminders', 'Keep water bottle visible'],
        icon: Droplet
      });
    }

    if (totalCarbs < CARBS_GOAL * 0.5 && totalCalories < CALORIE_GOAL * 0.8) {
      insights.push({
        type: 'energy',
        message: 'Energy levels may be low - add healthy carbs',
        suggestions: ['Sweet potato', 'Quinoa', 'Oats', 'Brown rice'],
        icon: Apple
      });
    }

    return insights;
  };

  const insights = getAIInsights();

  return (
    <section className="py-8 animate-fade-in">
      {/* Header with Quick Stats */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight bg-gradient-to-r from-slate-900 via-indigo-900 to-violet-900 bg-clip-text text-transparent">
          Nutrition & Wellness
        </h2>
        <p className="text-slate-600 font-medium text-lg mb-6">Track your daily intake, hydration, and health score.</p>

        {/* Quick Stats Banner */}
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Calories</div>
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">{totalCalories}<span className="text-sm text-slate-500">/{CALORIE_GOAL}</span></div>
          </div>
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100 rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-bold text-cyan-600 uppercase tracking-wide mb-1">Hydration</div>
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">{water}<span className="text-sm text-slate-500">/{WATER_GOAL} glasses</span></div>
          </div>
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-bold text-violet-600 uppercase tracking-wide mb-1">Score</div>
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">{overallScore}<span className="text-sm text-slate-500">/100</span></div>
          </div>
        </div>
      </div>

      {/* AI Insights Panel */}
      {insights.length > 0 && (
        <div className="max-w-5xl mx-auto mb-8">
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg hover:shadow-xl transition-all group"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
              <span className="text-white font-bold text-lg">AI Nutrition Insights</span>
              <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">{insights.length} tips</span>
            </div>
            {showInsights ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5 text-white" />}
          </button>

          {showInsights && (
            <div className="mt-3 space-y-3 animate-fade-in">
              {insights.map((insight, idx) => (
                <div key={idx} className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
                      <insight.icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 mb-2">{insight.message}</p>
                      <div className="flex flex-wrap gap-2">
                        {insight.suggestions.map((suggestion, i) => (
                          <span key={i} className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full font-medium border border-slate-200">
                            {suggestion}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">

        {/* --- DAILY SCORE with Premium Gradient --- */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/50 to-violet-50/50 opacity-60"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-bold text-2xl text-slate-900 tracking-tight">Daily Score</h3>
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full shadow-sm">
                <TrendingUp className="w-3.5 h-3.5" /> {overallScore >= 80 ? 'On Track' : 'Keep Going'}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative w-56 h-56 flex items-center justify-center">
                {/* Glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${getScoreColor(overallScore)} opacity-20 blur-2xl rounded-full ${showConfetti ? 'animate-pulse' : ''}`}></div>

                {/* SVG Progress Ring */}
                <svg className="w-full h-full transform -rotate-90 drop-shadow-xl">
                  {/* Background Circle */}
                  <circle
                    cx="112"
                    cy="112"
                    r={radius}
                    className="stroke-slate-100"
                    strokeWidth="14"
                    fill="none"
                  />
                  {/* Gradient Definition */}
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" className="text-blue-500" stopColor="currentColor" />
                      <stop offset="50%" className="text-indigo-500" stopColor="currentColor" />
                      <stop offset="100%" className="text-violet-600" stopColor="currentColor" />
                    </linearGradient>
                  </defs>
                  {/* Progress Circle with Gradient */}
                  <circle
                    cx="112"
                    cy="112"
                    r={radius}
                    stroke="url(#scoreGradient)"
                    strokeWidth="14"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-1000 ease-out filter drop-shadow-lg"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-extrabold tracking-tighter bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-900 bg-clip-text text-transparent">
                    {overallScore}
                  </span>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">{getScoreLabel(overallScore)}</span>
                </div>
              </div>

              {/* Enhanced Sparkline */}
              <div className="w-full h-16 mt-8 flex items-end gap-2 px-8">
                {history.map((val, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-lg transition-all duration-500 ${i === 6 ? 'bg-gradient-to-t from-indigo-600 to-violet-600 shadow-lg' : 'bg-gradient-to-t from-slate-200 to-slate-300'}`}
                    style={{ height: `${val}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between w-full px-8 mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span className="text-indigo-600">Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- MACRO NUTRIENTS with Circular Rings --- */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-lg hover:shadow-xl transition-all">
          <div className="flex justify-between items-start mb-8">
            <h3 className="font-bold text-2xl text-slate-900 tracking-tight">Macros</h3>
            <span className="text-xs text-slate-600 font-bold uppercase tracking-wide bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              Goal: {CALORIE_GOAL} kcal
            </span>
          </div>

          {/* Macro Rings Grid */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Protein */}
            <div className="flex flex-col items-center">
              <div className="relative w-28 h-28 mb-3">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r={macroRadius} className="stroke-emerald-100" strokeWidth="10" fill="none" />
                  <defs>
                    <linearGradient id="proteinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="56"
                    cy="56"
                    r={macroRadius}
                    stroke="url(#proteinGradient)"
                    strokeWidth="10"
                    strokeDasharray={macroCircumference}
                    strokeDashoffset={getMacroStroke(proteinProgress)}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-1000 ease-out drop-shadow-md"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-emerald-600">{Math.round(proteinProgress)}%</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Protein</p>
                <p className="text-sm font-extrabold text-slate-900 tabular-nums">{totalProtein}g<span className="text-xs text-slate-500">/{PROTEIN_GOAL}g</span></p>
              </div>
            </div>

            {/* Carbs */}
            <div className="flex flex-col items-center">
              <div className="relative w-28 h-28 mb-3">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r={macroRadius} className="stroke-amber-100" strokeWidth="10" fill="none" />
                  <defs>
                    <linearGradient id="carbsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="56"
                    cy="56"
                    r={macroRadius}
                    stroke="url(#carbsGradient)"
                    strokeWidth="10"
                    strokeDasharray={macroCircumference}
                    strokeDashoffset={getMacroStroke(carbsProgress)}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-1000 ease-out drop-shadow-md"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-amber-600">{Math.round(carbsProgress)}%</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Carbs</p>
                <p className="text-sm font-extrabold text-slate-900 tabular-nums">{totalCarbs}g<span className="text-xs text-slate-500">/{CARBS_GOAL}g</span></p>
              </div>
            </div>

            {/* Fats */}
            <div className="flex flex-col items-center">
              <div className="relative w-28 h-28 mb-3">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r={macroRadius} className="stroke-rose-100" strokeWidth="10" fill="none" />
                  <defs>
                    <linearGradient id="fatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f43f5e" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="56"
                    cy="56"
                    r={macroRadius}
                    stroke="url(#fatGradient)"
                    strokeWidth="10"
                    strokeDasharray={macroCircumference}
                    strokeDashoffset={getMacroStroke(fatProgress)}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-1000 ease-out drop-shadow-md"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-rose-600">{Math.round(fatProgress)}%</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Fats</p>
                <p className="text-sm font-extrabold text-slate-900 tabular-nums">{totalFat}g<span className="text-xs text-slate-500">/{FAT_GOAL}g</span></p>
              </div>
            </div>
          </div>

          {/* Total Calories Progress Bar */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-2xl p-6">
            <div className="flex justify-between text-sm mb-3">
              <span className="font-bold text-slate-800">Total Calories</span>
              <span className="text-slate-700 font-extrabold tabular-nums">{totalCalories} / {CALORIE_GOAL}</span>
            </div>
            <div className="h-5 w-full bg-white rounded-full overflow-hidden border-2 border-slate-200 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-700 ${totalCalories > CALORIE_GOAL ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600'} shadow-lg`}
                style={{ width: `${Math.min(100, (totalCalories / CALORIE_GOAL) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* --- HYDRATION with Ultra-Premium 3D Design --- */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
          {/* Multi-layer gradient backgrounds for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 via-blue-50/50 to-indigo-50/50 opacity-60"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-blue-100/20 via-transparent to-cyan-100/20"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-2xl text-slate-900 tracking-tight">Hydration</h3>
              <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full shadow-sm transition-all ${streak >= 7 ? 'text-purple-700 bg-purple-100 ring-2 ring-purple-300 animate-pulse' :
                streak >= 3 ? 'text-orange-700 bg-orange-100' :
                  'text-amber-700 bg-amber-100'
                }`}>
                <Flame className={`w-3.5 h-3.5 ${streak >= 7 ? 'fill-purple-500 text-purple-600' : 'fill-orange-500 text-orange-600'}`} />
                {streak} Day Streak
              </div>
            </div>

            <div className="flex flex-col items-center py-6">
              {/* Premium 3D Water Container with Advanced Physics */}
              <div className="relative mb-8">
                {/* Outer progress ring */}
                <svg className="absolute -inset-4 w-64 h-64 transform -rotate-90 opacity-30">
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    className="stroke-blue-200 transition-all duration-700 ease-out"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="753.98"
                    strokeDashoffset={753.98 - (753.98 * water / WATER_GOAL)}
                  />
                </svg>

                {/* Main water container with 3D glass effect */}
                <div className="relative w-56 h-56 cursor-pointer transform transition-all duration-300 hover:scale-105 active:scale-95" onClick={handleWaterClick}>
                  {/* Multi-layer shadow system for depth */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white via-cyan-50 to-blue-100 rounded-full shadow-2xl"></div>
                  <div className="absolute inset-0 bg-gradient-to-tl from-blue-100/50 via-transparent to-white/80 rounded-full"></div>

                  {/* Glass border with inner shadow */}
                  <div className="absolute inset-0 rounded-full border-[6px] border-white/60 shadow-[inset_0_2px_20px_rgba(0,0,0,0.08)]"></div>

                  {/* Animated water fill with realistic waves */}
                  <div
                    className="absolute bottom-0 left-0 right-0 overflow-hidden transition-all duration-700 ease-out rounded-b-full"
                    style={{
                      height: `${Math.min(100, (water / WATER_GOAL) * 100)}%`,
                      borderRadius: water >= WATER_GOAL ? '9999px' : '0 0 9999px 9999px'
                    }}
                  >
                    {/* Base water gradient */}
                    <div className={`absolute inset-0 ${water >= WATER_GOAL ? 'bg-gradient-to-t from-purple-600 via-blue-500 to-cyan-400' :
                      water >= WATER_GOAL * 0.75 ? 'bg-gradient-to-t from-blue-700 via-blue-500 to-cyan-400' :
                        water >= WATER_GOAL * 0.5 ? 'bg-gradient-to-t from-blue-600 via-blue-500 to-cyan-400' :
                          'bg-gradient-to-t from-blue-500 via-cyan-500 to-blue-300'
                      }`}></div>

                    {/* Animated wave layers for realistic liquid motion */}
                    <div className="absolute top-0 left-0 right-0 h-8">
                      {/* Wave 1 */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-60"
                        style={{
                          animation: 'wave 3s ease-in-out infinite',
                          animationDelay: '0s'
                        }}>
                      </div>
                      {/* Wave 2 */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-40"
                        style={{
                          animation: 'wave 3s ease-in-out infinite',
                          animationDelay: '-1.5s'
                        }}>
                      </div>
                    </div>

                    {/* Surface shimmer */}
                    <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white/40 via-white/10 to-transparent"></div>

                    {/* Bubbles animation on interaction */}
                    {waterRipple && (
                      <>
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-2 h-2 bg-white/60 rounded-full animate-ping"
                            style={{
                              left: `${20 + i * 15}%`,
                              bottom: `${10 + i * 10}%`,
                              animationDelay: `${i * 0.1}s`,
                              animationDuration: '1s'
                            }}
                          />
                        ))}
                      </>
                    )}
                  </div>

                  {/* Ripple effect on click */}
                  {waterRipple && (
                    <>
                      <div className="absolute inset-0 border-4 border-cyan-400 rounded-full animate-ping opacity-75"></div>
                      <div className="absolute inset-0 border-2 border-blue-500 rounded-full animate-ping opacity-50" style={{ animationDelay: '0.1s' }}></div>
                    </>
                  )}

                  {/* Milestone markers */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[25, 50, 75, 100].map((milestone) => {
                      const reached = (water / WATER_GOAL * 100) >= milestone;
                      return (
                        <div
                          key={milestone}
                          className={`absolute left-1/2 w-1 h-3 -ml-0.5 transition-all duration-300 ${reached ? 'bg-white/90 shadow-lg' : 'bg-slate-300/40'
                            }`}
                          style={{ bottom: `${milestone}%` }}
                        >
                          {reached && milestone === 100 && (
                            <div className="absolute -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Content overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                    <Droplet className={`w-14 h-14 mb-3 drop-shadow-2xl transition-all duration-500 ${water >= WATER_GOAL ? 'fill-white text-white scale-125 animate-bounce' :
                      'fill-blue-500 text-blue-600'
                      }`} />
                    <span className={`text-6xl font-extrabold tracking-tight drop-shadow-2xl transition-all duration-300 ${water >= WATER_GOAL ? 'text-white scale-110' : 'text-slate-900'
                      }`}>
                      {water}
                    </span>
                    <span className={`text-xs font-bold uppercase tracking-widest drop-shadow-lg mt-1 transition-colors ${water >= WATER_GOAL ? 'text-white/90' : 'text-slate-600'
                      }`}>
                      / {WATER_GOAL} Glasses
                    </span>
                  </div>

                  {/* Celebration confetti when goal reached */}
                  {water >= WATER_GOAL && celebrationMode && (
                    <div className="absolute inset-0 pointer-events-none overflow-visible">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className={`absolute w-3 h-3 rounded-full ${i % 4 === 0 ? 'bg-yellow-400' :
                            i % 4 === 1 ? 'bg-pink-400' :
                              i % 4 === 2 ? 'bg-cyan-400' :
                                'bg-purple-400'
                            }`}
                          style={{
                            top: '50%',
                            left: '50%',
                            animation: 'confetti 1.5s ease-out infinite',
                            animationDelay: `${i * 0.1}s`,
                            transform: `rotate(${i * 30}deg) translateY(-80px)`,
                            opacity: 0.8
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Glow effect at high hydration */}
                  {water >= WATER_GOAL * 0.75 && (
                    <div className={`absolute inset-0 rounded-full ${water >= WATER_GOAL ?
                      'bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 opacity-30 blur-3xl animate-pulse' :
                      'bg-gradient-to-r from-blue-500 to-cyan-500 opacity-20 blur-2xl'
                      }`}></div>
                  )}
                </div>
              </div>

              {/* Progress indicator text */}
              <div className="text-center mb-6">
                <p className="text-sm font-bold text-slate-700 mb-1">
                  {water >= WATER_GOAL ? '🎉 Daily Goal Achieved!' :
                    water >= WATER_GOAL * 0.75 ? '💪 Almost there!' :
                      water >= WATER_GOAL * 0.5 ? '👍 Halfway to your goal' :
                        water >= WATER_GOAL * 0.25 ? '🌟 Good start! Keep going' :
                          '💧 Start hydrating'}
                </p>
                <div className="flex items-center justify-center gap-1">
                  {[...Array(WATER_GOAL)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${i < water ?
                        'bg-gradient-to-br from-blue-500 to-cyan-500 scale-100 shadow-sm' :
                        'bg-slate-200 scale-75'
                        }`}
                    />
                  ))}
                </div>
              </div>

              {/* Premium action button with glassmorphism */}
              <button
                onClick={handleWaterClick}
                className="relative w-full max-w-[280px] py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-600 hover:via-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-base transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl hover:shadow-2xl hover:-translate-y-1 tracking-wide overflow-hidden group/btn"
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>

                <Plus className="w-5 h-5 stroke-[3px] relative z-10 group-hover/btn:rotate-90 transition-transform duration-300" />
                <span className="relative z-10">Add Water</span>

                {/* Border glow */}
                <div className="absolute inset-0 rounded-2xl ring-2 ring-white/30 ring-inset"></div>
              </button>
            </div>
          </div>
        </div>


        {/* --- MEAL HISTORY with Rich Cards --- */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-lg hover:shadow-xl transition-all">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-2xl text-slate-900 tracking-tight">Meals Today</h3>
            <span className="text-xs font-bold text-slate-600 bg-gradient-to-br from-slate-100 to-slate-200 px-4 py-2 rounded-xl border border-slate-300 shadow-sm">
              {meals.length} Logged
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[400px] space-y-4 mb-6 pr-1 custom-scrollbar">
            {meals.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-300 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 p-8">
                <Utensils className="w-12 h-12 mb-3 opacity-30" />
                <p className="font-bold text-slate-500">No meals logged yet</p>
                <p className="text-xs text-slate-400 mt-1">Snap a photo to get started!</p>
              </div>
            ) : (
              meals.slice().reverse().map((meal) => (
                <div key={meal.id} className="group bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 text-base mb-1">{meal.name}</p>
                      <p className="text-xs text-slate-500 font-bold flex items-center gap-2">
                        <Flame className="w-3 h-3" />
                        <span className="text-slate-700 font-extrabold">{meal.calories} kcal</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>{meal.time}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => removeMeal(meal.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Macro breakdown */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200">
                    <div className="text-center p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                      <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wide">Protein</p>
                      <p className="text-sm font-extrabold text-emerald-900">{meal.protein}g</p>
                    </div>
                    <div className="text-center p-2 bg-amber-50 rounded-lg border border-amber-100">
                      <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wide">Carbs</p>
                      <p className="text-sm font-extrabold text-amber-900">{meal.carbs}g</p>
                    </div>
                    <div className="text-center p-2 bg-rose-50 rounded-lg border border-rose-100">
                      <p className="text-[10px] text-rose-700 font-bold uppercase tracking-wide">Fats</p>
                      <p className="text-sm font-extrabold text-rose-900">{meal.fat}g</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleMealUpload}
            accept="image/*"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzingMeal}
            className="w-full py-5 bg-gradient-to-r from-slate-900 via-indigo-900 to-violet-900 hover:from-slate-800 hover:via-indigo-800 hover:to-violet-800 text-white font-bold rounded-2xl text-sm transition-all shadow-xl hover:shadow-2xl active:translate-y-0.5 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 tracking-wide group"
          >
            {isAnalyzingMeal ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="flex items-center gap-2">
                  Analyzing Food
                  <span className="animate-pulse">...</span>
                </span>
              </>
            ) : (
              <>
                <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Snap Meal Photo</span>
              </>
            )}
          </button>
        </div>

      </div>
    </section>
  );
};

export default NutritionSection;