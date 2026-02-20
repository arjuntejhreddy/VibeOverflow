/**
 * Deterministic Training Twin — no API needed.
 * Twin is generated from the user's Google account data (email hash).
 */

const TWIN_NAMES = [
    'Alex', 'Jordan', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery', 'Dakota',
    'Sage', 'Harper', 'Kai', 'Reese', 'Sam', 'Jamie', 'Taylor', 'Drew',
    'Nico', 'Ash', 'Robin', 'Emery', 'Blake', 'Skyler', 'Hayden', 'Finley',
]

const TWIN_CITIES = [
    'Tokyo, Japan', 'São Paulo, Brazil', 'Berlin, Germany', 'Cape Town, South Africa',
    'Seoul, South Korea', 'Melbourne, Australia', 'Toronto, Canada', 'Stockholm, Sweden',
    'Mumbai, India', 'London, UK', 'Barcelona, Spain', 'Portland, USA',
    'Auckland, New Zealand', 'Lagos, Nigeria', 'Dublin, Ireland', 'Kyoto, Japan',
]

const ARCHETYPES = ['Diesel Engine', 'Spark', 'Phoenix', 'Architect', 'Wildcard', 'Monk']

const BACKSTORIES = [
    'Started training after a tough year. Working out became therapy and never stopped.',
    'Former couch potato who discovered running during lockdown and got hooked.',
    'Grew up playing sports, took a break, and is now rebuilding from scratch.',
    'Night owl who swapped late-night gaming for early morning gym sessions.',
    'Tries every fitness trend — from CrossFit to yoga — and sticks with what clicks.',
    'Quiet but consistent. Believes showing up every day matters more than intensity.',
    'An ex-athlete who had an injury and is now getting back into form carefully.',
    'Started for aesthetics, stayed for mental health. Never looked back.',
]

const GOALS = [
    'Build consistent workout habits',
    'Get stronger without a gym',
    'Lose fat and gain muscle',
    'Run a half marathon',
    'Stay active despite a desk job',
    'Build a home workout routine',
    'Improve flexibility and mobility',
    'Train for a sport comeback',
]

const REACTION_RESPONSES = {
    'I showed up': [
        { emoji: '💪', message: 'That\'s what matters most. I showed up too — we\'re doing this!' },
        { emoji: '🤜', message: 'Same here! Another day logged. Proud of us.' },
        { emoji: '🔥', message: 'Showing up IS the workout. Everything else is bonus.' },
    ],
    'Personal best': [
        { emoji: '🎉', message: 'NO WAY! That\'s incredible — tell me everything!' },
        { emoji: '🏆', message: 'You\'re on fire! I\'m chasing a PB too this week.' },
        { emoji: '⚡', message: 'PB energy is contagious! I can feel it from here.' },
    ],
    'Struggled but stayed': [
        { emoji: '🫂', message: 'That takes MORE strength than a perfect day. Respect.' },
        { emoji: '💎', message: 'Staying when it\'s hard — that\'s where growth happens.' },
        { emoji: '🤝', message: 'I had a rough one yesterday too. We push through together.' },
    ],
    'Proud of us': [
        { emoji: '❤️', message: 'This partnership is honestly keeping me going. Thank YOU.' },
        { emoji: '🌟', message: 'Same! Having someone in your corner makes all the difference.' },
        { emoji: '🤗', message: 'We\'re building something real here. Day by day.' },
    ],
    'Need a nudge': [
        { emoji: '📣', message: 'HEY! You\'ve come too far to stop now. 10 minutes — that\'s all I\'m asking!' },
        { emoji: '💭', message: 'Remember why you started. I\'ll do a set right now with you — go!' },
        { emoji: '🚀', message: 'Here\'s your nudge: just start the warm-up. The rest will follow.' },
    ],
}

const WEEKLY_SYNC_TEMPLATES = [
    'Another week down! You did {userWorkouts} workouts and I did {twinWorkouts}. {comparison} Let\'s keep this energy going!',
    'Week recap: {userWorkouts} sessions for you, {twinWorkouts} for me. {comparison} Next week we go harder!',
    'Hey! We crushed it — {userWorkouts} and {twinWorkouts} workouts between us. {comparison} Proud of our streak.',
    '{comparison} You hit {userWorkouts} sessions this week. I managed {twinWorkouts}. Let\'s make next week even better!',
]

