/**
 * Archetype Classification Engine
 * Deterministic scoring based on onboarding answers.
 * Each archetype represents a training personality.
 */

const ARCHETYPES = {
    diesel: {
        id: 'diesel',
        name: 'Diesel Engine',
        emoji: '🚂',
        tagline: 'Slow to start, impossible to stop.',
        description: 'You thrive on consistency and endurance. You might not be the fastest off the line, but once you build momentum, nothing can break you. Your training style favors progressive overload and steady, relentless effort.',
        color: '#f59e0b',
        strengths: ['Endurance', 'Consistency', 'Mental toughness'],
        watchOuts: ['Can overtrain', 'May ignore recovery signals'],
    },
    spark: {
        id: 'spark',
        name: 'Spark',
        emoji: '⚡',
        tagline: 'Explosive energy, needs the right fuel.',
        description: 'You bring incredible intensity but burn out quickly if not managed. Your ideal plan has high variety, short intense bursts, and built-in novelty to keep you engaged. You\'re the person who PRs on a random Tuesday.',
        color: '#7c3aed',
        strengths: ['Explosive power', 'Adaptability', 'High motivation peaks'],
        watchOuts: ['Burnout risk', 'Inconsistency', 'Skips rest days'],
    },
    phoenix: {
        id: 'phoenix',
        name: 'Phoenix',
        emoji: '🔥',
        tagline: 'Rises from every setback, stronger.',
        description: 'You\'ve been through injuries, life disruptions, or long breaks — and you keep coming back. Your plan needs to account for rebuilding phases and smart progression. Your resilience is your superpower.',
        color: '#ef4444',
        strengths: ['Resilience', 'Self-awareness', 'Adaptability'],
        watchOuts: ['May push too hard too fast', 'Impatience with progress'],
    },
    architect: {
        id: 'architect',
        name: 'The Architect',
        emoji: '📐',
        tagline: 'Plans everything. Executes precisely.',
        description: 'You love structure, data, and optimization. You want to understand *why* each exercise is in your plan. You track everything. Your training is methodical and your progress is steady because you leave nothing to chance.',
        color: '#06d6a0',
        strengths: ['Discipline', 'Data-driven', 'Structured approach'],
        watchOuts: ['Analysis paralysis', 'Can be inflexible'],
    },
    wildcard: {
        id: 'wildcard',
        name: 'Wildcard',
        emoji: '🎲',
        tagline: 'Thrives on chaos. Bored by routine.',
        description: 'Routine kills your motivation. You need variety, surprise, and a sense of play in your training. Your plan should rotate exercises frequently and include unconventional movements. When it\'s fun, you\'re unstoppable.',
        color: '#ec4899',
        strengths: ['Creativity', 'Enjoyment-driven', 'Open to trying anything'],
        watchOuts: ['May skip fundamentals', 'Lacks structure'],
    },
    monk: {
        id: 'monk',
        name: 'The Monk',
        emoji: '🧘',
        tagline: 'Mind and body are one.',
        description: 'You approach fitness as a holistic practice. Breath, mindfulness, and body awareness are as important as reps and sets. Your training integrates mobility, yoga, and mental focus alongside strength work.',
        color: '#8b5cf6',
        strengths: ['Mind-muscle connection', 'Flexibility', 'Recovery focus'],
        watchOuts: ['May under-challenge physically', 'Can plateau on strength'],
    },
}

/**
 * Classify a user profile into an archetype.
 * Uses a weighted scoring system across multiple dimensions.
 */
export function classifyArchetype(profile) {
    const scores = {
        diesel: 0,
        spark: 0,
        phoenix: 0,
        architect: 0,
        wildcard: 0,
        monk: 0,
    }

    // --- Fitness Level ---
    if (profile.fitnessLevel === 'beginner') {
        scores.phoenix += 2
        scores.spark += 1
    } else if (profile.fitnessLevel === 'intermediate') {
        scores.diesel += 2
        scores.architect += 1
    } else if (profile.fitnessLevel === 'advanced') {
        scores.architect += 2
        scores.diesel += 1
    }

    // --- Injuries ---
    if (profile.injuries && profile.injuries.length > 0) {
        scores.phoenix += 3
        scores.monk += 1
    }

    // --- Stress Level ---
    if (profile.stressLevel >= 4) {
        scores.monk += 3
        scores.phoenix += 1
    } else if (profile.stressLevel <= 2) {
        scores.spark += 1
        scores.diesel += 1
    }

    // --- Sleep ---
    const sleep = Number(profile.sleepHours) || 7
    if (sleep < 6) {
        scores.phoenix += 1
        scores.monk += 2
    } else if (sleep >= 8) {
        scores.diesel += 1
        scores.spark += 1
    }

    // --- Quit Reason Chips ---
    const chips = profile.quitReasonChips || []
    if (chips.includes('boredom')) { scores.wildcard += 3; scores.spark += 1 }
    if (chips.includes('burnout')) { scores.monk += 2; scores.phoenix += 1 }
    if (chips.includes('no-time')) { scores.diesel += 1; scores.architect += 1 }
    if (chips.includes('no-results')) { scores.architect += 2 }
    if (chips.includes('injury')) { scores.phoenix += 3 }
    if (chips.includes('motivation')) { scores.spark += 2; scores.wildcard += 1 }
    if (chips.includes('life-event')) { scores.phoenix += 2; scores.diesel += 1 }

    // --- Job Type ---
    if (profile.jobType === 'sedentary') {
        scores.monk += 1
        scores.architect += 1
    } else if (profile.jobType === 'active') {
        scores.diesel += 2
    }

    // --- Fitness Test Results ---
    const pushups = Number(profile.pushups) || 0
    const plank = Number(profile.plankSeconds) || 0
    const squats = Number(profile.squats) || 0

    const totalScore = pushups + (plank / 10) + squats
    if (totalScore > 80) {
        scores.diesel += 2
        scores.architect += 1
    } else if (totalScore > 40) {
        scores.spark += 1
        scores.diesel += 1
    } else {
        scores.phoenix += 1
        scores.wildcard += 1
    }

    // --- Coach Persona ---
    if (profile.coachPersona === 'drill') { scores.diesel += 1; scores.architect += 1 }
    if (profile.coachPersona === 'friend') { scores.wildcard += 1; scores.spark += 1 }
    if (profile.coachPersona === 'zen') { scores.monk += 2 }
    if (profile.coachPersona === 'hype') { scores.spark += 2 }

    // --- Path ---
    if (profile.path === 'athlete') {
        scores.architect += 2
        scores.diesel += 1
    }

    // Find the winner
    let maxScore = 0
    let winner = 'diesel'
    for (const [key, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score
            winner = key
        }
    }

    return ARCHETYPES[winner]
}

export { ARCHETYPES }
export default classifyArchetype
