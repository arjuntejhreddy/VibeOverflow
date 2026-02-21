import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import { saveSetting, getSetting } from '../../db'
import { MEAL_IMAGES } from '../../utils/images'
import './Nutrition.css'

/* ─────────────────────────── Data ─────────────────────────── */
const INGREDIENT_SUGGESTIONS = [
    'Rice', 'Brown Rice', 'Quinoa', 'Oats', 'Bread', 'Pasta', 'Noodles', 'Flour', 'Whole Wheat Flour',
    'Chicken Breast', 'Chicken Thigh', 'Eggs', 'Salmon', 'Tuna', 'Tofu', 'Paneer', 'Greek Yogurt', 'Milk', 'Cheese',
    'Onion', 'Tomato', 'Garlic', 'Ginger', 'Bell Pepper', 'Broccoli', 'Spinach', 'Carrot', 'Cucumber', 'Lettuce',
    'Potato', 'Sweet Potato', 'Peas', 'Corn', 'Mushroom', 'Capsicum', 'Zucchini', 'Eggplant', 'Cauliflower',
    'Lemon', 'Lime', 'Banana', 'Apple', 'Berries', 'Mango', 'Orange', 'Avocado',
    'Olive Oil', 'Coconut Oil', 'Butter', 'Ghee', 'Sesame Oil',
    'Salt', 'Black Pepper', 'Cumin', 'Turmeric', 'Chili Powder', 'Paprika', 'Coriander',
    'Soy Sauce', 'Vinegar', 'Honey', 'Sugar', 'Coconut Milk', 'Peanut Butter',
    'Chickpeas', 'Kidney Beans', 'Lentils', 'Toor Dal', 'Moong Dal',
    'Almonds', 'Walnuts', 'Peanuts', 'Cashews', 'Pumpkin Seeds', 'Sesame Seeds',
    'Green Chili', 'Canned Tomatoes', 'Tahini', 'Feta', 'Mozzarella',
    'Flattened Rice', 'Mirin', 'Parsley', 'Basil', 'Oregano',
    'Granola', 'Dark Chocolate', 'Edamame', 'Snap Peas', 'Cherry Tomato',
]
const UNITS = ['pcs', 'g', 'kg', 'ml', 'L', 'cups', 'tbsp', 'tsp', 'bunch', 'can']