const DAILY_SUMMARIES_ACTIVE = [
    'Had a solid push day. Shoulders are toast but feeling good!',
    'Quick 20-minute HIIT session. Sweat was real.',
    'Leg day done. Walking like a robot but worth it.',
    'Morning yoga flow followed by some bodyweight circuits.',
    'Back and biceps today. Pulled heavier than last week!',
    'Full body session — kept it simple but pushed hard.',
    'Outdoor run, 5K in the cold. Fresh air hits different.',
    'Core day. Planks are getting easier so I added weight.',
]

const DAILY_SUMMARIES_REST = [
    'Rest day — doing some light stretching and foam rolling.',
    'Taking it easy today. A walk and some meal prep.',
    'Recovery day. Body needed this one.',
    'Active rest — just a chill walk and some reading.',
]

// ============================================================
// DAILY CHALLENGES — twin issues a challenge each day
// ============================================================
const DAILY_CHALLENGES = [
    { title: '50 Squats', desc: 'Knock out 50 squats throughout the day — break them into sets if needed.', icon: '🦵', xp: 30 },
    { title: '2-Minute Plank', desc: 'Hold a plank for 2 minutes total. Take breaks, but finish it.', icon: '🧱', xp: 25 },
    { title: '100 Jumping Jacks', desc: 'Get your heart rate up with 100 jumping jacks. Let\'s go!', icon: '⭐', xp: 20 },
    { title: '30 Push-Ups', desc: 'Push-up party! 30 total, any variation. Knee push-ups count.', icon: '💪', xp: 30 },
    { title: '15-Min Walk', desc: 'Take a 15-minute walk. Fresh air, no phone. Just move.', icon: '🚶', xp: 15 },
    { title: '20 Burpees', desc: 'The exercise everyone loves to hate. 20 burpees, let\'s suffer together!', icon: '🔥', xp: 35 },
    { title: '60s Wall Sit', desc: 'Find a wall. Slide down. Hold for 60 seconds. Burn baby burn.', icon: '🧊', xp: 20 },
    { title: '40 Lunges', desc: '20 each leg. Focus on form, go deep, feel the stretch.', icon: '🏃', xp: 25 },
    { title: 'Stretch Session', desc: '10 minutes of full-body stretching. Your body will thank you.', icon: '🧘', xp: 15 },
    { title: '3×10 Dips', desc: 'Tricep dips on a chair or bench. 3 sets of 10. Arms of steel!', icon: '💎', xp: 25 },
    { title: 'Core Blast', desc: '30 crunches, 30 bicycle crunches, 30-second plank. Go!', icon: '🎯', xp: 30 },
    { title: 'Dance Break', desc: 'Put on your favorite song and dance for the full length. No judgment!', icon: '💃', xp: 15 },
    { title: 'Sprint Intervals', desc: '5 rounds: 20 seconds sprint, 40 seconds walk. Short but brutal.', icon: '⚡', xp: 35 },
    { title: 'Yoga Flow', desc: '10 minutes of sun salutations. Start and end your day right.', icon: '🌅', xp: 20 },
]

