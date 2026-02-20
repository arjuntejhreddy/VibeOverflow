import React, { useRef, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { speakWithPersona } from '../../ai/personas'
import { useUser } from '../../context/UserContext'
import { POSTURE_IMAGES } from '../../utils/images'
import './Posture.css'

// ============================================================
// VOICE LINES — huge variety, no repeats feel
// ============================================================
const VOICE = {
    squat: {
        corrections: {
            depth: [
                'Go deeper. You can do it.', 'Lower! Push your hips back.', 'More depth. Break parallel.',
                'Squat deeper. Don\'t cheat yourself.', 'Get below parallel. You got this.',
                'Drop it low. Your knees can handle it.', 'Deeper! Imagine sitting in a low chair.',
                'Not deep enough. Push through your heels and sink.',
            ],
            back: [
                'Straighten your back. Chest up!', 'You\'re rounding. Keep your spine neutral.',
                'Back is caving. Tighten your core.', 'Chest proud! Don\'t hunch forward.',
                'Spine neutral. Look slightly up.', 'Your back is leaning too far. Brace harder.',
            ],
        },
        appreciation: [
            'Beautiful squat! Right there!', 'That\'s it! Perfect depth!', 'YES! That rep was clean!',
            'Nailed it! Keep that form!', 'Textbook squat! One more just like that!',
            'Great depth and great back. Keep going!', 'You\'re in the zone. Don\'t stop!',
            'That\'s what a proper squat looks like!', 'Perfect! Your form is on point!',
            'Incredible! Maintain that depth!',
        ],
        tips: [
            'Push your knees out over your toes.', 'Keep weight on your heels.',
            'Brace your core before you descend.', 'Inhale on the way down.',
            'Drive through your heels on the way up.', 'Squeeze glutes at the top.',
            'Keep your chest up and proud.', 'Think about sitting back, not down.',
            'Spread the floor with your feet.', 'Control the speed. Own every inch.',
        ],
    },
    pushup: {
        corrections: {
            elbows: [
                'Lower yourself more. Get your chest to the floor.', 'Bend those elbows! Go deeper.',
                'You\'re barely bending. Full range of motion.', 'Chest needs to touch the ground.',
                'More depth on the push-up. Don\'t half-rep.', 'Lower! Your elbows should hit 90 degrees.',
            ],
            alignment: [
                'Your hips are sagging. Tighten your core!', 'Straighten your body. No banana backs.',
                'Core engaged! Your body should be a plank.', 'Hips are dropping. Squeeze your glutes.',
                'You\'re piking up. Lower your hips.', 'Body straight! Think of a steel rod.',
            ],
        },
        appreciation: [
            'Clean push-up! Beautiful form!', 'That\'s the one! Perfect alignment!',
            'Great range of motion!', 'YES! Chest to the floor and back up!',
            'Body is straight, depth is right. Nailed it!', 'That was picture-perfect!',
            'Your push-ups are looking sharp!', 'Solid rep! Keep that body tight!',
            'Full range, great form. You\'re killing it!', 'Military-grade push-up right there!',
        ],
        tips: [
            'Keep elbows at 45 degrees, not flared.', 'Screw your hands into the floor.',
            'Breathe out as you push up.', 'Look slightly forward, not down.',
            'Squeeze your glutes throughout.', 'Control the descent. Slow and steady.',
            'Hands under your shoulders.', 'Imagine pushing the floor away.',
        ],
    },
    plank: {
        corrections: {
            hips: [
                'Hips are sagging! Lift them up!', 'Engage your core. Stop the sag.',
                'Your midsection is dropping. Tighten up!', 'Squeeze everything. Don\'t let those hips fall.',
                'Hips too high. Level your body.', 'Find the sweet spot. Not too high, not too low.',
            ],
            shoulders: [
                'Stack shoulders over wrists.', 'Shoulders are too far forward. Pull back.',
                'Your shoulders need to be directly above your hands.', 'Shoulder position is off. Adjust now.',
            ],
        },
        appreciation: [
            'Perfect plank! Hold it!', 'Your body is a straight line. Beautiful!',
            'Incredible hold! Stay right there!', 'Core is engaged, body is straight. YES!',
            'You\'re a plank machine!', 'That alignment is chef\'s kiss!',
            'Rock solid! Don\'t move a muscle!', 'This is exactly what a plank should look like!',
        ],
        tips: [
            'Breathe steadily. Don\'t hold your breath.', 'Pull your belly button to your spine.',
            'Squeeze your quads. Lock your legs.', 'Relax your face. Save energy for your core.',
            'Push the floor away with your forearms.', 'Keep your neck neutral. Look at the floor.',
            'Imagine your body is a bridge of steel.', 'Engage every muscle from head to heels.',
        ],
    },
    deadlift: {
        corrections: {
            back: [
                'Your back is rounding! Straighten it!', 'Spine neutral! You\'re curving.',
                'Back is caving in. Reset and brace.', 'Keep your chest up. Don\'t round.',
                'Dangerous form. Flatten your back now.', 'Engage your lats. Protect your spine.',
            ],
            hips: [
                'Hinge more at the hips.', 'You\'re not hinging enough. Push hips back.',
                'This is a hip hinge, not a squat. Push back.', 'More hip hinge. Butt goes back.',
            ],
        },
        appreciation: [
            'Great pull! Perfect back position!', 'That\'s a clean deadlift!',
            'Hip hinge on point! Back is flat!', 'Textbook form! One more!',
            'Strong pull! Your back stayed neutral!', 'Beautiful deadlift! Keep it coming!',
            'That was smooth. Great control!', 'Perfect! Drive through those heels!',
        ],
        tips: [
            'Drive through your heels.', 'Keep the weight close to your body.',
            'Engage your lats. Protect your armpits.', 'Take a big breath before each rep.',
            'Stand tall at the top. Squeeze glutes.', 'Shins should stay nearly vertical.',
            'Think about pushing the floor away.', 'Hinge at the hips, not the lower back.',
        ],
    },
}

// ============================================================
// REP CELEBRATION LINES (said on each rep completion)
// ============================================================
const REP_CELEBRATIONS = [
    'Rep counted!', 'That\'s one!', 'Good rep!', 'Counted!', 'Nice!',
    'There it is!', 'Clean rep!', 'Boom!', 'One more in the bank!',
    'Solid rep!', 'Keep \'em coming!', 'Another one!',
]

const EXERCISES_CONFIG = {
    squat: {
        name: 'Squat',
        image: POSTURE_IMAGES.squat,
        requiredLandmarks: [23, 24, 25, 26, 27, 28, 11, 12],
        minVisibility: 0.6,
        checks: [
            { name: 'Knee Angle', key: 'knees' },
            { name: 'Back Straight', key: 'back' },
            { name: 'Depth', key: 'depth' },
        ],
    },
    pushup: {
        name: 'Push-up',
        image: POSTURE_IMAGES.pushup,
        requiredLandmarks: [11, 12, 13, 14, 15, 16, 23, 24, 27, 28],
        minVisibility: 0.5,
        checks: [
            { name: 'Body Alignment', key: 'alignment' },
            { name: 'Elbow Angle', key: 'elbows' },
            { name: 'Core Engaged', key: 'core' },
        ],
    },
    plank: {
        name: 'Plank',
        image: POSTURE_IMAGES.plank,
        requiredLandmarks: [11, 12, 23, 24, 27, 28],
        minVisibility: 0.5,
        checks: [
            { name: 'Hip Alignment', key: 'hips' },
            { name: 'Shoulder Position', key: 'shoulders' },
            { name: 'Head Neutral', key: 'head' },
        ],
    },
    deadlift: {
        name: 'Deadlift',
        image: POSTURE_IMAGES.deadlift,
        requiredLandmarks: [11, 12, 23, 24, 25, 26, 27, 28],
        minVisibility: 0.6,
        checks: [
            { name: 'Back Straight', key: 'back' },
            { name: 'Hip Hinge', key: 'hips' },
            { name: 'Bar Path', key: 'barpath' },
        ],
    },
}

// Pick a random line without repeating the last one
function pickLine(arr, lastRef) {
    if (arr.length <= 1) return arr[0] || ''
    let idx
    do {
        idx = Math.floor(Math.random() * arr.length)
    } while (idx === lastRef.current && arr.length > 1)
    lastRef.current = idx
    return arr[idx]
}

export default function PostureSession() {
    const navigate = useNavigate()
    const { state } = useUser()
    const persona = state.profile.coachPersona || 'hype'

    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const [cameraActive, setCameraActive] = useState(false)
    const [selectedExercise, setSelectedExercise] = useState(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [formScore, setFormScore] = useState(null)
    const [formFeedback, setFormFeedback] = useState([])
    const [repCount, setRepCount] = useState(0)
    const [sessionScores, setSessionScores] = useState([])
    const [bodyDetected, setBodyDetected] = useState(false)
    const [lastVoiceLine, setLastVoiceLine] = useState('')
    const animFrameRef = useRef(null)
    const poseRef = useRef(null)

    // Voice timing refs
    const lastCorrectionTime = useRef(0)
    const lastAppreciationTime = useRef(0)
    const lastTipTime = useRef(0)
    const lastRepCelebrateTime = useRef(0)
    const speakingRef = useRef(false)

    // Anti-repeat refs
    const lastCorrectionIdx = useRef(-1)
    const lastAppreciationIdx = useRef(-1)
    const lastTipIdx = useRef(-1)
    const lastRepIdx = useRef(-1)

    // Rep state machine
    const repPhaseRef = useRef('up') // 'up' | 'down'
    const repPhaseCountRef = useRef(0) // frames in current phase

    // Consecutive good form counter
    const goodFormStreak = useRef(0)

    // Smart speak — checks if speech synthesis is currently talking
    function smartSpeak(text) {
        if (!text || !('speechSynthesis' in window)) return
        // Don't interrupt active speech
        if (window.speechSynthesis.speaking) return
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        const settings = getVoiceSettings(persona)
        utterance.rate = settings.rate
        utterance.pitch = settings.pitch
        utterance.volume = settings.volume
        utterance.onstart = () => { speakingRef.current = true }
        utterance.onend = () => { speakingRef.current = false }
        window.speechSynthesis.speak(utterance)
        setLastVoiceLine(text)
    }

    function getVoiceSettings(p) {
        const map = {
            drill: { rate: 1.1, pitch: 0.8, volume: 1.0 },
            friend: { rate: 1.0, pitch: 1.1, volume: 0.9 },
            zen: { rate: 0.85, pitch: 0.9, volume: 0.8 },
            hype: { rate: 1.15, pitch: 1.15, volume: 1.0 },
        }
        return map[p] || map.hype
    }

    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 640, height: 480 },
            })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                setCameraActive(true)
            }
        } catch (err) {
            console.error('Camera access denied:', err)
            alert('Camera access is required for posture correction.')
        }
    }

    function stopCamera() {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach((t) => t.stop())
        }
        setCameraActive(false)
        cancelAnimationFrame(animFrameRef.current)
        if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    }

    useEffect(() => {
        if (!cameraActive || !selectedExercise) return
        let poseInstance = null

        async function loadMediaPipe() {
            if (!window.Pose) {
                await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js')
                await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js')
                await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js')
            }
            if (window.Pose) {
                poseInstance = new window.Pose({
                    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
                })
                poseInstance.setOptions({
                    modelComplexity: 1,
                    smoothLandmarks: true,
                    enableSegmentation: false,
                    minDetectionConfidence: 0.6,
                    minTrackingConfidence: 0.6,
                })
                poseInstance.onResults((results) => {
                    drawResults(results, selectedExercise)
                    if (selectedExercise) analyzeForm(results, selectedExercise)
                })
                poseRef.current = poseInstance
                setIsAnalyzing(true)
                if (window.Camera && videoRef.current) {
                    const camera = new window.Camera(videoRef.current, {
                        onFrame: async () => {
                            if (poseRef.current && videoRef.current) {
                                await poseRef.current.send({ image: videoRef.current })
                            }
                        },
                        width: 640,
                        height: 480,
                    })
                    camera.start()
                }
            }
        }
        loadMediaPipe().catch(console.error)
        return () => {
            cancelAnimationFrame(animFrameRef.current)
            if (poseInstance) poseInstance.close?.()
        }
    }, [cameraActive, selectedExercise])

    function checkBodyVisibility(landmarks, exercise) {
        const config = EXERCISES_CONFIG[exercise]
        if (!config || !landmarks) return false
        let vis = 0
        for (const idx of config.requiredLandmarks) {
            if (landmarks[idx] && landmarks[idx].visibility > config.minVisibility) vis++
        }
        return vis >= Math.ceil(config.requiredLandmarks.length * 0.7)
    }

    function getAngle(a, b, c) {
        const rad = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
        let angle = Math.abs((rad * 180) / Math.PI)
        if (angle > 180) angle = 360 - angle
        return Math.round(angle)
    }

    // Smooth score using left+right limb average
    function getAvgAngle(lm, joints) {
        // joints: [[a,b,c], [a2,b2,c2]]  left and right
        const angles = joints.map(([a, b, c]) => getAngle(lm[a], lm[b], lm[c]))
        return Math.round(angles.reduce((s, v) => s + v, 0) / angles.length)
    }

    function drawResults(results, exercise) {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        canvas.width = 640
        canvas.height = 480
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        if (results.poseLandmarks) {
            drawGhostOverlay(ctx, exercise)
            if (window.drawConnectors) {
                window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, { color: '#00E676', lineWidth: 3 })
            }
            if (window.drawLandmarks) {
                window.drawLandmarks(ctx, results.poseLandmarks, { color: '#0066FF', lineWidth: 2, radius: 5 })
            }
            if (exercise && checkBodyVisibility(results.poseLandmarks, exercise)) {
                drawAngleAnnotations(ctx, results.poseLandmarks, exercise)
            }
        }
    }

    function drawGhostOverlay(ctx, exercise) {
        ctx.save()
        ctx.globalAlpha = 0.15
        ctx.strokeStyle = '#00E5FF'
        ctx.lineWidth = 4
        ctx.setLineDash([8, 4])
        const cx = 320, cy = 240
        if (exercise === 'squat') {
            ctx.beginPath(); ctx.arc(cx, cy - 100, 15, 0, Math.PI * 2); ctx.stroke()
            ctx.beginPath(); ctx.moveTo(cx, cy - 85); ctx.lineTo(cx, cy - 10); ctx.stroke()
            ctx.beginPath(); ctx.moveTo(cx - 40, cy - 75); ctx.lineTo(cx + 40, cy - 75); ctx.stroke()
            ctx.beginPath(); ctx.moveTo(cx - 15, cy - 10); ctx.lineTo(cx - 35, cy + 50); ctx.lineTo(cx - 25, cy + 110); ctx.moveTo(cx + 15, cy - 10); ctx.lineTo(cx + 35, cy + 50); ctx.lineTo(cx + 25, cy + 110); ctx.stroke()
        } else if (exercise === 'pushup') {
            ctx.beginPath(); ctx.arc(cx - 140, cy, 12, 0, Math.PI * 2); ctx.stroke()
            ctx.beginPath(); ctx.moveTo(cx - 128, cy); ctx.lineTo(cx + 120, cy); ctx.stroke()
            ctx.beginPath(); ctx.moveTo(cx - 100, cy); ctx.lineTo(cx - 100, cy + 60); ctx.moveTo(cx + 80, cy); ctx.lineTo(cx + 80, cy + 60); ctx.stroke()
        } else if (exercise === 'plank') {
            ctx.beginPath(); ctx.arc(cx - 140, cy + 10, 12, 0, Math.PI * 2); ctx.stroke()
            ctx.beginPath(); ctx.moveTo(cx - 128, cy + 10); ctx.lineTo(cx + 140, cy + 10); ctx.stroke()
            ctx.beginPath(); ctx.moveTo(cx - 90, cy + 10); ctx.lineTo(cx - 90, cy + 60); ctx.stroke()
        } else if (exercise === 'deadlift') {
            ctx.beginPath(); ctx.arc(cx, cy - 80, 15, 0, Math.PI * 2); ctx.stroke()
            ctx.beginPath(); ctx.moveTo(cx, cy - 65); ctx.lineTo(cx, cy + 10); ctx.stroke()
            ctx.beginPath(); ctx.moveTo(cx - 15, cy + 10); ctx.lineTo(cx - 20, cy + 100); ctx.moveTo(cx + 15, cy + 10); ctx.lineTo(cx + 20, cy + 100); ctx.stroke()
        }
        ctx.restore()
    }

    function drawAngleAnnotations(ctx, lm, exercise) {
        ctx.save()
        ctx.font = 'bold 14px Inter, sans-serif'
        ctx.textAlign = 'center'
        if (exercise === 'squat') {
            // Both knees
            const lKnee = getAngle(lm[23], lm[25], lm[27])
            const rKnee = getAngle(lm[24], lm[26], lm[28])
            drawAngleBubble(ctx, lm[25].x * 640, lm[25].y * 480, `${lKnee}°`, lKnee < 110 ? '#00E676' : '#FF3D71')
            drawAngleBubble(ctx, lm[26].x * 640, lm[26].y * 480, `${rKnee}°`, rKnee < 110 ? '#00E676' : '#FF3D71')
        } else if (exercise === 'pushup') {
            const lElbow = getAngle(lm[11], lm[13], lm[15])
            const rElbow = getAngle(lm[12], lm[14], lm[16])
            drawAngleBubble(ctx, lm[13].x * 640, lm[13].y * 480, `${lElbow}°`, lElbow < 130 ? '#00E676' : '#FFD600')
            drawAngleBubble(ctx, lm[14].x * 640, lm[14].y * 480, `${rElbow}°`, rElbow < 130 ? '#00E676' : '#FFD600')
        } else if (exercise === 'plank') {
            const body = getAngle(lm[11], lm[23], lm[27])
            drawAngleBubble(ctx, lm[23].x * 640, lm[23].y * 480, `${body}°`, body > 155 ? '#00E676' : '#FF3D71')
        } else if (exercise === 'deadlift') {
            const back = getAngle(lm[11], lm[23], lm[25])
            drawAngleBubble(ctx, lm[23].x * 640, lm[23].y * 480, `${back}°`, back > 80 ? '#00E676' : '#FF3D71')
        }
        ctx.restore()
    }

    function drawAngleBubble(ctx, x, y, text, color) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)'
        ctx.beginPath()
        ctx.roundRect(x - 25, y - 28, 50, 22, 6)
        ctx.fill()
        ctx.fillStyle = color
        ctx.fillText(text, x, y - 12)
    }

    // ============================================================
    // MAIN ANALYSIS — refined scoring + rep detection
    // ============================================================
    function analyzeForm(results, exercise) {
        if (!results.poseLandmarks) {
            setBodyDetected(false); setFormScore(null); setFormFeedback([]); return
        }
        const lm = results.poseLandmarks
        if (!checkBodyVisibility(lm, exercise)) {
            setBodyDetected(false); setFormScore(null)
            setFormFeedback([{ key: 'visibility', status: 'warning', msg: 'Position your body in frame', angle: null }])
            return
        }
        setBodyDetected(true)

        const feedback = []
        let totalPoints = 0
        let maxPoints = 0
        const now = Date.now()
        let worstCorrection = null // the most urgent correction to speak

        if (exercise === 'squat') {
            // Average both knees for accuracy
            const kneeAngle = getAvgAngle(lm, [[23, 25, 27], [24, 26, 28]])
            const backAngle = getAvgAngle(lm, [[11, 23, 25], [12, 24, 26]])

            // KNEE SCORING — granular
            maxPoints += 50
            if (kneeAngle <= 95) { totalPoints += 50; feedback.push({ key: 'depth', status: 'good', msg: `Perfect depth — ${kneeAngle}°` }) }
            else if (kneeAngle <= 110) { totalPoints += 40; feedback.push({ key: 'depth', status: 'good', msg: `Good depth — ${kneeAngle}°` }) }
            else if (kneeAngle <= 130) { totalPoints += 25; feedback.push({ key: 'depth', status: 'warning', msg: `Go deeper — ${kneeAngle}°` }); worstCorrection = { cat: 'depth', angle: kneeAngle } }
            else if (kneeAngle <= 150) { totalPoints += 10; feedback.push({ key: 'depth', status: 'bad', msg: `Much deeper — ${kneeAngle}°` }); worstCorrection = { cat: 'depth', angle: kneeAngle } }
            else { totalPoints += 0; feedback.push({ key: 'depth', status: 'bad', msg: `Not squatting — ${kneeAngle}°` }); worstCorrection = { cat: 'depth', angle: kneeAngle } }

            // BACK SCORING
            maxPoints += 50
            if (backAngle >= 75) { totalPoints += 50; feedback.push({ key: 'back', status: 'good', msg: `Back straight — ${backAngle}°` }) }
            else if (backAngle >= 65) { totalPoints += 35; feedback.push({ key: 'back', status: 'warning', msg: `Slight lean — ${backAngle}°` }); if (!worstCorrection) worstCorrection = { cat: 'back', angle: backAngle } }
            else { totalPoints += 10; feedback.push({ key: 'back', status: 'bad', msg: `Back rounding — ${backAngle}°` }); worstCorrection = { cat: 'back', angle: backAngle } }

            // REP DETECTION — state machine with hysteresis
            detectRep(kneeAngle, 100, 150, exercise)
        }

        if (exercise === 'pushup') {
            const elbowAngle = getAvgAngle(lm, [[11, 13, 15], [12, 14, 16]])
            const bodyAngle = getAvgAngle(lm, [[11, 23, 27], [12, 24, 28]])

            maxPoints += 50
            if (elbowAngle <= 95) { totalPoints += 50; feedback.push({ key: 'elbows', status: 'good', msg: `Great depth — ${elbowAngle}°` }) }
            else if (elbowAngle <= 120) { totalPoints += 35; feedback.push({ key: 'elbows', status: 'good', msg: `Good — ${elbowAngle}°` }) }
            else if (elbowAngle <= 145) { totalPoints += 20; feedback.push({ key: 'elbows', status: 'warning', msg: `Go lower — ${elbowAngle}°` }); worstCorrection = { cat: 'elbows', angle: elbowAngle } }
            else { totalPoints += 5; feedback.push({ key: 'elbows', status: 'bad', msg: `Much lower — ${elbowAngle}°` }); worstCorrection = { cat: 'elbows', angle: elbowAngle } }

            maxPoints += 50
            if (bodyAngle >= 165) { totalPoints += 50; feedback.push({ key: 'alignment', status: 'good', msg: `Body straight — ${bodyAngle}°` }) }
            else if (bodyAngle >= 155) { totalPoints += 35; feedback.push({ key: 'alignment', status: 'warning', msg: `Slight sag — ${bodyAngle}°` }); if (!worstCorrection) worstCorrection = { cat: 'alignment', angle: bodyAngle } }
            else { totalPoints += 10; feedback.push({ key: 'alignment', status: 'bad', msg: `Hips dropping — ${bodyAngle}°` }); worstCorrection = { cat: 'alignment', angle: bodyAngle } }

            detectRep(elbowAngle, 100, 155, exercise)
        }

        if (exercise === 'plank') {
            const bodyAngle = getAvgAngle(lm, [[11, 23, 27], [12, 24, 28]])
            const shoulderAngle = getAvgAngle(lm, [[13, 11, 23], [14, 12, 24]])

            maxPoints += 60
            if (bodyAngle >= 165 && bodyAngle <= 185) { totalPoints += 60; feedback.push({ key: 'hips', status: 'good', msg: `Perfect line — ${bodyAngle}°` }) }
            else if (bodyAngle >= 155) { totalPoints += 40; feedback.push({ key: 'hips', status: 'warning', msg: `Slight sag — ${bodyAngle}°` }); worstCorrection = { cat: 'hips', angle: bodyAngle } }
            else if (bodyAngle >= 145) { totalPoints += 20; feedback.push({ key: 'hips', status: 'bad', msg: `Hips sagging — ${bodyAngle}°` }); worstCorrection = { cat: 'hips', angle: bodyAngle } }
            else { totalPoints += 5; feedback.push({ key: 'hips', status: 'bad', msg: `Major sag — ${bodyAngle}°` }); worstCorrection = { cat: 'hips', angle: bodyAngle } }

            maxPoints += 40
            if (shoulderAngle >= 70) { totalPoints += 40; feedback.push({ key: 'shoulders', status: 'good', msg: `Shoulders good — ${shoulderAngle}°` }) }
            else { totalPoints += 15; feedback.push({ key: 'shoulders', status: 'warning', msg: `Shoulders off — ${shoulderAngle}°` }); if (!worstCorrection) worstCorrection = { cat: 'shoulders', angle: shoulderAngle } }
        }

        if (exercise === 'deadlift') {
            const backAngle = getAvgAngle(lm, [[11, 23, 25], [12, 24, 26]])
            const hipAngle = getAvgAngle(lm, [[11, 23, 27], [12, 24, 28]])

            maxPoints += 55
            if (backAngle >= 90) { totalPoints += 55; feedback.push({ key: 'back', status: 'good', msg: `Back flat — ${backAngle}°` }) }
            else if (backAngle >= 80) { totalPoints += 35; feedback.push({ key: 'back', status: 'warning', msg: `Slight round — ${backAngle}°` }); worstCorrection = { cat: 'back', angle: backAngle } }
            else { totalPoints += 10; feedback.push({ key: 'back', status: 'bad', msg: `Back rounding — ${backAngle}°` }); worstCorrection = { cat: 'back', angle: backAngle } }

            maxPoints += 45
            if (hipAngle <= 130) { totalPoints += 45; feedback.push({ key: 'hips', status: 'good', msg: `Good hinge — ${hipAngle}°` }) }
            else if (hipAngle <= 150) { totalPoints += 30; feedback.push({ key: 'hips', status: 'warning', msg: `Hinge more — ${hipAngle}°` }); if (!worstCorrection) worstCorrection = { cat: 'hips', angle: hipAngle } }
            else { totalPoints += 10; feedback.push({ key: 'hips', status: 'bad', msg: `Not hinging — ${hipAngle}°` }); worstCorrection = { cat: 'hips', angle: hipAngle } }

            const kneeAngle = getAvgAngle(lm, [[23, 25, 27], [24, 26, 28]])
            detectRep(kneeAngle, 130, 160, exercise)
        }

        const score = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0
        setFormScore(score)
        setFormFeedback(feedback)
        setSessionScores((prev) => [...prev.slice(-50), score])

        // Track consecutive good frames
        if (score >= 80) {
            goodFormStreak.current++
        } else {
            goodFormStreak.current = 0
        }

        // ============================================================
        // VOICE ENGINE — continuous, varied, context-aware
        // ============================================================
        const lines = VOICE[exercise]
        if (!lines) return

        const isSpeaking = speakingRef.current || (window.speechSynthesis && window.speechSynthesis.speaking)

        if (!isSpeaking) {
            if (worstCorrection && now - lastCorrectionTime.current > 3000) {
                // BAD/WARNING FORM → speak correction every 3s
                const corrLines = lines.corrections[worstCorrection.cat]
                if (corrLines) {
                    lastCorrectionTime.current = now
                    smartSpeak(pickLine(corrLines, lastCorrectionIdx))
                }
            } else if (score >= 80 && now - lastAppreciationTime.current > 4000) {
                // GOOD FORM → appreciate every 4s
                lastAppreciationTime.current = now
                smartSpeak(pickLine(lines.appreciation, lastAppreciationIdx))
            } else if (!worstCorrection && now - lastTipTime.current > 6000 && now - lastCorrectionTime.current > 2000 && now - lastAppreciationTime.current > 2000) {
                // IN BETWEEN → posture tip every 6s
                lastTipTime.current = now
                smartSpeak(pickLine(lines.tips, lastTipIdx))
            }
        }
    }

    // Rep detection with state machine + hysteresis
    function detectRep(angle, downThreshold, upThreshold, exercise) {
        if (repPhaseRef.current === 'up' && angle < downThreshold) {
            repPhaseCountRef.current++
            if (repPhaseCountRef.current >= 3) { // require 3 frames at bottom to confirm
                repPhaseRef.current = 'down'
                repPhaseCountRef.current = 0
            }
        } else if (repPhaseRef.current === 'down' && angle > upThreshold) {
            repPhaseCountRef.current++
            if (repPhaseCountRef.current >= 3) { // require 3 frames at top to confirm
                repPhaseRef.current = 'up'
                repPhaseCountRef.current = 0
                setRepCount((r) => r + 1)

                // Celebrate the rep
                const now = Date.now()
                if (now - lastRepCelebrateTime.current > 2000) {
                    lastRepCelebrateTime.current = now
                    smartSpeak(pickLine(REP_CELEBRATIONS, lastRepIdx))
                }
            }
        } else {
            repPhaseCountRef.current = 0
        }
    }

    const avgScore = sessionScores.length > 0
        ? Math.round(sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length)
        : null

    // === EXERCISE SELECT ===
    if (!selectedExercise) {
        return (
            <div className="posture-page">
                <div className="bg-gradient-mesh" />
                <div className="posture-container">
                    <button className="btn btn-ghost" onClick={() => navigate('/dashboard')} style={{ alignSelf: 'flex-start', marginBottom: 'var(--space-4)' }}>← Dashboard</button>
                    <h2 className="step-title">Form Check</h2>
                    <p className="step-subtitle">Pick an exercise. We'll track your form with real-time voice coaching.</p>
                    <div className="posture-exercise-grid">
                        {Object.entries(EXERCISES_CONFIG).map(([key, ex]) => (
                            <button key={key} className="posture-exercise-card glass-card img-card" onClick={() => setSelectedExercise(key)}>
                                <img src={ex.image} alt={ex.name} className="posture-card-img" />
                                <div className="posture-card-overlay">
                                    <span className="posture-card-name">{ex.name}</span>
                                    <span className="posture-card-checks">{ex.checks.length} checkpoints</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // === CAMERA VIEW ===
    const config = EXERCISES_CONFIG[selectedExercise]
    const scoreColor = formScore >= 80 ? 'good' : formScore >= 50 ? 'ok' : 'bad'

    return (
        <div className="posture-page">
            <div className="bg-gradient-mesh" />
            <div className="posture-header">
                <button className="btn btn-ghost btn-sm" onClick={() => { stopCamera(); setSelectedExercise(null); setRepCount(0); setSessionScores([]); setFormScore(null); setBodyDetected(false); repPhaseRef.current = 'up' }}>← Back</button>
                <div className="posture-exercise-name"><span>{config.name}</span></div>
                <button className="btn btn-coral btn-sm" onClick={() => { stopCamera(); navigate('/dashboard') }}>End</button>
            </div>

            <div className="posture-layout">
                <div className="posture-camera-container">
                    <video ref={videoRef} className="posture-video" autoPlay playsInline muted />
                    <canvas ref={canvasRef} className="posture-canvas" />
                    <div className={`posture-body-indicator ${bodyDetected ? 'detected' : 'not-detected'}`}>
                        {bodyDetected ? '● Body Detected' : '○ Position your body in frame'}
                    </div>
                    {!cameraActive && (
                        <div className="posture-camera-prompt">
                            <button className="btn btn-primary btn-lg" onClick={startCamera}>Start Camera</button>
                            <p style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>Position yourself so your full body is visible</p>
                        </div>
                    )}
                </div>

                <div className="posture-side-panel">
                    <div className={`posture-score-card glass-card ${bodyDetected && formScore !== null ? scoreColor : ''}`}>
                        <div className="posture-score-big">{formScore !== null && bodyDetected ? `${formScore}%` : '—'}</div>
                        <div className="posture-score-label">Form Score</div>
                    </div>

                    <div className="posture-stats-row">
                        <div className="posture-mini-stat glass-card">
                            <div className="posture-mini-val">{repCount}</div>
                            <div className="posture-mini-label">Reps</div>
                        </div>
                        <div className="posture-mini-stat glass-card">
                            <div className="posture-mini-val">{avgScore !== null ? `${avgScore}%` : '—'}</div>
                            <div className="posture-mini-label">Avg</div>
                        </div>
                    </div>

                    <div className="posture-feedback-chips">
                        {formFeedback.map((f, i) => (
                            <div key={i} className={`posture-chip ${f.status}`}>
                                <span className={`posture-chip-dot ${f.status}`} />
                                <span className="posture-chip-text">{f.msg}</span>
                            </div>
                        ))}
                    </div>

                    {/* Voice line display */}
                    {lastVoiceLine && (
                        <div className="posture-voice-display glass-card">
                            <span className="voice-icon">🔊</span>
                            <span className="voice-text">{lastVoiceLine}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
        const script = document.createElement('script')
        script.src = src
        script.crossOrigin = 'anonymous'
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
    })
}