const CUISINE_MEALS = {
    indian: {
        breakfast: [
            { name: 'Poha with Peanuts', ingredients: [{ item: 'Flattened Rice', qty: 200, unit: 'g' }, { item: 'Peanuts', qty: 50, unit: 'g' }, { item: 'Onion', qty: 1, unit: 'pcs' }, { item: 'Green Chili', qty: 2, unit: 'pcs' }, { item: 'Turmeric', qty: 1, unit: 'tsp' }, { item: 'Mustard Seeds', qty: 1, unit: 'tsp' }], macros: { cal: 280, protein: 8, carbs: 42, fat: 9 }, steps: ['Soak poha in water 5 min, then drain.', 'Heat oil; add mustard seeds and peanuts.', 'Add chopped onion and green chili, sauté.', 'Add turmeric, salt and drained poha.', 'Mix well, cook 3 min. Serve with lemon.'], time: 15 },
            { name: 'Moong Dal Chilla', ingredients: [{ item: 'Moong Dal', qty: 200, unit: 'g' }, { item: 'Onion', qty: 1, unit: 'pcs' }, { item: 'Tomato', qty: 1, unit: 'pcs' }, { item: 'Green Chili', qty: 1, unit: 'pcs' }, { item: 'Coriander', qty: 1, unit: 'bunch' }], macros: { cal: 220, protein: 14, carbs: 28, fat: 5 }, steps: ['Soak moong dal 4 hrs; grind to paste.', 'Add onion, tomato, chili, coriander.', 'Spread on hot pan like a crepe.', 'Cook both sides until golden.', 'Serve with green chutney.'], time: 20 },
            { name: 'Masala Oats', ingredients: [{ item: 'Oats', qty: 100, unit: 'g' }, { item: 'Onion', qty: 1, unit: 'pcs' }, { item: 'Tomato', qty: 1, unit: 'pcs' }, { item: 'Peas', qty: 50, unit: 'g' }, { item: 'Cumin', qty: 1, unit: 'tsp' }, { item: 'Turmeric', qty: 0.5, unit: 'tsp' }], macros: { cal: 250, protein: 10, carbs: 38, fat: 6 }, steps: ['Heat oil; add cumin seeds.', 'Add onion; sauté till golden.', 'Add tomato, peas, turmeric, salt.', 'Add oats and water, stir well.', 'Cook 5 min until thick.'], time: 12 },
        ],
        lunch: [
            { name: 'Dal Tadka with Brown Rice', ingredients: [{ item: 'Toor Dal', qty: 200, unit: 'g' }, { item: 'Brown Rice', qty: 150, unit: 'g' }, { item: 'Onion', qty: 1, unit: 'pcs' }, { item: 'Tomato', qty: 2, unit: 'pcs' }, { item: 'Garlic', qty: 4, unit: 'pcs' }, { item: 'Cumin', qty: 1, unit: 'tsp' }, { item: 'Ghee', qty: 1, unit: 'tbsp' }], macros: { cal: 420, protein: 18, carbs: 62, fat: 10 }, steps: ['Cook toor dal with turmeric till soft.', 'Cook brown rice separately.', 'Heat ghee; crackle cumin, add garlic.', 'Add onion, tomato, chili. Pour over dal.', 'Serve with rice.'], time: 35 },
            { name: 'Rajma Chawal', ingredients: [{ item: 'Kidney Beans', qty: 200, unit: 'g' }, { item: 'Rice', qty: 150, unit: 'g' }, { item: 'Onion', qty: 1, unit: 'pcs' }, { item: 'Tomato', qty: 2, unit: 'pcs' }, { item: 'Ginger', qty: 1, unit: 'pcs' }, { item: 'Garlic', qty: 3, unit: 'pcs' }], macros: { cal: 450, protein: 20, carbs: 68, fat: 8 }, steps: ['Pressure-cook soaked rajma till soft.', 'Sauté onion, ginger-garlic paste.', 'Add tomato and spices till thick.', 'Add cooked rajma; simmer 10 min.', 'Serve over steamed basmati rice.'], time: 40 },
        ],
        dinner: [
            { name: 'Paneer Bhurji with Roti', ingredients: [{ item: 'Paneer', qty: 200, unit: 'g' }, { item: 'Whole Wheat Flour', qty: 150, unit: 'g' }, { item: 'Onion', qty: 1, unit: 'pcs' }, { item: 'Tomato', qty: 1, unit: 'pcs' }, { item: 'Capsicum', qty: 1, unit: 'pcs' }], macros: { cal: 380, protein: 22, carbs: 35, fat: 16 }, steps: ['Crumble paneer finely.', 'Sauté onion, tomato, capsicum with spices.', 'Add crumbled paneer; mix well.', 'Cook 5 min. Meanwhile knead roti dough.', 'Roll and cook roti on tawa; serve.'], time: 25 },
            { name: 'Chicken Curry with Chapati', ingredients: [{ item: 'Chicken Breast', qty: 300, unit: 'g' }, { item: 'Whole Wheat Flour', qty: 150, unit: 'g' }, { item: 'Onion', qty: 2, unit: 'pcs' }, { item: 'Tomato', qty: 2, unit: 'pcs' }, { item: 'Greek Yogurt', qty: 100, unit: 'ml' }], macros: { cal: 480, protein: 35, carbs: 38, fat: 18 }, steps: ['Marinate chicken in yogurt & spices 30 min.', 'Sauté onion golden; add ginger-garlic.', 'Add tomato; cook down. Add chicken.', 'Simmer 20 min until cooked through.', 'Serve with freshly made chapati.'], time: 40 },
        ],
        snack: [
            { name: 'Roasted Chana', ingredients: [{ item: 'Chickpeas', qty: 200, unit: 'g' }, { item: 'Salt', qty: 1, unit: 'tsp' }, { item: 'Chili Powder', qty: 0.5, unit: 'tsp' }], macros: { cal: 120, protein: 7, carbs: 18, fat: 2 }, steps: ['Drain and pat-dry canned chickpeas.', 'Toss with salt and spices.', 'Roast at 200°C for 25 min.'], time: 30 },
        ],
    },
    mediterranean: {
        breakfast: [
            { name: 'Greek Yogurt Bowl', ingredients: [{ item: 'Greek Yogurt', qty: 200, unit: 'g' }, { item: 'Honey', qty: 1, unit: 'tbsp' }, { item: 'Walnuts', qty: 30, unit: 'g' }, { item: 'Berries', qty: 100, unit: 'g' }, { item: 'Granola', qty: 40, unit: 'g' }], macros: { cal: 320, protein: 18, carbs: 35, fat: 12 }, steps: ['Scoop yogurt into bowl.', 'Drizzle with honey.', 'Top with walnuts, berries, granola.'], time: 5 },
            { name: 'Shakshuka', ingredients: [{ item: 'Eggs', qty: 3, unit: 'pcs' }, { item: 'Canned Tomatoes', qty: 400, unit: 'g' }, { item: 'Onion', qty: 1, unit: 'pcs' }, { item: 'Bell Pepper', qty: 1, unit: 'pcs' }, { item: 'Cumin', qty: 1, unit: 'tsp' }, { item: 'Feta', qty: 50, unit: 'g' }], macros: { cal: 300, protein: 18, carbs: 15, fat: 18 }, steps: ['Sauté onion and bell pepper.', 'Add canned tomatoes, cumin, paprika.', 'Simmer 10 min.', 'Make wells; crack in eggs. Cover 5 min.', 'Crumble feta on top.'], time: 20 },
        ],
        lunch: [
            { name: 'Falafel Wrap', ingredients: [{ item: 'Chickpeas', qty: 300, unit: 'g' }, { item: 'Parsley', qty: 1, unit: 'bunch' }, { item: 'Bread', qty: 2, unit: 'pcs' }, { item: 'Tahini', qty: 2, unit: 'tbsp' }, { item: 'Lettuce', qty: 100, unit: 'g' }, { item: 'Tomato', qty: 1, unit: 'pcs' }], macros: { cal: 420, protein: 16, carbs: 52, fat: 16 }, steps: ['Blend chickpeas, parsley, spices.', 'Form balls; pan-fry until golden.', 'Warm pita bread.', 'Fill pita with falafel, lettuce, tomato.', 'Drizzle with tahini sauce.'], time: 25 },
        ],
        dinner: [
            { name: 'Grilled Chicken & Quinoa', ingredients: [{ item: 'Chicken Breast', qty: 200, unit: 'g' }, { item: 'Quinoa', qty: 150, unit: 'g' }, { item: 'Lemon', qty: 1, unit: 'pcs' }, { item: 'Olive Oil', qty: 2, unit: 'tbsp' }, { item: 'Cucumber', qty: 1, unit: 'pcs' }, { item: 'Cherry Tomato', qty: 100, unit: 'g' }], macros: { cal: 450, protein: 38, carbs: 35, fat: 16 }, steps: ['Marinate chicken in lemon, oil, herbs.', 'Cook quinoa per directions.', 'Grill chicken until done.', 'Dice cucumber and tomatoes.', 'Serve chicken over quinoa with salad.'], time: 30 },
        ],
        snack: [
            { name: 'Hummus & Veggies', ingredients: [{ item: 'Chickpeas', qty: 200, unit: 'g' }, { item: 'Tahini', qty: 2, unit: 'tbsp' }, { item: 'Lemon', qty: 1, unit: 'pcs' }, { item: 'Carrot', qty: 2, unit: 'pcs' }, { item: 'Cucumber', qty: 1, unit: 'pcs' }], macros: { cal: 180, protein: 8, carbs: 22, fat: 7 }, steps: ['Blend chickpeas, tahini, lemon, garlic smooth.', 'Slice vegetables into sticks.', 'Serve hummus with veggie sticks.'], time: 10 },
        ],
    },
    'east-asian': {
        breakfast: [
            { name: 'Congee with Egg', ingredients: [{ item: 'Rice', qty: 100, unit: 'g' }, { item: 'Chicken Breast', qty: 100, unit: 'g' }, { item: 'Eggs', qty: 1, unit: 'pcs' }, { item: 'Ginger', qty: 1, unit: 'pcs' }, { item: 'Sesame Oil', qty: 1, unit: 'tsp' }], macros: { cal: 260, protein: 12, carbs: 38, fat: 6 }, steps: ['Simmer rice in broth with ginger 30 min.', 'Stir to porridge consistency.', 'Drop in beaten egg; stir gently.', 'Top with green onion and sesame oil.'], time: 35 },
        ],
        lunch: [
            { name: 'Teriyaki Chicken Bowl', ingredients: [{ item: 'Chicken Thigh', qty: 200, unit: 'g' }, { item: 'Rice', qty: 150, unit: 'g' }, { item: 'Soy Sauce', qty: 2, unit: 'tbsp' }, { item: 'Mirin', qty: 1, unit: 'tbsp' }, { item: 'Broccoli', qty: 100, unit: 'g' }, { item: 'Sesame Seeds', qty: 1, unit: 'tsp' }], macros: { cal: 480, protein: 30, carbs: 55, fat: 14 }, steps: ['Cook rice.', 'Mix soy sauce, mirin, sugar for sauce.', 'Pan-fry chicken; add sauce.', 'Steam broccoli.', 'Serve over rice; top with sesame.'], time: 25 },
        ],
        dinner: [
            { name: 'Stir-Fry Tofu & Veg', ingredients: [{ item: 'Tofu', qty: 200, unit: 'g' }, { item: 'Bell Pepper', qty: 1, unit: 'pcs' }, { item: 'Snap Peas', qty: 100, unit: 'g' }, { item: 'Soy Sauce', qty: 2, unit: 'tbsp' }, { item: 'Garlic', qty: 3, unit: 'pcs' }, { item: 'Rice', qty: 150, unit: 'g' }], macros: { cal: 380, protein: 22, carbs: 42, fat: 12 }, steps: ['Press and cube tofu; pan-fry golden.', 'Stir-fry pepper and snap peas.', 'Add garlic, soy sauce, sesame oil.', 'Combine with tofu.', 'Serve over steamed rice.'], time: 20 },
        ],
        snack: [
            { name: 'Edamame', ingredients: [{ item: 'Edamame', qty: 200, unit: 'g' }, { item: 'Salt', qty: 1, unit: 'tsp' }], macros: { cal: 120, protein: 11, carbs: 9, fat: 5 }, steps: ['Boil edamame 5 minutes.', 'Drain; sprinkle with sea salt.'], time: 5 },
        ],
    },
}

