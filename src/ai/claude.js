/**
 * Claude API client for Training Twin feature.
 * Uses browser fetch — API key stored in localStorage.
 */

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const CLAUDE_MODEL = 'claude-sonnet-4-20250514'

function getApiKey() {
    return localStorage.getItem('claude_api_key') || ''
}

export function setApiKey(key) {
    localStorage.setItem('claude_api_key', key)
}

export function hasApiKey() {
    return !!getApiKey()
}

async function callClaude(systemPrompt, userPrompt, maxTokens = 1024) {
    const apiKey = getApiKey()
    if (!apiKey) throw new Error('Claude API key not set')

    const res = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
            model: CLAUDE_MODEL,
            max_tokens: maxTokens,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
        }),
    })

    if (!res.ok) {
        const err = await res.text()
        throw new Error(`Claude API error: ${res.status} ${err}`)
    }

    const data = await res.json()
    return data.content[0].text
}

/**
 * Generate a training twin from user profile
 */
export async function generateTwin(profile) {
    const system = `You generate realistic AI training twins for a fitness app. Return ONLY valid JSON, no markdown.`
    const prompt = `Create a training twin for this user:
- Goal: ${profile.goal || profile.path}
- Fitness level: ${profile.fitnessLevel}
- Archetype: ${profile.archetype?.name || 'unknown'}
- Cuisine: ${profile.cuisine || 'mixed'}
- Weak zones: ${(profile.weakZones || []).join(', ') || 'none'}
- Quit reasons: ${(profile.quitReasons || []).join(', ') || 'none'}

Return JSON: {"name": "first name", "age": number, "city": "city, country", "archetype": "one of: Diesel Engine, Spark, Phoenix, Architect, Wildcard, Monk", "goal": "their goal", "backstory": "2 sentences max", "weakDay": "day of week", "streak": number (1-14)}`

    const text = await callClaude(system, prompt, 300)
    return JSON.parse(text)
}

/**
 * Simulate twin's daily workout
 */
export async function simulateTwinDay(twin) {
    const cacheKey = `twin_day_${new Date().toISOString().split('T')[0]}`
    const cached = localStorage.getItem(cacheKey)
    if (cached) return JSON.parse(cached)

    const system = `You simulate whether a training twin worked out today. Return ONLY valid JSON.`
    const prompt = `Twin profile: ${twin.name}, ${twin.age}, ${twin.archetype} archetype, weak day is ${twin.weakDay}, streak: ${twin.streak}. Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}.
Return JSON: {"didWorkout": true or false, "summary": "one sentence about their session"}`

    const text = await callClaude(system, prompt, 150)
    const result = JSON.parse(text)
    localStorage.setItem(cacheKey, JSON.stringify(result))
    return result
}

/**
 * Generate twin reaction
 */
export async function generateTwinReaction(twin, userReaction) {
    const cacheKey = `twin_reaction_${new Date().toISOString().split('T')[0]}`
    const cached = localStorage.getItem(cacheKey)
    if (cached) return JSON.parse(cached)

    const system = `You generate a reaction from a training twin. Return ONLY valid JSON.`
    const prompt = `Twin: ${twin.name} (${twin.archetype}). User sent reaction: "${userReaction}".
Return JSON: {"emoji": "single emoji", "message": "one warm sentence back"}`

    const text = await callClaude(system, prompt, 100)
    const result = JSON.parse(text)
    localStorage.setItem(cacheKey, JSON.stringify(result))
    return result
}

/**
 * Generate weekly sync message
 */
export async function generateWeeklySync(twin, userStats) {
    const cacheKey = `twin_sync_week_${getWeekNumber()}`
    const cached = localStorage.getItem(cacheKey)
    if (cached) return cached

    const system = `You write warm weekly sync messages for a fitness twin pair. Return only the message text, no JSON.`
    const prompt = `User: ${userStats.workouts || 0} workouts this week, streak: ${userStats.streak || 0}.
Twin ${twin.name} (${twin.archetype}): simulated ${Math.floor(Math.random() * 4) + 2} workouts, streak: ${twin.streak || 0}.
Write one warm sentence acknowledging something they shared this week.`

    const text = await callClaude(system, prompt, 100)
    localStorage.setItem(cacheKey, text)
    return text
}

function getWeekNumber() {
    const d = new Date()
    const start = new Date(d.getFullYear(), 0, 1)
    return Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7)
}
