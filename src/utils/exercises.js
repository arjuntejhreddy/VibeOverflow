/**
 * Exercise Database
 * ~80 exercises with muscle groups, difficulty, equipment, and injury flags.
 */

const EXERCISES = [
    // CHEST
    { id: 'pushup', name: 'Push-ups', muscle: 'chest', secondary: ['triceps', 'shoulders'], difficulty: 1, equipment: 'none', injuryFlags: ['Shoulders', 'Left Wrist', 'Right Wrist'], calories: 8, tiredAlt: 'knee-pushup', why: 'Foundational pushing movement. Builds chest, shoulder, and tricep strength.' },
    { id: 'knee-pushup', name: 'Knee Push-ups', muscle: 'chest', secondary: ['triceps'], difficulty: 0, equipment: 'none', injuryFlags: ['Shoulders'], calories: 5, tiredAlt: 'wall-pushup', why: 'Modified pushup for building base strength. Same muscles, reduced load.' },
    { id: 'wall-pushup', name: 'Wall Push-ups', muscle: 'chest', secondary: ['triceps'], difficulty: 0, equipment: 'none', injuryFlags: [], calories: 3, why: 'Zero-impact chest activation. Great for rehab or absolute beginners.' },
    { id: 'diamond-pushup', name: 'Diamond Push-ups', muscle: 'chest', secondary: ['triceps'], difficulty: 2, equipment: 'none', injuryFlags: ['Left Wrist', 'Right Wrist'], calories: 9, tiredAlt: 'pushup', why: 'Tricep-dominant variation. Narrow hand position increases tricep activation.' },
    { id: 'incline-pushup', name: 'Incline Push-ups', muscle: 'chest', secondary: ['shoulders'], difficulty: 0, equipment: 'none', injuryFlags: [], calories: 6, tiredAlt: 'wall-pushup', why: 'Targets upper chest with reduced body weight.' },
    { id: 'decline-pushup', name: 'Decline Push-ups', muscle: 'chest', secondary: ['shoulders'], difficulty: 2, equipment: 'none', injuryFlags: ['Shoulders'], calories: 9, tiredAlt: 'pushup', why: 'Feet elevated shifts emphasis to upper chest and front deltoids.' },
    { id: 'dumbbell-press', name: 'Dumbbell Chest Press', muscle: 'chest', secondary: ['triceps', 'shoulders'], difficulty: 1, equipment: 'dumbbells', injuryFlags: ['Shoulders'], calories: 10, tiredAlt: 'pushup', why: 'Free weight pressing builds balanced chest strength.' },

    // BACK
    { id: 'superman', name: 'Superman Hold', muscle: 'upper-back', secondary: ['lower-back', 'glutes'], difficulty: 1, equipment: 'none', injuryFlags: ['Lower Back'], calories: 6, tiredAlt: 'bird-dog', why: 'Strengthens entire posterior chain. Improves posture and spinal stability.' },
    { id: 'bird-dog', name: 'Bird Dog', muscle: 'upper-back', secondary: ['core', 'glutes'], difficulty: 0, equipment: 'none', injuryFlags: [], calories: 4, why: 'Anti-rotation core exercise. Improves spinal stability and coordination.' },
    { id: 'reverse-snow-angel', name: 'Reverse Snow Angel', muscle: 'upper-back', secondary: ['shoulders'], difficulty: 1, equipment: 'none', injuryFlags: ['Shoulders'], calories: 5, tiredAlt: 'superman', why: 'Targets rhomboids and rear delts. Great posture corrector.' },
    { id: 'dumbbell-row', name: 'Dumbbell Row', muscle: 'upper-back', secondary: ['arms'], difficulty: 1, equipment: 'dumbbells', injuryFlags: ['Lower Back'], calories: 8, tiredAlt: 'superman', why: 'Unilateral pulling builds back thickness and fixes imbalances.' },
    { id: 'pullup', name: 'Pull-ups', muscle: 'upper-back', secondary: ['arms'], difficulty: 3, equipment: 'pullup-bar', injuryFlags: ['Shoulders', 'Left Elbow', 'Right Elbow'], calories: 10, tiredAlt: 'dumbbell-row', why: 'King of upper body pulling exercises. Builds lat width and grip strength.' },

    // SHOULDERS
    { id: 'pike-pushup', name: 'Pike Push-ups', muscle: 'shoulders', secondary: ['triceps'], difficulty: 2, equipment: 'none', injuryFlags: ['Shoulders', 'Left Wrist', 'Right Wrist'], calories: 8, tiredAlt: 'lateral-raise', why: 'Bodyweight shoulder press alternative. Builds overhead pressing strength.' },
    { id: 'lateral-raise', name: 'Lateral Raises', muscle: 'shoulders', secondary: [], difficulty: 1, equipment: 'dumbbells', injuryFlags: ['Shoulders'], calories: 5, tiredAlt: 'arm-circles', why: 'Isolates medial deltoid. Key for shoulder width and definition.' },
    { id: 'arm-circles', name: 'Arm Circles', muscle: 'shoulders', secondary: [], difficulty: 0, equipment: 'none', injuryFlags: [], calories: 3, why: 'Warm-up and mobility exercise. Builds shoulder endurance.' },
    { id: 'shoulder-press', name: 'Overhead Press', muscle: 'shoulders', secondary: ['triceps'], difficulty: 2, equipment: 'dumbbells', injuryFlags: ['Shoulders', 'Neck'], calories: 9, tiredAlt: 'pike-pushup', why: 'Primary overhead pushing movement. Builds shoulder strength and stability.' },

    // ARMS
    { id: 'bicep-curl', name: 'Bicep Curls', muscle: 'arms', secondary: [], difficulty: 1, equipment: 'dumbbells', injuryFlags: ['Left Elbow', 'Right Elbow'], calories: 5, tiredAlt: 'isometric-curl', why: 'Direct bicep isolation. Builds arm size and pulling strength.' },
    { id: 'isometric-curl', name: 'Isometric Hold', muscle: 'arms', secondary: [], difficulty: 0, equipment: 'dumbbells', injuryFlags: [], calories: 3, why: 'Static hold builds time under tension. Joint-friendly arm builder.' },
    { id: 'tricep-dip', name: 'Tricep Dips', muscle: 'arms', secondary: ['chest', 'shoulders'], difficulty: 1, equipment: 'none', injuryFlags: ['Shoulders', 'Left Elbow', 'Right Elbow'], calories: 7, tiredAlt: 'diamond-pushup', why: 'Bodyweight tricep builder. Use a chair or bench edge.' },
    { id: 'hammer-curl', name: 'Hammer Curls', muscle: 'arms', secondary: [], difficulty: 1, equipment: 'dumbbells', injuryFlags: ['Left Wrist', 'Right Wrist'], calories: 5, tiredAlt: 'bicep-curl', why: 'Neutral grip targets brachialis. Builds forearm and arm thickness.' },

    // CORE
    { id: 'plank', name: 'Plank', muscle: 'core', secondary: ['shoulders'], difficulty: 1, equipment: 'none', injuryFlags: ['Lower Back', 'Shoulders'], calories: 5, tiredAlt: 'dead-bug', why: 'Isometric core stabilizer. Builds anti-extension strength.' },
    { id: 'dead-bug', name: 'Dead Bug', muscle: 'core', secondary: [], difficulty: 0, equipment: 'none', injuryFlags: [], calories: 4, why: 'Low-back-safe core exercise. Teaches bracing and coordination.' },
    { id: 'mountain-climber', name: 'Mountain Climbers', muscle: 'core', secondary: ['shoulders', 'quads'], difficulty: 2, equipment: 'none', injuryFlags: ['Left Wrist', 'Right Wrist', 'Left Knee', 'Right Knee'], calories: 10, tiredAlt: 'plank', why: 'Cardio meets core. Elevates heart rate while building abdominal endurance.' },
    { id: 'russian-twist', name: 'Russian Twists', muscle: 'core', secondary: [], difficulty: 1, equipment: 'none', injuryFlags: ['Lower Back'], calories: 6, tiredAlt: 'dead-bug', why: 'Rotational core exercise. Builds oblique strength.' },
    { id: 'bicycle-crunch', name: 'Bicycle Crunches', muscle: 'core', secondary: [], difficulty: 1, equipment: 'none', injuryFlags: ['Neck', 'Lower Back'], calories: 7, tiredAlt: 'dead-bug', why: 'Dynamic crunch variation. Targets both rectus abdominis and obliques.' },
    { id: 'leg-raise', name: 'Leg Raises', muscle: 'core', secondary: ['quads'], difficulty: 2, equipment: 'none', injuryFlags: ['Lower Back', 'Left Hip', 'Right Hip'], calories: 7, tiredAlt: 'dead-bug', why: 'Lower ab emphasis. Builds hip flexor strength and core control.' },
    { id: 'side-plank', name: 'Side Plank', muscle: 'core', secondary: ['shoulders'], difficulty: 1, equipment: 'none', injuryFlags: ['Shoulders'], calories: 4, tiredAlt: 'dead-bug', why: 'Lateral core stability. Strengthens obliques and prevents side-to-side imbalances.' },

    // LEGS — QUADS
    { id: 'squat', name: 'Bodyweight Squats', muscle: 'quads', secondary: ['glutes', 'hamstrings'], difficulty: 1, equipment: 'none', injuryFlags: ['Left Knee', 'Right Knee', 'Lower Back'], calories: 8, tiredAlt: 'wall-sit', why: 'Fundamental lower body movement. Builds quad, glute, and core strength.' },
    { id: 'wall-sit', name: 'Wall Sit', muscle: 'quads', secondary: ['glutes'], difficulty: 1, equipment: 'none', injuryFlags: ['Left Knee', 'Right Knee'], calories: 5, tiredAlt: 'half-squat', why: 'Isometric quad builder. Builds muscular endurance with low joint impact.' },
    { id: 'half-squat', name: 'Half Squats', muscle: 'quads', secondary: ['glutes'], difficulty: 0, equipment: 'none', injuryFlags: [], calories: 5, why: 'Reduced range of motion for knee-friendly quad training.' },
    { id: 'jump-squat', name: 'Jump Squats', muscle: 'quads', secondary: ['glutes', 'calves'], difficulty: 3, equipment: 'none', injuryFlags: ['Left Knee', 'Right Knee', 'Left Ankle', 'Right Ankle'], calories: 12, tiredAlt: 'squat', why: 'Plyometric power builder. Develops explosive leg strength.' },
    { id: 'lunge', name: 'Lunges', muscle: 'quads', secondary: ['glutes', 'hamstrings'], difficulty: 1, equipment: 'none', injuryFlags: ['Left Knee', 'Right Knee'], calories: 8, tiredAlt: 'squat', why: 'Unilateral leg movement. Fixes imbalances and builds stability.' },
    { id: 'goblet-squat', name: 'Goblet Squat', muscle: 'quads', secondary: ['glutes', 'core'], difficulty: 1, equipment: 'dumbbells', injuryFlags: ['Left Knee', 'Right Knee'], calories: 9, tiredAlt: 'squat', why: 'Front-loaded squat improves depth and upright posture.' },
    { id: 'step-up', name: 'Step-ups', muscle: 'quads', secondary: ['glutes'], difficulty: 1, equipment: 'none', injuryFlags: ['Left Knee', 'Right Knee'], calories: 7, tiredAlt: 'squat', why: 'Functional single-leg strength. Mimics real-world movement.' },

    // LEGS — GLUTES
    { id: 'glute-bridge', name: 'Glute Bridge', muscle: 'glutes', secondary: ['hamstrings', 'core'], difficulty: 0, equipment: 'none', injuryFlags: [], calories: 5, why: 'Primary glute activator. Fixes "dead butt" from sitting all day.' },
    { id: 'hip-thrust', name: 'Hip Thrust', muscle: 'glutes', secondary: ['hamstrings'], difficulty: 1, equipment: 'none', injuryFlags: ['Lower Back'], calories: 8, tiredAlt: 'glute-bridge', why: 'Most effective glute builder. Elevated back increases range of motion.' },
    { id: 'donkey-kick', name: 'Donkey Kicks', muscle: 'glutes', secondary: [], difficulty: 0, equipment: 'none', injuryFlags: ['Left Knee', 'Right Knee'], calories: 4, why: 'Glute isolation with minimal joint stress.' },
    { id: 'fire-hydrant', name: 'Fire Hydrants', muscle: 'glutes', secondary: ['core'], difficulty: 0, equipment: 'none', injuryFlags: [], calories: 4, why: 'Hip abduction strengthens lateral glute. Improves hip mobility.' },

    // LEGS — HAMSTRINGS
    { id: 'romanian-deadlift', name: 'Romanian Deadlift', muscle: 'hamstrings', secondary: ['glutes', 'lower-back'], difficulty: 2, equipment: 'dumbbells', injuryFlags: ['Lower Back'], calories: 9, tiredAlt: 'good-morning', why: 'Hip hinge pattern. Best hamstring lengthener and posterior chain builder.' },
    { id: 'good-morning', name: 'Good Mornings', muscle: 'hamstrings', secondary: ['lower-back', 'glutes'], difficulty: 1, equipment: 'none', injuryFlags: ['Lower Back'], calories: 6, tiredAlt: 'glute-bridge', why: 'Bodyweight hip hinge. Builds hamstring and lower back connection.' },
    { id: 'single-leg-deadlift', name: 'Single-leg Deadlift', muscle: 'hamstrings', secondary: ['glutes', 'core'], difficulty: 2, equipment: 'none', injuryFlags: ['Lower Back', 'Left Ankle', 'Right Ankle'], calories: 7, tiredAlt: 'good-morning', why: 'Balance + posterior chain. Fixes left-right strength differences.' },

    // LEGS — CALVES
    { id: 'calf-raise', name: 'Calf Raises', muscle: 'calves', secondary: [], difficulty: 0, equipment: 'none', injuryFlags: ['Left Ankle', 'Right Ankle'], calories: 4, why: 'Direct calf isolation. Builds ankle stability and lower leg strength.' },
    { id: 'single-calf-raise', name: 'Single-leg Calf Raise', muscle: 'calves', secondary: [], difficulty: 1, equipment: 'none', injuryFlags: ['Left Ankle', 'Right Ankle'], calories: 5, tiredAlt: 'calf-raise', why: 'Unilateral calf work. Doubles the load per leg for greater strength gain.' },

    // CARDIO
    { id: 'jumping-jack', name: 'Jumping Jacks', muscle: 'cardio', secondary: ['shoulders', 'calves'], difficulty: 1, equipment: 'none', injuryFlags: ['Left Knee', 'Right Knee', 'Left Ankle', 'Right Ankle'], calories: 10, tiredAlt: 'march-in-place', why: 'Classic full-body cardio. Elevates heart rate quickly.' },
    { id: 'march-in-place', name: 'March in Place', muscle: 'cardio', secondary: ['core'], difficulty: 0, equipment: 'none', injuryFlags: [], calories: 4, why: 'Low-impact cardio. Perfect for warm-ups or joint-friendly conditioning.' },
    { id: 'high-knees', name: 'High Knees', muscle: 'cardio', secondary: ['quads', 'core'], difficulty: 2, equipment: 'none', injuryFlags: ['Left Knee', 'Right Knee'], calories: 12, tiredAlt: 'march-in-place', why: 'Explosive cardio. Builds hip flexor power and aerobic capacity.' },
    { id: 'burpee', name: 'Burpees', muscle: 'cardio', secondary: ['chest', 'quads', 'core'], difficulty: 3, equipment: 'none', injuryFlags: ['Left Wrist', 'Right Wrist', 'Left Knee', 'Right Knee', 'Lower Back'], calories: 15, tiredAlt: 'jumping-jack', why: 'Full-body metabolic destroyer. Maximum calorie burn per minute.' },
    { id: 'skater', name: 'Skater Hops', muscle: 'cardio', secondary: ['glutes', 'quads'], difficulty: 2, equipment: 'none', injuryFlags: ['Left Knee', 'Right Knee', 'Left Ankle', 'Right Ankle'], calories: 10, tiredAlt: 'jumping-jack', why: 'Lateral cardio builds balance, agility, and outer glute strength.' },
    { id: 'shadow-boxing', name: 'Shadow Boxing', muscle: 'cardio', secondary: ['shoulders', 'core'], difficulty: 1, equipment: 'none', injuryFlags: ['Shoulders'], calories: 9, tiredAlt: 'march-in-place', why: 'Fun cardio with upper body engagement. Great stress reliever.' },

    // FLEXIBILITY / MOBILITY
    { id: 'yoga-flow', name: 'Sun Salutation', muscle: 'flexibility', secondary: ['core', 'shoulders'], difficulty: 1, equipment: 'none', injuryFlags: [], calories: 5, why: 'Full-body flow connecting breath and movement.' },
    { id: 'pigeon-stretch', name: 'Pigeon Stretch', muscle: 'flexibility', secondary: ['glutes'], difficulty: 1, equipment: 'none', injuryFlags: ['Left Hip', 'Right Hip', 'Left Knee', 'Right Knee'], calories: 2, why: 'Deep hip opener. Relieves tightness from sitting.' },
    { id: 'cat-cow', name: 'Cat-Cow Stretch', muscle: 'flexibility', secondary: ['core'], difficulty: 0, equipment: 'none', injuryFlags: [], calories: 2, why: 'Spinal mobility warmup. Releases back tension.' },
    { id: 'world-greatest-stretch', name: 'World\'s Greatest Stretch', muscle: 'flexibility', secondary: ['quads', 'core', 'shoulders'], difficulty: 1, equipment: 'none', injuryFlags: [], calories: 4, why: 'Hits every major area in one movement. The ultimate warm-up.' },
]