// ============================================================
// MOTIVATIONAL QUOTES — archetype-specific
// ============================================================
const MOTIVATION_QUOTES = {
    'Diesel Engine': [
        { quote: 'Consistency beats intensity. You don\'t need to be perfect — you need to be relentless.', author: 'Unknown' },
        { quote: 'The body achieves what the mind believes. Keep grinding.', author: 'Napoleon Hill' },
        { quote: 'You didn\'t come this far to only come this far.', author: 'Unknown' },
        { quote: 'Small daily improvements over time lead to stunning results.', author: 'Robin Sharma' },
        { quote: 'Success isn\'t always about greatness. It\'s about consistency.', author: 'Dwayne Johnson' },
    ],
    'Spark': [
        { quote: 'Energy and persistence conquer all things.', author: 'Benjamin Franklin' },
        { quote: 'Be the energy you want to attract. Today, be fire.', author: 'Unknown' },
        { quote: 'You are one workout away from a good mood.', author: 'Unknown' },
        { quote: 'Don\'t count the days. Make the days count.', author: 'Muhammad Ali' },
        { quote: 'Action is the foundational key to all success.', author: 'Pablo Picasso' },
    ],
    'Phoenix': [
        { quote: 'The comeback is always stronger than the setback.', author: 'Unknown' },
        { quote: 'Fall seven times, stand up eight.', author: 'Japanese Proverb' },
        { quote: 'She who overcomes others is strong. She who overcomes herself is mighty.', author: 'Lao Tzu' },
        { quote: 'Your current situation is not your final destination.', author: 'Unknown' },
        { quote: 'Strength doesn\'t come from what you can do. It comes from overcoming what you thought you couldn\'t.', author: 'Rikki Rogers' },
    ],
    'Architect': [
        { quote: 'A goal without a plan is just a wish.', author: 'Antoine de Saint-Exupéry' },
        { quote: 'The difference between try and triumph is just a little umph!', author: 'Marvin Phillips' },
        { quote: 'Plan your work and work your plan. Structure creates freedom.', author: 'Unknown' },
        { quote: 'What gets measured gets managed.', author: 'Peter Drucker' },
        { quote: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln' },
    ],
    'Wildcard': [
        { quote: 'Life begins at the end of your comfort zone.', author: 'Neale Donald Walsch' },
        { quote: 'If it doesn\'t challenge you, it doesn\'t change you.', author: 'Fred DeVito' },
        { quote: 'Variety is the spice of life — and of kick-ass workouts.', author: 'Unknown' },
        { quote: 'The only bad workout is the one that didn\'t happen.', author: 'Unknown' },
        { quote: 'Surprise yourself today. Do something you\'ve never done.', author: 'Unknown' },
    ],
    'Monk': [
        { quote: 'The mind is everything. What you think, you become.', author: 'Buddha' },
        { quote: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
        { quote: 'Peace comes from within. Do not seek it without.', author: 'Buddha' },
        { quote: 'Breathe. You\'re doing better than you think.', author: 'Unknown' },
        { quote: 'The journey of a thousand miles begins with a single step.', author: 'Lao Tzu' },
    ],
}

// ============================================================
// ACCOUNTABILITY NUDGES — shown when twin worked out but you haven't
// ============================================================
const ACCOUNTABILITY_NUDGES = [
    { emoji: '👀', message: '{name} already crushed their workout today. Your turn?' },
    { emoji: '🔔', message: '{name} just finished a session. Don\'t let them get ahead!' },
    { emoji: '💬', message: '{name} says: "I\'m done! Where are you? 😤"' },
    { emoji: '🏋️', message: '{name} logged their workout. Time to match their energy!' },
    { emoji: '⏰', message: '{name} didn\'t skip today. Will you?' },
    { emoji: '🤨', message: '{name} is watching... they finished theirs. Just saying.' },
]

// ============================================================
// MILESTONES
// ============================================================
const MILESTONES = [
    { id: 'first_together', threshold: 1, title: 'First Day Together', message: 'Day one with your twin! This is the start of something awesome.', icon: '🌱' },
    { id: 'three_streak', threshold: 3, title: '3-Day Streak!', message: 'Three days in a row! {name} is cheering you on from {city}.', icon: '🔥' },
    { id: 'seven_streak', threshold: 7, title: 'Week Warrior', message: 'A FULL WEEK! {name} says: "We\'re officially unstoppable."', icon: '⚡' },
    { id: 'ten_workouts', threshold: 10, title: 'Double Digits', message: '10 workouts logged! {name} is doing a victory dance in {city}.', icon: '🎉' },
    { id: 'fourteen_streak', threshold: 14, title: 'Two Week Terror', message: '14 days straight! {name} can\'t believe it either.', icon: '💎' },
    { id: 'twenty_five', threshold: 25, title: 'Quarter Century', message: '25 workouts! {name}: "We built this together. I\'m so proud."', icon: '👑' },
    { id: 'thirty_streak', threshold: 30, title: 'Monthly Beast', message: '30-DAY STREAK! {name} is telling everyone in {city} about you.', icon: '🏆' },
    { id: 'fifty_workouts', threshold: 50, title: 'Fifty & Fit', message: '50 workouts! {name}: "From strangers to legends. What a ride."', icon: '⭐' },
]

// ============================================================
// Hash utility
// ============================================================
function hashString(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
    }
    return Math.abs(hash)
}

function getWeekNumber() {
    const d = new Date()
    const start = new Date(d.getFullYear(), 0, 1)
    return Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7)
}

// ============================================================
// CORE FUNCTIONS
// ============================================================

/**
 * Generate a deterministic twin from Google user data
 */
export function generateTwin(googleUser) {
    const hash = hashString(googleUser.email || googleUser.sub || 'default')

    return {
        name: TWIN_NAMES[hash % TWIN_NAMES.length],
        age: 20 + (hash % 20),
        city: TWIN_CITIES[hash % TWIN_CITIES.length],
        archetype: ARCHETYPES[hash % ARCHETYPES.length],
        goal: GOALS[hash % GOALS.length],
        backstory: BACKSTORIES[hash % BACKSTORIES.length],
        weakDay: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][hash % 7],
        streak: 1 + (hash % 14),
        matchPercent: 78 + (hash % 18),
        createdAt: new Date().toISOString(),
    }
}

