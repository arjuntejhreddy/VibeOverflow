/**
 * Coaching Personas — prompt templates and voice settings for the 4 coaching personalities.
 * Used by both the Web Speech API and optional LLM integration.
 */

const PERSONAS = {
    drill: {
        id: 'drill',
        name: 'The Drill Sergeant',
        emoji: '🪖',
        voice: { rate: 1.1, pitch: 0.8, volume: 1.0 },
        cues: {
            start: [
                "Time to work. No excuses. Let's go.",
                "On your feet, soldier. We've got work to do.",
                "The only easy day was yesterday. Move it!",
            ],
            rep: [
                "Keep going! Don't you dare stop!",
                "One more. You've got more in the tank.",
                "Push through! Pain is weakness leaving the body.",
                "That's it. Now give me another one.",
                "Dig deeper! Show me what you've got!",
            ],
            rest: [
                "30 seconds rest. Hydrate. Then we go again.",
                "Take a breath. But don't get comfortable.",
                "Rest now. Next set needs to be better.",
            ],
            encouragement: [
                "Not bad, but I know you can do better.",
                "Acceptable. Now exceed it.",
                "That looked too easy. We're adding more next time.",
            ],
            complete: [
                "Mission complete. You showed up and delivered. Respect.",
                "Another session in the books. Consistent effort builds warriors.",
                "Dismissed. Go recover. You earned it.",
            ],
            rageQuit: "We've dialed things back. Even the toughest need recovery. Come back when you're ready, soldier.",
        },
    },
    friend: {
        id: 'friend',
        name: 'The Best Friend',
        emoji: '👯',
        voice: { rate: 1.0, pitch: 1.1, volume: 0.9 },
        cues: {
            start: [
                "Hey! So glad you're here! Let's have some fun!",
                "You showed up and that's literally amazing. Let's gooo!",
                "Workout time! We're gonna crush this together!",
            ],
            rep: [
                "You're doing amazing! Keep it up!",
                "Look at youuu! One more, you got this!",
                "Yesss! That looked SO good!",
                "Almost there, bestie! You're crushing it!",
                "I'm so proud of you right now!",
            ],
            rest: [
                "Great job! Take a breather, you deserve it!",
                "Rest up! Grab some water, we'll go again when you're ready!",
                "Okay quick break! You're honestly doing so well!",
            ],
            encouragement: [
                "Listen, you're doing better than 90% of people right now!",
                "Every rep counts, even the ugly ones. You're showing up!",
                "Remember how far you've already come. You're amazing!",
            ],
            complete: [
                "YOU DID IT! I'm literally so happy right now! Great workout!",
                "That was awesome! You should be so proud of yourself!",
                "Another one done! You're building something incredible, one day at a time!",
            ],
            rageQuit: "Hey, we turned things down a notch — and that's totally okay. Rest is part of the process. See you when you're feeling it! 💛",
        },
    },
    zen: {
        id: 'zen',
        name: 'The Zen Master',
        emoji: '🧘',
        voice: { rate: 0.85, pitch: 0.9, volume: 0.8 },
        cues: {
            start: [
                "Find your center. Breathe. We begin.",
                "Close your eyes for a moment. Set your intention. Now, let's move.",
                "Be present. Be patient. Let the body do what it knows.",
            ],
            rep: [
                "Breathe through it. You are stronger than you think.",
                "One more. Slowly. Feel every muscle.",
                "Inhale strength. Exhale doubt.",
                "Stay present. This rep is all that matters.",
                "Mind and body, moving as one.",
            ],
            rest: [
                "Come to stillness. Observe your breath.",
                "Rest is not weakness. It is wisdom.",
                "Take this moment. Feel your heartbeat slow.",
            ],
            encouragement: [
                "Progress is not always visible, but it is always happening.",
                "The river does not rush, yet it carves mountains.",
                "Trust the process. Trust your body.",
            ],
            complete: [
                "You honored your body today. Carry this peace with you.",
                "The session ends, but the benefits continue. Well done.",
                "Namaste. You showed discipline and presence today.",
            ],
            rageQuit: "We've dialed things back. Listen to your body — it has its own wisdom. Return when the time is right.",
        },
    },
    hype: {
        id: 'hype',
        name: 'The Hype Coach',
        emoji: '🔥',
        voice: { rate: 1.2, pitch: 1.2, volume: 1.0 },
        cues: {
            start: [
                "LET'S GOOO! It's GO time! Are you READY?!",
                "GAME TIME, baby! Let's get this DONE!",
                "You are about to be LEGENDARY! Let's GO!",
            ],
            rep: [
                "YES! YES! YES! Keep that energy UP!",
                "EASY MONEY! One more! You're a MACHINE!",
                "LET'S GOOO! THAT WAS CLEAN!",
                "BEAST MODE ACTIVATED! Another one!",
                "FIRE! You're on FIRE right now!",
            ],
            rest: [
                "Quick breather! But stay LOCKED IN!",
                "Rest for 30! Then we come back HARDER!",
                "Shake it out! Next set is gonna be FIRE!",
            ],
            encouragement: [
                "Do you HEAR yourself breathing?! That's the sound of PROGRESS!",
                "You're doing things most people won't! Respect the GRIND!",
                "Every single rep is taking you CLOSER! Don't stop NOW!",
            ],
            complete: [
                "THAT'S A WRAP! You absolutely CRUSHED it! 🔥🔥🔥",
                "WORKOUT COMPLETE! You just leveled UP! Give yourself a pat on the back!",
                "LEGENDARY session! You showed UP and showed OUT! See you next time, champ!",
            ],
            rageQuit: "We dialed it back. Even legends need recovery days. Come back when you're ready — and we'll go EVEN HARDER! 🔥",
        },
    },
}

/**
 * Get a random coaching cue for a given persona and cue type
 */
export function getCoachCue(personaId, cueType) {
    const persona = PERSONAS[personaId]
    if (!persona) return ''
    const cues = persona.cues[cueType]
    if (!cues) return ''
    if (Array.isArray(cues)) {
        return cues[Math.floor(Math.random() * cues.length)]
    }
    return cues
}

/**
 * Get voice settings for Web Speech API
 */
export function getVoiceSettings(personaId) {
    const persona = PERSONAS[personaId]
    return persona ? persona.voice : { rate: 1.0, pitch: 1.0, volume: 1.0 }
}

/**
 * Speak a message using Web Speech API with persona voice settings
 */
export function speakWithPersona(text, personaId) {
    if (!text || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const settings = getVoiceSettings(personaId)
    utterance.rate = settings.rate
    utterance.pitch = settings.pitch
    utterance.volume = settings.volume
    window.speechSynthesis.speak(utterance)
}

export { PERSONAS }
export default PERSONAS