/**
 * Get exercises filtered by injuries and optionally by muscle group
 */
export function getFilteredExercises(injuries = [], muscleGroup = null, equipment = null) {
    return EXERCISES.filter((ex) => {
        // Exclude exercises that conflict with injuries
        if (injuries.some((inj) => ex.injuryFlags.includes(inj))) return false
        if (muscleGroup && ex.muscle !== muscleGroup) return false
        if (equipment === 'none' && ex.equipment !== 'none') return false
        return true
    })
}

/**
 * Get the tired alternative for an exercise
 */
export function getTiredAlternative(exerciseId) {
    const ex = EXERCISES.find((e) => e.id === exerciseId)
    if (!ex || !ex.tiredAlt) return null
    return EXERCISES.find((e) => e.id === ex.tiredAlt)
}

/**
 * Get exercise by ID
 */
export function getExerciseById(id) {
    return EXERCISES.find((e) => e.id === id)
}

/**
 * Find a swap exercise — same muscle group, different exercise
 */
export function findSwap(exerciseId, injuries = []) {
    const original = EXERCISES.find((e) => e.id === exerciseId)
    if (!original) return null
    const alternatives = EXERCISES.filter((e) =>
        e.id !== exerciseId &&
        e.muscle === original.muscle &&
        !injuries.some((inj) => e.injuryFlags.includes(inj))
    )
    return alternatives[Math.floor(Math.random() * alternatives.length)] || null
}

