import { openDB } from 'idb'

const DB_NAME = 'vibeoverflow'
const DB_VERSION = 1

const STORES = {
    USER_PROFILE: 'userProfile',
    WORKOUT_LOGS: 'workoutLogs',
    PLANS: 'plans',
    NUTRITION: 'nutrition',
    STREAKS: 'streaks',
    SETTINGS: 'settings',
}

let dbPromise = null

function getDB() {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                // User profile — single record
                if (!db.objectStoreNames.contains(STORES.USER_PROFILE)) {
                    db.createObjectStore(STORES.USER_PROFILE)
                }
                // Workout logs — keyed by date
                if (!db.objectStoreNames.contains(STORES.WORKOUT_LOGS)) {
                    const store = db.createObjectStore(STORES.WORKOUT_LOGS, { keyPath: 'id', autoIncrement: true })
                    store.createIndex('date', 'date')
                }
                // Plans
                if (!db.objectStoreNames.contains(STORES.PLANS)) {
                    db.createObjectStore(STORES.PLANS, { keyPath: 'id', autoIncrement: true })
                }
                // Nutrition
                if (!db.objectStoreNames.contains(STORES.NUTRITION)) {
                    db.createObjectStore(STORES.NUTRITION, { keyPath: 'id', autoIncrement: true })
                }
                // Streaks
                if (!db.objectStoreNames.contains(STORES.STREAKS)) {
                    db.createObjectStore(STORES.STREAKS)
                }
                // Settings (API key, preferences)
                if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
                    db.createObjectStore(STORES.SETTINGS)
                }
            },
        })
    }
    return dbPromise
}

// === User Profile ===
export async function saveUserProfile(profile) {
    const db = await getDB()
    await db.put(STORES.USER_PROFILE, profile, 'profile')
}

export async function getUserProfile() {
    const db = await getDB()
    return db.get(STORES.USER_PROFILE, 'profile')
}

// === Settings ===
export async function saveSetting(key, value) {
    const db = await getDB()
    await db.put(STORES.SETTINGS, value, key)
}

export async function getSetting(key) {
    const db = await getDB()
    return db.get(STORES.SETTINGS, key)
}

// === Workout Logs ===
export async function logWorkout(entry) {
    const db = await getDB()
    return db.add(STORES.WORKOUT_LOGS, { ...entry, date: new Date().toISOString() })
}

export async function getWorkoutLogs() {
    const db = await getDB()
    return db.getAll(STORES.WORKOUT_LOGS)
}

// === Plans ===
export async function savePlan(plan) {
    const db = await getDB()
    return db.put(STORES.PLANS, plan)
}

export async function getPlans() {
    const db = await getDB()
    return db.getAll(STORES.PLANS)
}

// === Streaks ===
export async function saveStreakData(data) {
    const db = await getDB()
    await db.put(STORES.STREAKS, data, 'current')
}

export async function getStreakData() {
    const db = await getDB()
    return db.get(STORES.STREAKS, 'current')
}

export { STORES }
export default getDB
