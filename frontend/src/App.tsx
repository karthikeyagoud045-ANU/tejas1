import React, { useState, useRef, useEffect } from 'react';
import Hero from './components/Hero';
import UploadSection from './components/UploadSection';
import ExercisePlayer from './components/ExercisePlayer';
import NutritionSection from './components/NutritionSection';
import AnalyticsSection from './components/AnalyticsSection';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import { Home, Heart, Activity, TrendingUp, User, LogOut } from 'lucide-react';
import { Meal } from './types';
import Onboarding from './components/Onboarding';
import MedicationTracker from './components/MedicationTracker';
import CommunityForum from './components/CommunityForum';
import DoctorFinder from './components/DoctorFinder';
import AuthPage from './components/AuthPage';
import { useAuth } from './contexts/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';
import ProfilePage from './components/ProfilePage';
import CustomWorkoutPlanner from './components/CustomWorkoutPlanner';

function App() {
  // Auth state
  const { user, loading: authLoading, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState('home');
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [water, setWater] = useState(0);
  const [exerciseMinutes, setExerciseMinutes] = useState(0);
  const [exercisesCompleted, setExercisesCompleted] = useState(0);
  const [streak, setStreak] = useState(3);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Sub-tab state for each section
  const [healthTab, setHealthTab] = useState<'medications' | 'doctors'>('medications');
  const [wellnessTab, setWellnessTab] = useState<'nutrition' | 'exercise'>('nutrition');
  const [insightsTab, setInsightsTab] = useState<'analytics' | 'forum'>('analytics');

  // Simplified 5-tab navigation (defined before useEffect that uses it)
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'wellness', label: 'Wellness', icon: Activity },
    { id: 'health', label: 'Health', icon: Heart },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // Weekly Persistence Logic - Store data for 7 days
  // MUST be before any conditional returns (React Rules of Hooks)
  useEffect(() => {
    if (!user) return; // Skip if not logged in

    const today = new Date().toDateString();
    const todayKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Check if onboarding is done
    const onboardingDone = localStorage.getItem('hw_onboarding_done');
    if (!onboardingDone) {
      setShowOnboarding(true);
    }

    // Load weekly data structure
    const weeklyDataStr = localStorage.getItem('hw_weekly_data');
    let weeklyData: Record<string, { water: number; exCount: number; exMinutes: number; meals: any[] }> = {};

    if (weeklyDataStr) {
      try {
        weeklyData = JSON.parse(weeklyDataStr);
      } catch (e) {
        weeklyData = {};
      }
    }

    // Clean up data older than 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoffKey = sevenDaysAgo.toISOString().split('T')[0];

    Object.keys(weeklyData).forEach(dateKey => {
      if (dateKey < cutoffKey) {
        delete weeklyData[dateKey];
      }
    });

    // Load today's data if it exists
    if (weeklyData[todayKey]) {
      const todaysData = weeklyData[todayKey];
      setWater(todaysData.water || 0);
      setExercisesCompleted(todaysData.exCount || 0);
      setExerciseMinutes(todaysData.exMinutes || 0);
      setMeals(todaysData.meals || []);
    } else {
      // Initialize today's data
      setWater(0);
      setExerciseMinutes(0);
      setExercisesCompleted(0);
      setMeals([]);
    }

    // Save cleaned weekly data
    localStorage.setItem('hw_weekly_data', JSON.stringify(weeklyData));
    localStorage.setItem('hw_date', today);
  }, [user]);

  // Save changes to weekly data structure
  useEffect(() => {
    if (!user) return; // Skip if not logged in

    const todayKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Load existing weekly data
    const weeklyDataStr = localStorage.getItem('hw_weekly_data');
    let weeklyData: Record<string, { water: number; exCount: number; exMinutes: number; meals: any[] }> = {};

    if (weeklyDataStr) {
      try {
        weeklyData = JSON.parse(weeklyDataStr);
      } catch (e) {
        weeklyData = {};
      }
    }

    // Update today's data
    weeklyData[todayKey] = {
      water,
      exCount: exercisesCompleted,
      exMinutes: exerciseMinutes,
      meals
    };

    localStorage.setItem('hw_weekly_data', JSON.stringify(weeklyData));
  }, [water, exercisesCompleted, exerciseMinutes, meals, user]);

  // Update pill position when activeTab changes or window resizes
  useEffect(() => {
    const updatePill = () => {
      const activeIndex = tabs.findIndex(t => t.id === activeTab);
      const currentTab = tabRefs.current[activeIndex];

      if (currentTab) {
        setPillStyle({
          left: currentTab.offsetLeft,
          width: currentTab.offsetWidth,
          opacity: 1
        });
      }
    };

    const timeoutId = setTimeout(updatePill, 50);
    window.addEventListener('resize', updatePill);

    return () => {
      window.removeEventListener('resize', updatePill);
      clearTimeout(timeoutId);
    };
  }, [activeTab]);

  const handleAddWater = () => {
    setWater(prev => Math.min(20, prev + 1));
  };

  const handleExerciseComplete = (minutes: number) => {
    setExerciseMinutes(prev => prev + Math.ceil(minutes));
    setExercisesCompleted(prev => prev + 1);
  };

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show loading spinner while checking auth - AFTER all hooks
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8FBFF] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading HealthWise AI..." />
      </div>
    );
  }

  // Show auth page if not logged in - AFTER all hooks
  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-[#F8FBFF] flex flex-col font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 relative">

      {/* --- LIQUID GLASS NAVIGATION BAR --- */}
      <nav className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-[0_4px_30px_rgba(0,0,0,0.02)] transition-all duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">

            {/* Logo Area */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => handleNavClick('home')}
            >
              <svg
                className="w-10 h-10 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300 rounded-xl"
                viewBox="0 0 512 512"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="512" height="512" rx="120" fill="#3B82F6" />
                <path d="M96 256h80l48-144 64 288 48-144h80" stroke="white" strokeWidth="48" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-extrabold text-xl text-slate-900 tracking-tight group-hover:opacity-80 transition-opacity">
                HealthWise<span className="text-blue-600">.AI</span>
              </span>
            </div>

            {/* Centered Liquid Nav Items */}
            <div className="relative flex items-center p-1.5 bg-slate-100/60 border border-white/50 backdrop-blur-md rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]">

              {/* The Moving Pill Highlight */}
              <div
                className="absolute bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
                style={{
                  left: pillStyle.left,
                  width: pillStyle.width,
                  height: 'calc(100% - 12px)',
                  top: '6px',
                  opacity: pillStyle.opacity
                }}
              />

              {/* Tab Buttons */}
              {tabs.map((tab, index) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    ref={el => { tabRefs.current[index] = el }}
                    onClick={() => handleNavClick(tab.id)}
                    className={`relative z-10 flex items-center gap-2.5 px-3 md:px-5 py-2.5 text-sm font-bold rounded-full transition-all duration-300 outline-none select-none tracking-tight ${isActive
                      ? 'text-slate-900 scale-[1.03]'
                      : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    <tab.icon
                      className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'text-blue-600 stroke-[2.5px] scale-110' : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                    />
                    <span className="hidden md:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-100/60 rounded-full">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
                  {user.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={signOut}
                className="p-2.5 hover:bg-red-50 rounded-xl transition-colors group"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

        {/* 1. HOME - Dashboard + Quick Actions */}
        {activeTab === 'home' && (
          <div className="animate-fade-in space-y-12">
            <Hero onUploadClick={() => {
              document.getElementById('upload-area')?.scrollIntoView({ behavior: 'smooth' });
            }} />
            <div id="upload-area">
              <UploadSection id="upload" />
            </div>
          </div>
        )}

        {/* 2. HEALTH - Medications OR Doctors (toggle) */}
        {activeTab === 'health' && (
          <div className="animate-fade-in pt-4 space-y-6">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2">❤️ Health Center</h2>
              <p className="text-slate-500">Track medications and find doctors near you</p>
            </div>

            {/* Sub-navigation Tabs - Medications vs Doctors */}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setHealthTab('medications')}
                className={`px-6 py-3 rounded-full font-semibold transition-all border ${healthTab === 'medications'
                  ? 'bg-green-50 text-green-700 border-green-200 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
              >
                💊 Medications
              </button>
              <button
                onClick={() => setHealthTab('doctors')}
                className={`px-6 py-3 rounded-full font-semibold transition-all border ${healthTab === 'doctors'
                  ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
              >
                🩺 Find Doctors
              </button>
            </div>

            {/* Content based on active sub-tab */}
            {healthTab === 'medications' && (
              <div className="animate-fade-in">
                <MedicationTracker />
              </div>
            )}

            {healthTab === 'doctors' && (
              <div className="animate-fade-in">
                <DoctorFinder />
              </div>
            )}
          </div>
        )}

        {/* 3. WELLNESS - Exercise + Nutrition */}
        {activeTab === 'wellness' && (
          <div className="animate-fade-in pt-4 space-y-6">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2">🏃 Wellness Hub</h2>
              <p className="text-slate-500">Exercise routines and nutrition tracking in one place</p>
            </div>

            {/* Sub-navigation Tabs */}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setWellnessTab('nutrition')}
                className={`px-5 py-2.5 rounded-full font-semibold transition-all border ${wellnessTab === 'nutrition'
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
              >
                🥗 Nutrition
              </button>
              <button
                onClick={() => setWellnessTab('exercise')}
                className={`px-5 py-2.5 rounded-full font-semibold transition-all border ${wellnessTab === 'exercise'
                  ? 'bg-orange-50 text-orange-600 border-orange-200 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
              >
                🏋️ Exercise
              </button>
            </div>

            {/* Content based on active sub-tab */}
            {wellnessTab === 'exercise' && (
              <div className="animate-fade-in">
                <ExercisePlayer onExerciseComplete={handleExerciseComplete} />
              </div>
            )}

            {wellnessTab === 'nutrition' && (
              <div className="animate-fade-in">
                <NutritionSection
                  water={water}
                  onAddWater={handleAddWater}
                  streak={streak}
                  meals={meals}
                  setMeals={setMeals}
                />
              </div>
            )}
          </div>
        )}

        {/* 4. INSIGHTS - Analytics + Community */}
        {activeTab === 'insights' && (
          <div className="animate-fade-in pt-4 space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2">📊 Insights</h2>
              <p className="text-slate-500">Your progress analytics and community discussions</p>
            </div>

            {/* Sub-navigation Tabs */}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setInsightsTab('analytics')}
                className={`px-5 py-2.5 rounded-full font-semibold transition-all border ${insightsTab === 'analytics'
                  ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
              >
                📈 Progress & Analytics
              </button>
              <button
                onClick={() => setInsightsTab('forum')}
                className={`px-5 py-2.5 rounded-full font-semibold transition-all border ${insightsTab === 'forum'
                  ? 'bg-purple-50 text-purple-600 border-purple-200 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
              >
                💬 Community Forum
              </button>
            </div>

            {/* Content based on active sub-tab */}
            {insightsTab === 'analytics' && (
              <div className="animate-fade-in">
                <AnalyticsSection
                  water={water}
                  exercisesCompleted={exercisesCompleted}
                  streak={streak}
                  calories={totalCalories}
                />
              </div>
            )}

            {insightsTab === 'forum' && (
              <div className="animate-fade-in">
                <CommunityForum />
              </div>
            )}
          </div>
        )}

        {/* 5. PROFILE */}
        {activeTab === 'profile' && (
          <div className="animate-fade-in pt-4">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2">👤 Profile</h2>
              <p className="text-slate-500">Manage your account and preferences</p>
            </div>
            <ProfilePage />
          </div>
        )}

      </main>

      {/* --- FOOTER --- */}
      <Footer />

      {/* --- AI CHATBOT --- */}
      <ChatBot />

      {/* --- ONBOARDING MODAL --- */}
      {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
    </div>
  );
}

export default App;