/**
 * Simulate twin's daily workout (deterministic by date)
 */
export function simulateTwinDay(twin) {
    const today = new Date()
    const dayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
    const hash = hashString(twin.name + dayKey)
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' })

    const isWeakDay = dayName === twin.weakDay
    const didWorkout = isWeakDay ? (hash % 10 > 5) : (hash % 10 > 2)

    const summaries = didWorkout ? DAILY_SUMMARIES_ACTIVE : DAILY_SUMMARIES_REST
    const summary = summaries[hash % summaries.length]

    return { didWorkout, summary }
}

/**
 * Get twin's 7-day activity log
 */
export function getTwinWeekLog(twin) {
    const log = []
    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
        const hash = hashString(twin.name + dayKey)
        const dayName = d.toLocaleDateString('en-US', { weekday: 'long' })
        const isWeakDay = dayName === twin.weakDay
        const didWorkout = isWeakDay ? (hash % 10 > 5) : (hash % 10 > 2)

        log.push({
            date: d,
            dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }),
            didWorkout,
        })
    }
    return log
}

/**
 * Get today's daily challenge from twin
 */
export function getDailyChallenge(twin) {
    const today = new Date()
    const dayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
    const hash = hashString(twin.name + 'challenge' + dayKey)
    return DAILY_CHALLENGES[hash % DAILY_CHALLENGES.length]
}

/**
 * Get motivational quote for twin's archetype
 */
export function getDailyQuote(twin) {
    const today = new Date()
    const dayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
    const hash = hashString(twin.name + 'quote' + dayKey)
    const quotes = MOTIVATION_QUOTES[twin.archetype] || MOTIVATION_QUOTES['Spark']
    return quotes[hash % quotes.length]
}

/**
 * Get accountability nudge (shown when twin worked out but user hasn't)
 */
export function getAccountabilityNudge(twin) {
    const hash = hashString(twin.name + new Date().toDateString())
    const nudge = ACCOUNTABILITY_NUDGES[hash % ACCOUNTABILITY_NUDGES.length]
    return {
        emoji: nudge.emoji,
        message: nudge.message.replace('{name}', twin.name),
    }
}

/**
 * Check for milestone celebrations
 */
export function checkMilestones(twin, userStats) {
    const celebrated = JSON.parse(localStorage.getItem('twinMilestones') || '[]')
    const uncelebrated = MILESTONES.filter(m => {
        const value = m.id.includes('streak') ? userStats.streak : userStats.workouts
        return value >= m.threshold && !celebrated.includes(m.id)
    })
    return uncelebrated.map(m => ({
        ...m,
        message: m.message.replace('{name}', twin.name).replace('{city}', twin.city),
    }))
}

/**
 * Mark a milestone as celebrated
 */
export function celebrateMilestone(milestoneId) {
    const celebrated = JSON.parse(localStorage.getItem('twinMilestones') || '[]')
    if (!celebrated.includes(milestoneId)) {
        celebrated.push(milestoneId)
        localStorage.setItem('twinMilestones', JSON.stringify(celebrated))
    }
}

/**
 * Get twin reaction to user's reaction (deterministic)
 */
export function generateTwinReaction(twin, userReaction) {
    const responses = REACTION_RESPONSES[userReaction]
    if (!responses) {
        return { emoji: '💪', message: `${twin.name} is proud of you!` }
    }
    const hash = hashString(twin.name + userReaction + new Date().toDateString())
    return responses[hash % responses.length]
}

/**
 * Generate weekly sync message
 */
export function generateWeeklySync(twin, userStats) {
    const hash = hashString(twin.name + getWeekNumber().toString())
    const template = WEEKLY_SYNC_TEMPLATES[hash % WEEKLY_SYNC_TEMPLATES.length]
    const twinWorkouts = 2 + (hash % 4)

    let comparison = ''
    const userWorkouts = userStats.workoutsThisWeek || 0
    if (userWorkouts > twinWorkouts) {
        comparison = 'You outpaced me this week — impressive!'
    } else if (userWorkouts === twinWorkouts) {
        comparison = 'We matched perfectly this week!'
    } else {
        comparison = 'I got a couple extra in — but you\'re right there with me!'
    }

    return template
        .replace('{userWorkouts}', userWorkouts)
        .replace('{twinWorkouts}', twinWorkouts)
        .replace('{comparison}', comparison)
}
