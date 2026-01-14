// Exercise Library
// 50 core exercises with metadata for AI-powered workout generation

export type ExerciseCategory = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type EquipmentType = 'none' | 'dumbbells' | 'barbell' | 'resistance_band' | 'kettlebell' | 'pull_up_bar';

export interface Exercise {
    id: string;
    name: string;
    category: ExerciseCategory;
    difficulty: DifficultyLevel;
    equipment: EquipmentType;
    primaryMuscles: string[];
    secondaryMuscles: string[];
    description: string;
    instructions: string[];
    // Lottie animation path (will add actual animations later)
    animationUrl?: string;
    // Fallback image
    imageUrl?: string;
    // Estimated calories per minute
    caloriesPerMinute: number;
    // MET value for calorie calculation
    metValue: number;
}

// ========================================
// EXERCISE DATABASE (50 CORE EXERCISES)
// ========================================

export const EXERCISE_LIBRARY: Exercise[] = [
    // ==================== CHEST (8 exercises) ====================
    {
        id: 'pushup_standard',
        name: 'Standard Push-up',
        category: 'chest',
        difficulty: 'beginner',
        equipment: 'none',
        primaryMuscles: ['Chest', 'Triceps'],
        secondaryMuscles: ['Shoulders', 'Core'],
        description: 'Classic bodyweight chest exercise',
        instructions: [
            'Start in plank position with hands shoulder-width apart',
            'Lower your body until chest nearly touches floor',
            'Push back up to starting position',
            'Keep core engaged throughout'
        ],
        caloriesPerMinute: 7,
        metValue: 3.8
    },
    {
        id: 'pushup_wide',
        name: 'Wide Push-up',
        category: 'chest',
        difficulty: 'beginner',
        equipment: 'none',
        primaryMuscles: ['Chest'],
        secondaryMuscles: ['Shoulders', 'Triceps'],
        description: 'Push-up with wider hand placement for chest focus',
        instructions: [
            'Place hands wider than shoulder-width',
            'Lower chest to ground',
            'Push back up',
            'Focus on chest squeeze'
        ],
        caloriesPerMinute: 7.5,
        metValue: 4.0
    },
    {
        id: 'pushup_decline',
        name: 'Decline Push-up',
        category: 'chest',
        difficulty: 'intermediate',
        equipment: 'none',
        primaryMuscles: ['Upper Chest', 'Shoulders'],
        secondaryMuscles: ['Triceps', 'Core'],
        description: 'Elevated feet push-up for upper chest',
        instructions: [
            'Place feet on elevated surface',
            'Hands on ground shoulder-width apart',
            'Perform push-up with feet elevated',
            'Targets upper chest'
        ],
        caloriesPerMinute: 8.5,
        metValue: 4.5
    },
    {
        id: 'pushup_diamond',
        name: 'Diamond Push-up',
        category: 'chest',
        difficulty: 'intermediate',
        equipment: 'none',
        primaryMuscles: ['Triceps', 'Inner Chest'],
        secondaryMuscles: ['Shoulders'],
        description: 'Close-grip push-up for triceps',
        instructions: [
            'Form diamond shape with index fingers and thumbs',
            'Place hands under chest',
            'Lower down keeping elbows close to body',
            'Push back up'
        ],
        caloriesPerMinute: 8,
        metValue: 4.2
    },
    {
        id: 'chest_dip',
        name: 'Chest Dips',
        category: 'chest',
        difficulty: 'advanced',
        equipment: 'none',
        primaryMuscles: ['Lower Chest', 'Triceps'],
        secondaryMuscles: ['Shoulders'],
        description: 'Advanced bodyweight chest exercise',
        instructions: [
            'Use parallel bars or sturdy chairs',
            'Lean forward slightly',
            'Lower body until upper arms parallel to ground',
            'Push back up'
        ],
        caloriesPerMinute: 9,
        metValue: 5.0
    },
    {
        id: 'pushup_archer',
        name: 'Archer Push-up',
        category: 'chest',
        difficulty: 'advanced',
        equipment: 'none',
        primaryMuscles: ['Chest', 'Triceps'],
        secondaryMuscles: ['Shoulders', 'Core'],
        description: 'Unilateral push-up variation',
        instructions: [
            'Start in wide push-up position',
            'Shift weight to one side while descending',
            'Other arm stays extended',
            'Alternate sides'
        ],
        caloriesPerMinute: 9.5,
        metValue: 5.2
    },
    {
        id: 'incline_pushup',
        name: 'Incline Push-up',
        category: 'chest',
        difficulty: 'beginner',
        equipment: 'none',
        primaryMuscles: ['Chest'],
        secondaryMuscles: ['Triceps', 'Shoulders'],
        description: 'Easier push-up variation with hands elevated',
        instructions: [
            'Place hands on elevated surface',
            'Feet on ground',
            'Perform push-up',
            'Good for beginners'
        ],
        caloriesPerMinute: 5,
        metValue: 3.0
    },
    {
        id: 'pushup_pike',
        name: 'Pike Push-up',
        category: 'chest',
        difficulty: 'intermediate',
        equipment: 'none',
        primaryMuscles: ['Shoulders', 'Upper Chest'],
        secondaryMuscles: ['Triceps', 'Core'],
        description: 'Push-up targeting shoulders',
        instructions: [
            'Start in downward dog position',
            'Bend arms to lower head toward ground',
            'Push back up',
            'Hips stay elevated'
        ],
        caloriesPerMinute: 7.5,
        metValue: 4.0
    },

    // ==================== BACK (8 exercises) ====================
    {
        id: 'pullup_standard',
        name: 'Pull-up',
        category: 'back',
        difficulty: 'intermediate',
        equipment: 'pull_up_bar',
        primaryMuscles: ['Lats', 'Upper Back'],
        secondaryMuscles: ['Biceps', 'Forearms'],
        description: 'Classic back building exercise',
        instructions: [
            'Hang from bar with overhand grip',
            'Pull yourself up until chin over bar',
            'Lower with control',
            'Full range of motion'
        ],
        caloriesPerMinute: 10,
        metValue: 5.5
    },
    {
        id: 'chinup_standard',
        name: 'Chin-up',
        category: 'back',
        difficulty: 'intermediate',
        equipment: 'pull_up_bar',
        primaryMuscles: ['Lats', 'Biceps'],
        secondaryMuscles: ['Upper Back'],
        description: 'Underhand grip pull-up',
        instructions: [
            'Hang from bar with underhand grip',
            'Pull up until chin over bar',
            'Lower slowly',
            'Bicep engagement'
        ],
        caloriesPerMinute: 10,
        metValue: 5.5
    },
    {
        id: 'inverted_row',
        name: 'Inverted Row',
        category: 'back',
        difficulty: 'beginner',
        equipment: 'none',
        primaryMuscles: ['Mid Back', 'Lats'],
        secondaryMuscles: ['Biceps', 'Rear Delts'],
        description: 'Horizontal pulling movement',
        instructions: [
            'Lie under sturdy table or bar',
            'Grab edge with overhand grip',
            'Pull chest to bar',
            'Lower with control'
        ],
        caloriesPerMinute: 6,
        metValue: 3.5
    },
    {
        id: 'superman_hold',
        name: 'Superman Hold',
        category: 'back',
        difficulty: 'beginner',
        equipment: 'none',
        primaryMuscles: ['Lower Back', 'Glutes'],
        secondaryMuscles: ['Hamstrings', 'Upper Back'],
        description: 'Isometric lower back exercise',
        instructions: [
            'Lie face down on floor',
            'Extend arms forward',
            'Lift arms, chest, and legs off ground',
            'Hold position'
        ],
        caloriesPerMinute: 4,
        metValue: 2.5
    },
    {
        id: 'back_extension',
        name: 'Back Extension',
        category: 'back',
        difficulty: 'beginner',
        equipment: 'none',
        primaryMuscles: ['Lower Back', 'Glutes'],
        secondaryMuscles: ['Hamstrings'],
        description: 'Lower back strengthening',
        instructions: [
            'Lie face down',
            'Place hands behind head',
            'Lift upper body off ground',
            'Lower with control'
        ],
        caloriesPerMinute: 5,
        metValue: 3.0
    },
    {
        id: 'doorway_row',
        name: 'Doorway Row',
        category: 'back',
        difficulty: 'beginner',
        equipment: 'none',
        primaryMuscles: ['Mid Back'],
        secondaryMuscles: ['Biceps', 'Rear Delts'],
        description: 'Row using doorframe',
        instructions: [
            'Stand in doorway',
            'Grab frame with both hands',
            'Lean back',
            'Pull body forward'
        ],
        caloriesPerMinute: 5,
        metValue: 3.0
    },
    {
        id: 'pullup_wide',
        name: 'Wide Grip Pull-up',
        category: 'back',
        difficulty: 'advanced',
        equipment: 'pull_up_bar',
        primaryMuscles: ['Lats', 'Upper Back'],
        secondaryMuscles: ['Biceps'],
        description: 'Wide grip for lat emphasis',
        instructions: [
            'Grip bar wider than shoulders',
            'Pull up leading with elbows',
            'Focus on lat squeeze',
            'Lower slowly'
        ],
        caloriesPerMinute: 11,
        metValue: 6.0
    },
    {
        id: 'scapular_pullup',
        name: 'Scapular Pull-up',
        category: 'back',
        difficulty: 'beginner',
        equipment: 'pull_up_bar',
        primaryMuscles: ['Scapular Muscles'],
        secondaryMuscles: ['Lats'],
        description: 'Pull-up prep exercise',
        instructions: [
            'Hang from bar',
            'Without bending elbows, depress shoulder blades',
            'Lift body slightly',
            'Return to hang'
        ],
        caloriesPerMinute: 4,
        metValue: 2.5
    },

    // ==================== LEGS (10 exercises) ====================
    {
        id: 'squat_bodyweight',
        name: 'Bodyweight Squat',
        category: 'legs',
        difficulty: 'beginner',
        equipment: 'none',
        primaryMuscles: ['Quads', 'Glutes'],
        secondaryMuscles: ['Hamstrings', 'Core'],
        description: 'Fundamental leg exercise',
        instructions: [
            'Stand with feet shoulder-width apart',
            'Lower hips back and down',
            'Keep chest up',
            'Push through heels to stand'
        ],
        caloriesPerMinute: 6,
        metValue: 3.5
    },
    {
        id: 'lunge_forward',
        name: 'Forward Lunge',
        category: 'legs',
        difficulty: 'beginner',
        equipment: 'none',
        primaryMuscles: ['Quads', 'Glutes'],
        secondaryMuscles: ['Hamstrings', 'Calves'],
        description: 'Unilateral leg exercise',
        instructions: [
            'Step forward with one leg',
            'Lower back knee toward ground',
            'Front thigh parallel to ground',
            'Push back to start'
        ],
        caloriesPerMinute: 7,
        metValue: 4.0
    },
    {
        id: 'lunge_reverse',
        name: 'Reverse Lunge',
        category: 'legs',
        difficulty: 'beginner',
        equipment: 'none',
        primaryMuscles: ['Glutes', 'Quads'],
        secondaryMuscles: ['Hamstrings'],
        description: 'Knee-friendly lunge variation',
        instructions: [
            'Step backward with one leg',
            'Lower back knee down',
            'Push through front heel to return',
            'Alternate legs'
        ],
        caloriesPerMinute: 7,
        metValue: 4.0
    },
    {
        id: 'squat_jump',
        name: 'Jump Squat',
        category: 'legs',
        difficulty: 'intermediate',
        equipment: 'none',
        primaryMuscles: ['Quads', 'Glutes'],
        secondaryMuscles: ['Calves', 'Core'],
        description: 'Explosive squat variation',
        instructions: [
            'Perform squat',
            'Explode up into jump',
            'Land softly',
            'Immediately go into next rep'
        ],
        caloriesPerMinute: 10,
        metValue: 5.5
    },
    {
        id: 'bulgarian_split_squat',
        name: 'Bulgarian Split Squat',
        category: 'legs',
        difficulty: 'intermediate',
        equipment: 'none',
        primaryMuscles: ['Quads', 'Glutes'],
        secondaryMuscles: ['Hamstrings', 'Core'],
        description: 'Elevated rear foot lunge',
        instructions: [
            'Place rear foot on elevated surface',
            'Lower into lunge position',
            'Front knee tracks over toes',
            'Push back up'
        ],
        caloriesPerMinute: 8,
        metValue: 4.5
    },
    {
        id: 'calf_raise',
        name: 'Calf Raise',
        category: 'legs',
        difficulty: 'beginner',
        equipment: 'none',
        primaryMuscles: ['Calves'],
        secondaryMuscles: [],
        description: 'Calf strengthening',
        instructions: [
            'Stand with feet hip-width apart',
            'Rise up onto toes',
            'Hold briefly at top',
            'Lower with control'
        ],
        caloriesPerMinute: 4,
        metValue: 2.5
    },
    {
        id: 'glute_bridge',
        name: 'Glute Bridge',
        category: 'legs',
        difficulty: 'beginner',
        equipment: 'none',
        primaryMuscles: ['Glutes', 'Hamstrings'],
        secondaryMuscles: ['Lower Back', 'Core'],
        description: 'Hip extension exercise',
        instructions: [
            'Lie on back with knees bent',
            'Feet flat on floor',
            'Lift hips until body forms straight line',
            'Squeeze glutes at top'
        ],
        caloriesPerMinute: 5,
        metValue: 3.0
    },
    {
        id: 'single_leg_deadlift',
        name: 'Single Leg Deadlift',
        category: 'legs',
        difficulty: 'intermediate',
        equipment: 'none',
        primaryMuscles: ['Hamstrings', 'Glutes'],
        secondaryMuscles: ['Lower Back', 'Core'],
        description: 'Balance and hamstring exercise',
        instructions: [
            'Stand on one leg',
            'Hinge at hips',
            'Lower torso while extending free leg behind',
            'Return to standing'
        ],
        caloriesPerMinute: 6,
        metValue: 3.5
    },
    {
        id: 'wall_sit',
        name: 'Wall Sit',
        category: 'legs',
        difficulty: 'beginner',
        equipment: 'none',
        primaryMuscles: ['Quads'],
        secondaryMuscles: ['Glutes'],
        description: 'Isometric quad exercise',
        instructions: [
            'Lean back against wall',
            'Lower down until thighs parallel to ground',
            'Hold position',
            'Keep back against wall'
        ],
        caloriesPerMinute: 5,
        metValue: 3.0
    },
    {
        id: 'pistol_squat',
        name: 'Pistol Squat',
        category: 'legs',
        difficulty: 'advanced',
        equipment: 'none',
        primaryMuscles: ['Quads', 'Glutes'],
        secondaryMuscles: ['Core', 'Balance'],
        description: 'Advanced single-leg squat',
        instructions: [
            'Stand on one leg',
            'Extend other leg forward',
            'Lower down on standing leg',
            'Push back up'
        ],
        caloriesPerMinute: 9,
        metValue: 5.0
    },

    // ==================== SHOULDERS (6 exercises) ====================
    {
        id: 'pike_pushup',
        name: 'Pike Push-up',
        category: 'shoulders',
        difficulty: 'intermediate',
        equipment: 'none',
        primaryMuscles: ['Shoulders'],
        secondaryMuscles: ['Triceps', 'Upper Chest'],
        description: 'Shoulder-focused push-up',
        instructions: [
            'Start in downward dog position',
            'Bend arms to lower head',
            'Push back up',
            'Hips stay elevated'
        ],
        caloriesPerMinute: 7,
        metValue: 4.0
    },
    {
        id: 'handstand_pushup',
        name: 'Handstand Push-up',
        category: 'shoulders',
        difficulty: 'advanced',
        equipment: 'none',
        primaryMuscles: ['Shoulders'],
        secondaryMuscles: ['Triceps', 'Core'],
        description: 'Advanced shoulder exercise',
        instructions: [
            'Kick up into handstand against wall',
            'Lower head toward ground',
            'Push back up',
            'Advanced strength required'
        ],
        caloriesPerMinute: 12,
        metValue: 6.5
    },
    {
        id: 'shoulder_tap',
        name: 'Plank Shoulder Taps',
        category: 'shoulders',
        difficulty: 'beginner',
        equipment: 'none',
        primaryMuscles: ['Shoulders', 'Core'],
        secondaryMuscles: ['Obliques'],
        description: 'Shoulder stability exercise',
        instructions: [
            'Start in plank position',
            'Tap opposite shoulder with one hand',
            'Minimize hip rotation',
            'Alternate sides'
        ],
        caloriesPerMinute: 6,
        metValue: 3.5
    },
    {
        id: 'lateral_raise_bodyweight',
        name: 'Bodyweight Lateral Raise',
        category: 'shoulders',
        difficulty: 'beginner',
        equipment: 'none',
        primaryMuscles: ['Side Delts'],
        secondaryMuscles: [],
        description: 'Side shoulder activation',
        instructions: [
            'Lie on side',
            'Push up with bottom arm',
            'Lift torso off ground',
            'Lower with control'
        ],
        caloriesPerMinute: 5,
        metValue: 3.0
    },
    {
        id: 'wall_walk',
        name: 'Wall Walk',
        category: 'shoulders',
        difficulty: 'advanced',
        equipment: 'none',
        primaryMuscles: ['Shoulders', 'Core'],
        secondaryMuscles: ['Chest'],
        description: 'Advanced shoulder endurance',
        instructions: [
            'Start in plank with feet against wall',
            'Walk feet up wall',
            'Walk hands toward wall',
            'Walk back down'
        ],
        caloriesPerMinute: 10,
        metValue: 5.5
    },
    {
        id: 'scapular_pushup',
        name: 'Scapular Push-up',
        category: 'shoulders',
        difficulty: 'beginner',
        equipment: 'none',
        primaryMuscles: ['Scapular Muscles'],
        secondaryMuscles: ['Shoulders'],
        description: 'Shoulder blade activation',
        instructions: [
            'Hold plank position',
            'Without bending elbows, let shoulder blades pinch together',
            'Push shoulder blades apart',
            'Repeat'
        ],
        caloriesPerMinute: 4,
        metValue: 2.5
    },

    // ==================== ARMS (6 exercises) ====================
    {
        id: 'tricep_dip',
        name: 'Tricep Dip',
        category: 'arms',
        difficulty: 'beginner',
        equipment: 'none',
        primaryMuscles: ['Triceps'],
        secondaryMuscles: ['Shoulders', 'Chest'],
        description: 'Bodyweight tricep exercise',
        instructions: [
            'Use chair or bench',
            'Place hands on edge',
            'Lower body by bending elbows',
            'Push back up'
        ],
        caloriesPerMinute: 6,
        metValue: 3.5
    },
    {
        id: 'close_grip_pushup',
        name: 'Close Grip Push-up',
        category: 'arms',
        difficulty: 'intermediate',
        equipment: 'none',
        primaryMuscles: ['Triceps'],
        secondaryMuscles: ['Chest', 'Shoulders'],
        description: 'Push-up for triceps',
        instructions: [
            'Hands closer than shoulder-width',
            'Keep elbows close to body',
            'Lower down',
            'Push back up'
        ],
        caloriesPerMinute: 7,
        metValue: 4.0
    },
    {
        id: 'bench_dip',
        name: 'Bench Dip',
        category: 'arms',
        difficulty: 'beginner',
        equipment: 'none',
        primaryMuscles: ['Triceps'],
        secondaryMuscles: ['Shoulders'],
        description: 'Tricep dip using bench',
        instructions: [
            'Sit on bench edge',
            'Hands beside hips',
            'Walk feet forward',
            'Lower and raise body'
        ],
        caloriesPerMinute: 5,
        metValue: 3.0
    },
    {
        id: 'bicep_chinup',
        name: 'Chin-up (Bicep Focus)',
        category: 'arms',
        difficulty: 'intermediate',
        equipment: 'pull_up_bar',
        primaryMuscles: ['Biceps'],
        secondaryMuscles: ['Lats', 'Forearms'],
        description: 'Chin-up emphasizing biceps',
        instructions: [
            'Underhand grip on bar',
            'Pull up leading with biceps',
            'Squeeze at top',
            'Lower slowly'
        ],
        caloriesPerMinute: 8,
        metValue: 4.5
    },
    {
        id: 'commando_pullup',
        name: 'Commando Pull-up',
        category: 'arms',
        difficulty: 'advanced',
        equipment: 'pull_up_bar',
        primaryMuscles: ['Biceps', 'Lats'],
        secondaryMuscles: ['Core', 'Forearms'],
        description: 'Alternating grip pull-up',
        instructions: [
            'Grip bar with hands facing each other',
            'Pull up bringing head to one side',
            'Alternate sides each rep',
            'Engages biceps and core'
        ],
        caloriesPerMinute: 9,
        metValue: 5.0
    },
    {
        id: 'forearm_plank_up_down',
        name: 'Plank Up-Down',
        category: 'arms',
        difficulty: 'intermediate',
        equipment: 'none',
        primaryMuscles: ['Triceps', 'Core'],
        secondaryMuscles: ['Shoulders', 'Chest'],
        description: 'Dynamic plank for arms',
        instructions: [
            'Start in forearm plank',
            'Push up onto hands one arm at a time',
            'Lower back to forearms',
            'Alternate leading arm'
        ],
        caloriesPerMinute: 7,
        metValue: 4.0
    },

    // ==================== CORE (8 exercises) ====================
    {
        id: 'plank_front',
        name: 'Front Plank',
        category: 'core',
        difficulty: 'beginner',
        equipment: 'none',
        primaryMuscles: ['Core', 'Abs'],
        secondaryMuscles: ['Shoulders', 'Glutes'],
        description: 'Isometric core hold',
        instructions: [
            'Forearms on ground, elbows under shoulders',
            'Body in straight line',
            'Engage core',
            'Hold position'
        ],
        caloriesPerMinute: 5,
        metValue: 3.0
    },
    {
        id: 'plank_side',
        name: 'Side Plank',
        category: 'core',
        difficulty: 'intermediate',
        equipment: 'none',
        primaryMuscles: ['Obliques', 'Core'],
        secondaryMuscles: ['Shoulders', 'Glutes'],
        description: 'Lateral core stability',
        instructions: [
            'Lie on side',
            'Prop up on forearm',
            'Lift hips off ground',
            'Body in straight line'
        ],
        caloriesPerMinute: 6,
        metValue: 3.5
    },
    {
        id: 'mountain_climber',
        name: 'Mountain Climbers',
        category: 'core',
        difficulty: 'intermediate',
        equipment: 'none',
        primaryMuscles: ['Core', 'Hip Flexors'],
        secondaryMuscles: ['Shoulders', 'Quads'],
        description: 'Dynamic core and cardio',
        instructions: [
            'Start in plank position',
            'Drive one knee toward chest',
            'Quickly switch legs',
            'Maintain steady pace'
        ],
        caloriesPerMinute: 10,
        metValue: 5.5
    },
    {
        id: 'bicycle_crunch',
        name: 'Bicycle Crunches',
        category: 'core',
        difficulty: 'beginner',
        equipment: 'none',
        primaryMuscles: ['Abs', 'Obliques'],
        secondaryMuscles: ['Hip Flexors'],
        description: 'Rotating ab exercise',
        instructions: [
            'Lie on back, hands behind head',
            'Bring opposite elbow to opposite knee',
            'Extend other leg',
            'Alternate sides in pedaling motion'
        ],
        caloriesPerMinute: 6,
        metValue: 3.5
    },
    {
        id: 'leg_raise',
        name: 'Leg Raises',
        category: 'core',
        difficulty: 'intermediate',
        equipment: 'none',
        primaryMuscles: ['Lower Abs', 'Hip Flexors'],
        secondaryMuscles: ['Core'],
        description: 'Lower ab exercise',
        instructions: [
            'Lie on back',
            'Keep legs straight',
            'Lift legs to 90 degrees',
            'Lower without touching ground'
        ],
        caloriesPerMinute: 6,
        metValue: 3.5
    },
    {
        id: 'russian_twist',
        name: 'Russian Twists',
        category: 'core',
        difficulty: 'beginner',
        equipment: 'none',
        primaryMuscles: ['Obliques', 'Abs'],
        secondaryMuscles: ['Lower Back'],
        description: 'Rotational core exercise',
        instructions: [
            'Sit with knees bent, feet off ground',
            'Lean back slightly',
            'Rotate torso side to side',
            'Tap ground on each side'
        ],
        caloriesPerMinute: 5,
        metValue: 3.0
    },
    {
        id: 'hollow_body_hold',
        name: 'Hollow Body Hold',
        category: 'core',
        difficulty: 'intermediate',
        equipment: 'none',
        primaryMuscles: ['Abs', 'Core'],
        secondaryMuscles: ['Hip Flexors'],
        description: 'Advanced core isometric',
        instructions: [
            'Lie on back',
            'Lift shoulders and legs off ground',
            'Arms extended overhead',
            'Lower back pressed to floor'
        ],
        caloriesPerMinute: 5,
        metValue: 3.0
    },
    {
        id: 'v_up',
        name: 'V-Ups',
        category: 'core',
        difficulty: 'advanced',
        equipment: 'none',
        primaryMuscles: ['Abs', 'Core'],
        secondaryMuscles: ['Hip Flexors'],
        description: 'Dynamic ab exercise',
        instructions: [
            'Lie flat on back',
            'Simultaneously lift legs and torso',
            'Touch toes at top',
            'Lower back down with control'
        ],
        caloriesPerMinute: 8,
        metValue: 4.5
    },

    // ==================== CARDIO / WARM-UP (6 exercises) ====================
    {
        id: 'jumping_jacks',
        name: 'Jumping Jacks',
        category: 'cardio',
        difficulty: 'beginner',
        equipment: 'none',
        primaryMuscles: ['Full Body'],
        secondaryMuscles: ['Calves', 'Shoulders'],
        description: 'Classic cardio warm-up',
        instructions: [
            'Stand with feet together',
            'Jump while spreading legs and raising arms',
            'Jump back to starting position',
            'Maintain steady rhythm'
        ],
        caloriesPerMinute: 8,
        metValue: 4.5
    },
    {
        id: 'high_knees',
        name: 'High Knees',
        category: 'cardio',
        difficulty: 'intermediate',
        equipment: 'none',
        primaryMuscles: ['Hip Flexors', 'Core'],
        secondaryMuscles: ['Quads', 'Calves'],
        description: 'Running in place with high knees',
        instructions: [
            'Run in place',
            'Lift knees to waist height',
            'Pump arms',
            'Quick tempo'
        ],
        caloriesPerMinute: 12,
        metValue: 6.5
    },
    {
        id: 'burpee',
        name: 'Burpees',
        category: 'cardio',
        difficulty: 'intermediate',
        equipment: 'none',
        primaryMuscles: ['Full Body'],
        secondaryMuscles: ['Cardiovascular'],
        description: 'Full body cardio exercise',
        instructions: [
            'Start standing',
            'Drop into squat and place hands on ground',
            'Jump feet back to plank',
            'Jump feet forward and explode up'
        ],
        caloriesPerMinute: 12,
        metValue: 8.0
    },
    {
        id: 'butt_kicks',
        name: 'Butt Kicks',
        category: 'cardio',
        difficulty: 'beginner',
        equipment: 'none',
        primaryMuscles: ['Hamstrings', 'Glutes'],
        secondaryMuscles: ['Calves'],
        description: 'Cardio hamstring activation',
        instructions: [
            'Jog in place',
            'Kick heels up toward glutes',
            'Quick pace',
            'Stay on toes'
        ],
        caloriesPerMinute: 9,
        metValue: 5.0
    },
    {
        id: 'skater_hops',
        name: 'Skater Hops',
        category: 'cardio',
        difficulty: 'intermediate',
        equipment: 'none',
        primaryMuscles: ['Glutes', 'Quads'],
        secondaryMuscles: ['Core', 'Calves'],
        description: 'Lateral jump exercise',
        instructions: [
            'Jump laterally from one leg to other',
            'Land softly',
            'Swing arms for balance',
            'Fast tempo'
        ],
        caloriesPerMinute: 11,
        metValue: 6.0
    },
    {
        id: 'bear_crawl',
        name: 'Bear Crawl',
        category: 'cardio',
        difficulty: 'intermediate',
        equipment: 'none',
        primaryMuscles: ['Full Body', 'Core'],
        secondaryMuscles: ['Shoulders', 'Quads'],
        description: 'Crawling movement for conditioning',
        instructions: [
            'Start on hands and knees',
            'Lift knees slightly off ground',
            'Crawl forward',
            'Keep hips level'
        ],
        caloriesPerMinute: 9,
        metValue: 5.0
    }
];

// Helper functions
export function getExercisesByCategory(category: ExerciseCategory): Exercise[] {
    return EXERCISE_LIBRARY.filter(ex => ex.category === category);
}

export function getExerciseById(id: string): Exercise | undefined {
    return EXERCISE_LIBRARY.find(ex => ex.id === id);
}

export function getExercisesByDifficulty(difficulty: DifficultyLevel): Exercise[] {
    return EXERCISE_LIBRARY.filter(ex => ex.difficulty === difficulty);
}

export function getExercisesByEquipment(equipment: EquipmentType): Exercise[] {
    return EXERCISE_LIBRARY.filter(ex => ex.equipment === equipment);
}

// Get total exercise count by category
export function getExerciseCounts(): Record<ExerciseCategory, number> {
    return {
        chest: getExercisesByCategory('chest').length,
        back: getExercisesByCategory('back').length,
        legs: getExercisesByCategory('legs').length,
        shoulders: getExercisesByCategory('shoulders').length,
        arms: getExercisesByCategory('arms').length,
        core: getExercisesByCategory('core').length,
        cardio: getExercisesByCategory('cardio').length
    };
}