/**
 * Generate a workout plan for a given day
 */
export function generateWorkout(profile, durationMinutes = 30) {
    const injuries = profile.injuries || []
    const level = profile.fitnessLevel || 'beginner'
    const weakZones = profile.weakZones || []

    const muscleGroups = ['chest', 'upper-back', 'shoulders', 'core', 'quads', 'glutes', 'hamstrings', 'cardio']

    // Prioritize weak zones
    const prioritized = [
        ...weakZones.filter((z) => muscleGroups.includes(z)),
        ...muscleGroups.filter((m) => !weakZones.includes(m)),
    ]

    const maxExercises = durationMinutes <= 15 ? 4 : durationMinutes <= 30 ? 6 : 8
    const workout = []
    const usedMuscles = new Set()

    // Pick exercises — prioritize weak zones, then fill with variety
    for (const muscle of prioritized) {
        if (workout.length >= maxExercises) break
        const candidates = getFilteredExercises(injuries, muscle)
            .filter((e) => {
                if (level === 'beginner') return e.difficulty <= 1
                if (level === 'intermediate') return e.difficulty <= 2
                return true
            })
            .sort(() => Math.random() - 0.5)

        if (candidates.length > 0 && !usedMuscles.has(muscle)) {
            const ex = candidates[0]
            const sets = level === 'beginner' ? 2 : level === 'intermediate' ? 3 : 4
            const reps = ex.muscle === 'cardio' || ex.muscle === 'flexibility'
                ? '30 sec'
                : level === 'beginner' ? 8 : level === 'intermediate' ? 12 : 15
            workout.push({ ...ex, sets, reps })
            usedMuscles.add(muscle)
        }
    }

    // Always include warm-up and cool-down
    const warmup = EXERCISES.find((e) => e.id === 'cat-cow') || EXERCISES.find((e) => e.id === 'march-in-place')
    const cooldown = EXERCISES.find((e) => e.id === 'yoga-flow') || EXERCISES.find((e) => e.id === 'pigeon-stretch')

    return { warmup, exercises: workout, cooldown }
}

export { EXERCISES }
export default EXERCISES