const DEFAULT_MEALS = {
    breakfast: [{ name: 'Oatmeal Power Bowl', ingredients: [{ item: 'Oats', qty: 100, unit: 'g' }, { item: 'Banana', qty: 1, unit: 'pcs' }, { item: 'Peanut Butter', qty: 2, unit: 'tbsp' }, { item: 'Honey', qty: 1, unit: 'tbsp' }, { item: 'Milk', qty: 200, unit: 'ml' }], macros: { cal: 350, protein: 12, carbs: 50, fat: 12 }, steps: ['Cook oats with milk.', 'Slice banana.', 'Top with peanut butter and honey.'], time: 10 }],
    lunch: [{ name: 'Grilled Chicken Salad', ingredients: [{ item: 'Chicken Breast', qty: 200, unit: 'g' }, { item: 'Lettuce', qty: 100, unit: 'g' }, { item: 'Tomato', qty: 1, unit: 'pcs' }, { item: 'Cucumber', qty: 1, unit: 'pcs' }, { item: 'Olive Oil', qty: 1, unit: 'tbsp' }], macros: { cal: 380, protein: 35, carbs: 12, fat: 20 }, steps: ['Grill seasoned chicken.', 'Chop vegetables.', 'Combine; dress with oil and lemon.'], time: 20 }],
    dinner: [{ name: 'Salmon with Vegetables', ingredients: [{ item: 'Salmon', qty: 200, unit: 'g' }, { item: 'Sweet Potato', qty: 200, unit: 'g' }, { item: 'Broccoli', qty: 100, unit: 'g' }, { item: 'Lemon', qty: 1, unit: 'pcs' }, { item: 'Olive Oil', qty: 1, unit: 'tbsp' }], macros: { cal: 420, protein: 32, carbs: 28, fat: 18 }, steps: ['Season salmon with lemon and herbs.', 'Cube sweet potato; toss with oil.', 'Bake everything at 200°C for 20 min.'], time: 25 }],
    snack: [{ name: 'Trail Mix', ingredients: [{ item: 'Almonds', qty: 50, unit: 'g' }, { item: 'Berries', qty: 30, unit: 'g' }, { item: 'Dark Chocolate', qty: 20, unit: 'g' }, { item: 'Pumpkin Seeds', qty: 20, unit: 'g' }], macros: { cal: 200, protein: 6, carbs: 20, fat: 12 }, steps: ['Mix all ingredients.', 'Portion into servings.'], time: 2 }],
}

