
export interface KeyFinding {
  item: string;
  status: 'high' | 'low' | 'normal';
  normalRange?: string;
}

export interface DietRecommendation {
  include: string[];
  avoid: string[];
}

export interface AnalysisResult {
  severity: 'green' | 'yellow' | 'red';
  keyFindings: KeyFinding[];
  dos: string[];
  donts: string[];
  exercises: string[];
  diet: DietRecommendation;
}

export interface Exercise {
  name: string;
  duration: number; // in seconds
  instructions: string;
}

export interface WorkoutRoutine {
  badge: string;
  title: string;
  meta: string;
  exercises: Exercise[];
  safety: string[];
  modifications: string;
}

export enum ConditionType {
  Pregnancy = 'pregnancy',
  Diabetes = 'diabetes',
  Hypertension = 'hypertension',
  Cardiac = 'cardiac',
  Arthritis = 'arthritis',
  BackPain = 'back-pain'
}

export interface Meal {
  id: number;
  name: string;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  time: string;
}
