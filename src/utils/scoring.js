/**
 * Wellness scoring & dropout pattern analysis
 */

/**
 * Calculate weekly wellness score (0-100) from logged data
 */
export function calculateWellnessScore(logs = []) {
    if (logs.length === 0) return null

    // Get last 7 days of logs
    const now = new Date()
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
    const recentLogs = logs.filter((l) => new Date(l.date) >= weekAgo)

    if (recentLogs.length === 0) return null

    // Consistency score (how many days had workouts)
    const uniqueDays = new Set(recentLogs.map((l) => l.date?.split('T')[0])).size
    const consistencyScore = Math.min((uniqueDays / 5) * 100, 100) // 5+ days = 100

    // Average mood after workout
    const avgMood = recentLogs.reduce((s, l) => s + (l.debrief?.mood || 3), 0) / recentLogs.length
    const moodScore = (avgMood / 5) * 100

    // Average energy
    const avgEnergy = recentLogs.reduce((s, l) => s + (l.debrief?.energy || 3), 0) / recentLogs.length
    const energyScore = (avgEnergy / 5) * 100

    // Completion rate (workouts not stopped early)
    const completed = recentLogs.filter((l) => l.midState !== 'stop').length
    const completionScore = (completed / recentLogs.length) * 100

    // Weighted average
    const score = Math.round(
        consistencyScore * 0.3 +
        moodScore * 0.25 +
        energyScore * 0.25 +
        completionScore * 0.2
    )

    return Math.min(100, Math.max(0, score))
}

/**
 * Analyze dropout patterns from workout logs
 */
export function analyzeDropoutPatterns(logs = []) {
    const patterns = {
        dayOfWeek: {},
        timeOfDay: {},
        quittingDays: [],
        averageMoodOnQuit: 0,
        insight: '',
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    // Count workouts and drops by day of week
    const dayStats = {}
    dayNames.forEach((d) => { dayStats[d] = { total: 0, stopped: 0 } })

    logs.forEach((log) => {
        const date = new Date(log.date)
        const day = dayNames[date.getDay()]
        dayStats[day].total++
        if (log.midState === 'stop') {
            dayStats[day].stopped++
        }
    })

    patterns.dayOfWeek = dayStats

    // Find worst day
    let worstDay = null
    let worstRate = 0
    for (const [day, stats] of Object.entries(dayStats)) {
        if (stats.total >= 2) {
            const rate = stats.stopped / stats.total
            if (rate > worstRate) {
                worstRate = rate
                worstDay = day
            }
        }
    }

    // Generate insight
    if (worstDay && worstRate > 0.3) {
        patterns.insight = `You tend to struggle on ${worstDay}s — ${Math.round(worstRate * 100)}% of your ${worstDay} workouts end early. Maybe schedule a lighter session or rest day then?`
    } else if (logs.length > 5) {
        const avgCompletion = logs.filter((l) => l.midState !== 'stop').length / logs.length
        if (avgCompletion > 0.8) {
            patterns.insight = `You're crushing it — ${Math.round(avgCompletion * 100)}% workout completion rate! 🔥`
        } else {
            patterns.insight = `Your completion rate is ${Math.round(avgCompletion * 100)}%. Try the "I only have 10 minutes" mode on tough days — short workouts still count!`
        }
    }

    return patterns
}

/**
 * Calculate streak from logs
 */
export function calculateStreak(logs = []) {
    if (logs.length === 0) return { current: 0, longest: 0, milestones: [] }

    // Get unique workout dates sorted descending
    const dates = [...new Set(logs.map((l) => l.date?.split('T')[0]))]
        .sort((a, b) => new Date(b) - new Date(a))

    let current = 0
    let today = new Date().toISOString().split('T')[0]
    let checkDate = today

    for (const date of dates) {
        if (date === checkDate || date === getPreviousDay(checkDate)) {
            current++
            checkDate = date
        } else if (current === 0 && date === getPreviousDay(today)) {
            current = 1
            checkDate = date
        } else {
            break
        }
    }

    // Check if today is counted
    if (dates.includes(today)) {
        current = Math.max(current, 1)
    }

    // Calculate longest
    let longest = 0
    let tempStreak = 1
    const sortedAsc = [...dates].sort((a, b) => new Date(a) - new Date(b))
    for (let i = 1; i < sortedAsc.length; i++) {
        const diff = (new Date(sortedAsc[i]) - new Date(sortedAsc[i - 1])) / (1000 * 60 * 60 * 24)
        if (diff <= 1) {
            tempStreak++
        } else {
            longest = Math.max(longest, tempStreak)
            tempStreak = 1
        }
    }
    longest = Math.max(longest, tempStreak, current)

    // Milestones
    const MILESTONES = [5, 10, 21, 30, 60, 100]
    const milestones = MILESTONES.map((m) => ({
        days: m,
        reached: longest >= m,
        label: getMilestoneLabel(m),
    }))

    return { current, longest, milestones }
}

function getPreviousDay(dateStr) {
    const d = new Date(dateStr)
    d.setDate(d.getDate() - 1)
    return d.toISOString().split('T')[0]
}

function getMilestoneLabel(days) {
    switch (days) {
        case 5: return '🌟 First Week Fighter'
        case 10: return '💎 Double Digits'
        case 21: return '🧠 Habit Formed'
        case 30: return '🏆 Monthly Master'
        case 60: return '⚡ Two-Month Titan'
        case 100: return '👑 Century Legend'
        default: return `${days} Day Streak`
    }
}