/* ─────────────────── Helpers & sub-components ─────────────────── */

const MEAL_TYPE_META = {
    breakfast: { label: 'Breakfast', emoji: '🌅', color: '#F59E0B' },
    lunch: { label: 'Lunch', emoji: '☀️', color: '#DC2626' },
    dinner: { label: 'Dinner', emoji: '🌙', color: '#7C3AED' },
    snack: { label: 'Snack', emoji: '🍎', color: '#059669' },
}

/** Small SVG macro ring chart */
function MacroRing({ protein, carbs, fat, cal }) {
    const total = protein + carbs + fat || 1
    const R = 18, C = 2 * Math.PI * R
    const pPct = protein / total, cPct = carbs / total, fPct = fat / total
    const segments = [
        { pct: pPct, color: '#2563EB', offset: 0 },
        { pct: cPct, color: '#059669', offset: pPct },
        { pct: fPct, color: '#DC2626', offset: pPct + cPct },
    ]
    return (
        <svg width="44" height="44" viewBox="0 0 44 44" className="macro-ring-svg">
            <circle cx="22" cy="22" r={R} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="5" />
            {segments.map((s, i) => (
                <circle key={i} cx="22" cy="22" r={R} fill="none"
                    stroke={s.color} strokeWidth="5"
                    strokeDasharray={`${s.pct * C} ${C}`}
                    strokeDashoffset={-s.offset * C}
                    strokeLinecap="butt"
                    transform="rotate(-90 22 22)"
                />
            ))}
            <text x="22" y="26" textAnchor="middle" fontSize="9" fontWeight="700" fill="currentColor">{cal}</text>
        </svg>
    )
}

/** Cooking mode — full-page step-by-step */
function CookingMode({ meal, pantry, onBack, onFinish }) {
    const [step, setStep] = useState(0)
    const [meal_, setMeal] = useState(meal)
    const total = meal_.steps.length
    const pct = ((step + 1) / total) * 100

    function swap(ingredientIdx) {
        const subs = {
            onion: 'Shallots', tomato: 'Canned Tomatoes', chicken: 'Tofu',
            paneer: 'Tofu', rice: 'Quinoa', butter: 'Olive Oil', milk: 'Almond Milk',
        }
        const ing = meal_.ingredients[ingredientIdx]
        const lower = ing.item.toLowerCase()
        let sub = null
        for (const [k, v] of Object.entries(subs)) { if (lower.includes(k)) { sub = v; break } }
        if (!sub) sub = 'Skip'
        const updated = { ...meal_, ingredients: [...meal_.ingredients] }
        updated.ingredients[ingredientIdx] = { ...ing, item: `${sub} (was: ${ing.item})` }
        setMeal(updated)
    }

    return (
        <div className="cook-mode">
            {/* Header bar */}
            <div className="cook-topbar">
                <button className="cook-back-btn" onClick={onBack} aria-label="Back">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <div className="cook-title">{meal_.name}</div>
                <span className="cook-step-label">Step {step + 1}/{total}</span>
            </div>

            {/* Progress bar */}
            <div className="cook-progress-track">
                <div className="cook-progress-fill" style={{ width: `${pct}%` }} />
            </div>

            {/* Macro pills */}
            <div className="cook-macros">
                <span className="cook-macro-chip cook-cal">{meal_.macros.cal} kcal</span>
                <span className="cook-macro-chip cook-protein">🥩 {meal_.macros.protein}g</span>
                <span className="cook-macro-chip cook-carbs">🍞 {meal_.macros.carbs}g</span>
                <span className="cook-macro-chip cook-fat">🥑 {meal_.macros.fat}g</span>
            </div>

            {/* Main step card */}
            <div className="cook-step-wrap">
                <div className="cook-step-num">Step {step + 1}</div>
                <p className="cook-step-text">{meal_.steps[step]}</p>
            </div>

            {/* Step dots */}
            <div className="cook-dots">
                {Array.from({ length: total }, (_, i) => (
                    <button key={i} onClick={() => setStep(i)}
                        className={`cook-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />
                ))}
            </div>

            {/* Nav */}
            <div className="cook-nav">
                <button className="cook-nav-btn secondary" disabled={step === 0} onClick={() => setStep(s => s - 1)}>← Prev</button>
                {step < total - 1
                    ? <button className="cook-nav-btn primary" onClick={() => setStep(s => s + 1)}>Next →</button>
                    : <button className="cook-nav-btn done" onClick={() => onFinish(meal_)}>Done! 🎉</button>
                }
            </div>

            {/* Ingredients sidebar */}
            <details className="cook-ingredients-details">
                <summary className="cook-ingredients-toggle">Show ingredients ({meal_.ingredients.length})</summary>
                <div className="cook-ingredients">
                    {meal_.ingredients.map((ing, i) => {
                        const have = pantry.find(p => p.name.toLowerCase() === ing.item.toLowerCase())
                        return (
                            <div key={i} className={`cook-ing-row ${have ? 'have' : 'missing'}`}>
                                <span className="cook-ing-dot" />
                                <span className="cook-ing-name">{ing.item}</span>
                                <span className="cook-ing-qty">{ing.qty} {ing.unit}</span>
                                {!have && <button className="cook-swap-btn" onClick={() => swap(i)}>Swap</button>}
                            </div>
                        )
                    })}
                </div>
            </details>
        </div>
    )
}

/* ─────────────────── Main Page ─────────────────── */
export default function NutritionPage() {
    const navigate = useNavigate()
    const { state } = useUser()
    const { profile } = state

    const [activeTab, setActiveTab] = useState('meals')
    const [activeMealType, setActiveMealType] = useState('breakfast')
    const [pantry, setPantry] = useState([])
    const [newItem, setNewItem] = useState('')
    const [newQty, setNewQty] = useState(1)
    const [newUnit, setNewUnit] = useState('pcs')
    const [suggestions, setSuggestions] = useState([])
    const [cookingMeal, setCookingMeal] = useState(null)
    const [shoppingList, setShoppingList] = useState([])
    const [checkedItems, setCheckedItems] = useState([])
    const inputRef = useRef(null)

    useEffect(() => {
        getSetting('pantry').then(d => d && setPantry(d))
        getSetting('shoppingList').then(d => d && setShoppingList(d))
    }, [])

    function savePantry(u) { setPantry(u); saveSetting('pantry', u) }
    function handleItemInput(val) {
        setNewItem(val)
        setSuggestions(val.length >= 2
            ? INGREDIENT_SUGGESTIONS.filter(s =>
                s.toLowerCase().includes(val.toLowerCase()) &&
                !pantry.find(p => p.name.toLowerCase() === s.toLowerCase())
            ).slice(0, 6)
            : []
        )
    }
    function addPantryItem(name_) {
        const name = (name_ || newItem).trim()
        if (!name) return
        const idx = pantry.findIndex(p => p.name.toLowerCase() === name.toLowerCase())
        if (idx >= 0) {
            const u = [...pantry]; u[idx].qty += newQty; savePantry(u)
        } else {
            savePantry([...pantry, { name, qty: newQty, unit: newUnit }])
        }
        setNewItem(''); setNewQty(1); setSuggestions([])
    }
    function removePantryItem(i) { savePantry(pantry.filter((_, j) => j !== i)) }
    function adjustQty(i, delta) {
        const u = [...pantry]; u[i].qty = Math.max(0, u[i].qty + delta)
        if (u[i].qty <= 0) u.splice(i, 1)
        savePantry(u)
    }

    function getMeals() {
        const c = profile?.cuisine || 'western'
        return CUISINE_MEALS[c] || DEFAULT_MEALS
    }

    function addToShoppingList(meal) {
        const have = pantry.map(p => p.name.toLowerCase())
        const missing = meal.ingredients
            .filter(ing => !have.includes(ing.item.toLowerCase()))
            .map(ing => `${ing.item} (${ing.qty} ${ing.unit})`)
        const updated = [...new Set([...shoppingList, ...missing])]
        setShoppingList(updated)
        saveSetting('shoppingList', updated)
    }

    function finishCooking(cookedMeal) {
        const u = [...pantry]
        for (const ing of cookedMeal.ingredients) {
            const idx = u.findIndex(p => p.name.toLowerCase() === ing.item.toLowerCase())
            if (idx >= 0) { u[idx].qty = Math.max(0, u[idx].qty - ing.qty); if (u[idx].qty <= 0) u.splice(idx, 1) }
        }
        savePantry(u)
        setCookingMeal(null)
    }

    /** Parse a shopping-list string like "Chicken Breast (200 g)" → { name, qty, unit } */
    function parseShopItem(str) {
        const match = str.match(/^(.+?)\s*\(([\d.]+)\s*(\w+)\)$/)
        if (match) return { name: match[1].trim(), qty: parseFloat(match[2]), unit: match[3] }
        return { name: str.trim(), qty: 1, unit: 'pcs' }
    }

    /** Tick = mark as bought AND immediately add to pantry */
    function toggleCheck(i) {
        setCheckedItems(prev => {
            const alreadyChecked = prev.includes(i)
            if (alreadyChecked) {
                // Un-tick: remove from pantry too
                const parsed = parseShopItem(shoppingList[i])
                const u = [...pantry]
                const idx = u.findIndex(p => p.name.toLowerCase() === parsed.name.toLowerCase())
                if (idx >= 0) {
                    u[idx].qty = Math.max(0, u[idx].qty - parsed.qty)
                    if (u[idx].qty <= 0) u.splice(idx, 1)
                    savePantry(u)
                }
                return prev.filter(x => x !== i)
            } else {
                // Tick: add to pantry right away
                const parsed = parseShopItem(shoppingList[i])
                const u = [...pantry]
                const idx = u.findIndex(p => p.name.toLowerCase() === parsed.name.toLowerCase())
                if (idx >= 0) { u[idx].qty += parsed.qty } else { u.push(parsed) }
                savePantry(u)
                return [...prev, i]
            }
        })
    }

    /** Remove bought items from shopping list (already in pantry from tick) */
    function clearChecked() {
        const remaining = shoppingList.filter((_, i) => !checkedItems.includes(i))
        setShoppingList(remaining)
        saveSetting('shoppingList', remaining)
        setCheckedItems([])
    }

    /* Total daily macros for today */
    const meals = getMeals()
    const todayMeals = ['breakfast', 'lunch', 'dinner', 'snack'].map(t => (meals[t] || DEFAULT_MEALS[t] || [])[0])
    const dailyTotals = todayMeals.reduce((acc, m) => {
        if (!m) return acc
        return { cal: acc.cal + m.macros.cal, protein: acc.protein + m.macros.protein, carbs: acc.carbs + m.macros.carbs, fat: acc.fat + m.macros.fat }
    }, { cal: 0, protein: 0, carbs: 0, fat: 0 })

    /* ── Cooking mode takeover ── */
    if (cookingMeal) {
        return <CookingMode meal={cookingMeal} pantry={pantry} onBack={() => setCookingMeal(null)} onFinish={finishCooking} />
    }

    const typeMeals = meals[activeMealType] || DEFAULT_MEALS[activeMealType] || []
    const meta = MEAL_TYPE_META[activeMealType]

    return (
        <div className="nutri-page">

            {/* ── Page header ── */}
            <div className="nutri-header">
                <button className="nutri-back" onClick={() => navigate('/dashboard')} aria-label="Dashboard">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <div>
                    <h1 className="nutri-title">Meal Plan</h1>
                    <p className="nutri-subtitle">{profile?.cuisine ? `${profile.cuisine.charAt(0).toUpperCase() + profile.cuisine.slice(1)} cuisine` : 'Personalised'} · Built for your training</p>
                </div>
            </div>

            {/* ── Daily macro summary strip ── */}
            <div className="nutri-daily glass-card">
                <div className="nutri-daily-title">Today's Plan</div>
                <div className="nutri-daily-macros">
                    <div className="nutri-daily-macro-item">
                        <span className="ndm-val ndm-cal">{dailyTotals.cal}</span>
                        <span className="ndm-label">kcal</span>
                    </div>
                    <div className="ndm-divider" />
                    <div className="nutri-daily-macro-item">
                        <span className="ndm-val ndm-protein">{dailyTotals.protein}g</span>
                        <span className="ndm-label">Protein</span>
                    </div>
                    <div className="ndm-divider" />
                    <div className="nutri-daily-macro-item">
                        <span className="ndm-val ndm-carbs">{dailyTotals.carbs}g</span>
                        <span className="ndm-label">Carbs</span>
                    </div>
                    <div className="ndm-divider" />
                    <div className="nutri-daily-macro-item">
                        <span className="ndm-val ndm-fat">{dailyTotals.fat}g</span>
                        <span className="ndm-label">Fat</span>
                    </div>
                </div>
                {/* Macro bar */}
                <div className="nutri-macro-bar">
                    <div className="nutri-macro-bar-seg protein" style={{ flex: dailyTotals.protein }} />
                    <div className="nutri-macro-bar-seg carbs" style={{ flex: dailyTotals.carbs }} />
                    <div className="nutri-macro-bar-seg fat" style={{ flex: dailyTotals.fat }} />
                </div>
                <div className="nutri-macro-bar-labels">
                    <span style={{ color: '#2563EB' }}>● Protein</span>
                    <span style={{ color: '#059669' }}>● Carbs</span>
                    <span style={{ color: '#DC2626' }}>● Fat</span>
                </div>
            </div>

            {/* ── Tab bar ── */}
            <div className="nutri-tabs">
                {[
                    { id: 'meals', label: 'Meals', emoji: '🍽' },
                    { id: 'pantry', label: 'Pantry', emoji: '🥫' },
                    { id: 'shopping', label: 'Shopping', emoji: '🛒' },
                ].map(t => (
                    <button key={t.id} className={`nutri-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                        <span className="nutri-tab-emoji">{t.emoji}</span>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ══════════════ MEALS TAB ══════════════ */}
            {activeTab === 'meals' && (
                <div className="nutri-content">
                    {/* Meal-type selector */}
                    <div className="meal-type-row">
                        {Object.entries(MEAL_TYPE_META).map(([key, m]) => (
                            <button
                                key={key}
                                className={`meal-type-btn ${activeMealType === key ? 'active' : ''}`}
                                style={{ '--mt-color': m.color }}
                                onClick={() => setActiveMealType(key)}
                            >
                                <span className="mt-emoji">{m.emoji}</span>
                                <span className="mt-label">{m.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Meal cards */}
                    <div className="meal-cards-list">
                        {typeMeals.map((meal, i) => {
                            const pantryCount = meal.ingredients.filter(ing => pantry.find(p => p.name.toLowerCase() === ing.item.toLowerCase())).length
                            const readyPct = meal.ingredients.length > 0 ? Math.round((pantryCount / meal.ingredients.length) * 100) : 0
                            return (
                                <div key={i} className="meal-card-v3">
                                    {/* Image strip */}
                                    <div className="meal-card-img-wrap" style={{ background: `linear-gradient(135deg, ${meta.color}30, ${meta.color}10)` }}>
                                        <img
                                            src={MEAL_IMAGES[activeMealType]}
                                            alt={meal.name}
                                            className="meal-card-img-v3"
                                            onError={e => { e.target.style.display = 'none' }}
                                        />
                                        <div className="meal-card-img-overlay" style={{ background: `linear-gradient(to right, ${meta.color}60, transparent)` }} />
                                        <div className="meal-card-time-badge">⏱ {meal.time} min</div>
                                        <div className="meal-card-emoji-badge">{meta.emoji}</div>
                                    </div>

                                    {/* Body */}
                                    <div className="meal-card-body">
                                        <div className="meal-card-top">
                                            <div>
                                                <h3 className="meal-card-name">{meal.name}</h3>
                                                <p className="meal-card-ingredients">
                                                    {meal.ingredients.slice(0, 4).map(i => i.item).join(' · ')}
                                                    {meal.ingredients.length > 4 && <em> +{meal.ingredients.length - 4} more</em>}
                                                </p>
                                            </div>
                                            <MacroRing {...meal.macros} />
                                        </div>

                                        {/* Macro chips */}
                                        <div className="meal-card-macros">
                                            <span className="mcc mcc-cal">{meal.macros.cal} cal</span>
                                            <span className="mcc mcc-protein">{meal.macros.protein}g protein</span>
                                            <span className="mcc mcc-carbs">{meal.macros.carbs}g carbs</span>
                                            <span className="mcc mcc-fat">{meal.macros.fat}g fat</span>
                                        </div>

                                        {/* Pantry readiness */}
                                        {pantry.length > 0 && (
                                            <div className="meal-pantry-bar">
                                                <div className="mpb-track">
                                                    <div className="mpb-fill" style={{ width: `${readyPct}%`, background: meta.color }} />
                                                </div>
                                                <span className="mpb-label">{pantryCount}/{meal.ingredients.length} ingredients in pantry</span>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="meal-card-actions">
                                            <button className="mcta-cook" style={{ '--mt-color': meta.color }} onClick={() => setCookingMeal(meal)}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                                                Cook Now
                                            </button>
                                            <button className="mcta-shop" onClick={() => { addToShoppingList(meal); setActiveTab('shopping') }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
                                                Shop
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        {typeMeals.length === 0 && (
                            <div className="nutri-empty">
                                <span className="nutri-empty-icon">{meta.emoji}</span>
                                <p>No {meta.label.toLowerCase()} options for your cuisine yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ══════════════ PANTRY TAB ══════════════ */}
            {activeTab === 'pantry' && (
                <div className="nutri-content">
                    {/* Add form */}
                    <div className="pantry-add-card glass-card">
                        <div className="pantry-add-title">Add ingredients</div>
                        <div className="pantry-add-row">
                            <div className="pantry-input-wrap">
                                <input
                                    ref={inputRef}
                                    className="pantry-input"
                                    placeholder="Search ingredient…"
                                    value={newItem}
                                    onChange={e => handleItemInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addPantryItem()}
                                    autoComplete="off"
                                />
                                {suggestions.length > 0 && (
                                    <div className="pantry-dropdown">
                                        {suggestions.map((s, i) => (
                                            <button key={i} className="pantry-suggestion-v3" onClick={() => { setNewItem(s); setSuggestions([]); setTimeout(() => addPantryItem(s), 0) }}>
                                                <span>{s}</span>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <input className="pantry-qty" type="number" min="0.5" step="0.5" value={newQty} onChange={e => setNewQty(parseFloat(e.target.value) || 1)} />
                            <select className="pantry-unit" value={newUnit} onChange={e => setNewUnit(e.target.value)}>
                                {UNITS.map(u => <option key={u}>{u}</option>)}
                            </select>
                            <button className="pantry-add-btn" onClick={() => addPantryItem()}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            </button>
                        </div>
                    </div>

                    {pantry.length === 0 ? (
                        <div className="nutri-empty">
                            <span className="nutri-empty-icon">🥫</span>
                            <p>Your pantry is empty. Add the ingredients you have at home.</p>
                        </div>
                    ) : (
                        <>
                            <div className="pantry-count">{pantry.length} item{pantry.length !== 1 ? 's' : ''} in pantry</div>
                            <div className="pantry-grid">
                                {pantry.map((item, i) => (
                                    <div key={i} className="pantry-item-v3">
                                        <div className="pantry-item-name-v3">{item.name}</div>
                                        <div className="pantry-item-qty-row">
                                            <button className="pantry-qty-btn" onClick={() => adjustQty(i, -1)}>−</button>
                                            <span className="pantry-qty-val">{item.qty} {item.unit}</span>
                                            <button className="pantry-qty-btn" onClick={() => adjustQty(i, +1)}>+</button>
                                        </div>
                                        <button className="pantry-remove" onClick={() => removePantryItem(i)} aria-label="Remove">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ══════════════ SHOPPING TAB ══════════════ */}
            {activeTab === 'shopping' && (
                <div className="nutri-content">
                    {shoppingList.length === 0 ? (
                        <div className="nutri-empty">
                            <span className="nutri-empty-icon">🛒</span>
                            <p>Shopping list is empty. Tap <strong>Shop</strong> on any meal to add missing ingredients.</p>
                        </div>
                    ) : (
                        <>
                            {/* Summary row */}
                            <div className="shop-header-row">
                                <div className="shop-counts">
                                    <span className="shop-count-remaining">{shoppingList.length - checkedItems.length} to buy</span>
                                    {checkedItems.length > 0 && (
                                        <span className="shop-count-bought">· {checkedItems.length} bought ✓</span>
                                    )}
                                </div>
                            </div>

                            {/* Pantry-ready banner */}
                            {checkedItems.length > 0 && (
                                <div className="shop-pantry-banner">
                                    <div className="shop-pantry-banner-left">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                        <span><strong>{checkedItems.length} item{checkedItems.length !== 1 ? 's' : ''}</strong> added to pantry automatically</span>
                                    </div>
                                    <button className="shop-pantry-done" onClick={clearChecked}>Clear bought</button>
                                </div>
                            )}

                            {/* Items still to buy */}
                            {shoppingList.some((_, i) => !checkedItems.includes(i)) && (
                                <div className="shop-section">
                                    <div className="shop-section-label">To Buy</div>
                                    <div className="shop-list">
                                        {shoppingList.map((item, i) => {
                                            if (checkedItems.includes(i)) return null
                                            return (
                                                <button key={i} className="shop-item" onClick={() => toggleCheck(i)}>
                                                    <div className="shop-checkbox" />
                                                    <span className="shop-item-text">{item}</span>
                                                    <span className="shop-item-hint">Tap when bought</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Bought items */}
                            {checkedItems.length > 0 && (
                                <div className="shop-section">
                                    <div className="shop-section-label">Bought → In Pantry</div>
                                    <div className="shop-list">
                                        {shoppingList.map((item, i) => {
                                            if (!checkedItems.includes(i)) return null
                                            return (
                                                <button key={i} className="shop-item checked" onClick={() => toggleCheck(i)}>
                                                    <div className="shop-checkbox ticked">
                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                    </div>
                                                    <span className="shop-item-text">{item}</span>
                                                    <span className="shop-item-pantry-badge">In pantry</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
