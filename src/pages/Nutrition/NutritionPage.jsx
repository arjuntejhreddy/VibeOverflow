import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import { saveSetting, getSetting } from '../../db'
import { MEAL_IMAGES } from '../../utils/images'
import './Nutrition.css'

// Master ingredient suggestions
const INGREDIENT_SUGGESTIONS = [
    'Rice', 'Brown Rice', 'Quinoa', 'Oats', 'Bread', 'Pasta', 'Noodles', 'Flour', 'Whole Wheat Flour',
    'Chicken Breast', 'Chicken Thigh', 'Eggs', 'Salmon', 'Tuna', 'Tofu', 'Paneer', 'Greek Yogurt', 'Milk', 'Cheese',
    'Onion', 'Tomato', 'Garlic', 'Ginger', 'Bell Pepper', 'Broccoli', 'Spinach', 'Carrot', 'Cucumber', 'Lettuce',
    'Potato', 'Sweet Potato', 'Peas', 'Corn', 'Mushroom', 'Capsicum', 'Zucchini', 'Eggplant', 'Cauliflower',
    'Lemon', 'Lime', 'Banana', 'Apple', 'Berries', 'Mango', 'Orange', 'Avocado',
    'Olive Oil', 'Coconut Oil', 'Butter', 'Ghee', 'Sesame Oil',
    'Salt', 'Black Pepper', 'Cumin', 'Turmeric', 'Chili Powder', 'Paprika', 'Coriander', 'Mustard Seeds',
    'Soy Sauce', 'Vinegar', 'Honey', 'Sugar', 'Coconut Milk', 'Peanut Butter',
    'Chickpeas', 'Kidney Beans', 'Lentils', 'Toor Dal', 'Moong Dal',
    'Almonds', 'Walnuts', 'Peanuts', 'Cashews', 'Pumpkin Seeds', 'Sesame Seeds',
    'Green Chili', 'Canned Tomatoes', 'Tahini', 'Feta', 'Mozzarella',
    'Flattened Rice', 'Soy Sauce', 'Mirin', 'Parsley', 'Basil', 'Oregano',
    'Granola', 'Dark Chocolate', 'Edamame', 'Snap Peas', 'Cherry Tomato',
]

const UNITS = ['pcs', 'g', 'kg', 'ml', 'L', 'cups', 'tbsp', 'tsp', 'bunch', 'can']

const CUISINE_MEALS = {
    'indian': {
        breakfast: [
            { name: 'Poha with Peanuts', ingredients: [{ item: 'Flattened Rice', qty: 200, unit: 'g' }, { item: 'Peanuts', qty: 50, unit: 'g' }, { item: 'Onion', qty: 1, unit: 'pcs' }, { item: 'Green Chili', qty: 2, unit: 'pcs' }, { item: 'Turmeric', qty: 1, unit: 'tsp' }, { item: 'Mustard Seeds', qty: 1, unit: 'tsp' }], macros: { cal: 280, protein: 8, carbs: 42, fat: 9 }, steps: ['Soak poha in water for 5 minutes, drain.', 'Heat oil, add mustard seeds and peanuts.', 'Add chopped onion and green chili, sauté.', 'Add turmeric, salt, then drained poha.', 'Mix well, cook for 3 minutes. Serve with lemon.'], time: 15 },
            { name: 'Moong Dal Chilla', ingredients: [{ item: 'Moong Dal', qty: 200, unit: 'g' }, { item: 'Onion', qty: 1, unit: 'pcs' }, { item: 'Tomato', qty: 1, unit: 'pcs' }, { item: 'Green Chili', qty: 1, unit: 'pcs' }, { item: 'Coriander', qty: 1, unit: 'bunch' }], macros: { cal: 220, protein: 14, carbs: 28, fat: 5 }, steps: ['Soak moong dal for 4 hours, grind to paste.', 'Add chopped onion, tomato, chili, coriander.', 'Spread on hot pan like a crepe.', 'Cook both sides until golden.', 'Serve with green chutney.'], time: 20 },
            { name: 'Masala Oats', ingredients: [{ item: 'Oats', qty: 100, unit: 'g' }, { item: 'Onion', qty: 1, unit: 'pcs' }, { item: 'Tomato', qty: 1, unit: 'pcs' }, { item: 'Peas', qty: 50, unit: 'g' }, { item: 'Cumin', qty: 1, unit: 'tsp' }, { item: 'Turmeric', qty: 0.5, unit: 'tsp' }], macros: { cal: 250, protein: 10, carbs: 38, fat: 6 }, steps: ['Heat oil, add cumin seeds.', 'Add chopped onion, sauté until golden.', 'Add tomato, peas, turmeric, and salt.', 'Add oats and water, stir well.', 'Cook for 5 minutes until thick. Serve hot.'], time: 12 },
        ],
        lunch: [
            { name: 'Dal Tadka with Brown Rice', ingredients: [{ item: 'Toor Dal', qty: 200, unit: 'g' }, { item: 'Brown Rice', qty: 150, unit: 'g' }, { item: 'Onion', qty: 1, unit: 'pcs' }, { item: 'Tomato', qty: 2, unit: 'pcs' }, { item: 'Garlic', qty: 4, unit: 'pcs' }, { item: 'Cumin', qty: 1, unit: 'tsp' }, { item: 'Ghee', qty: 1, unit: 'tbsp' }], macros: { cal: 420, protein: 18, carbs: 62, fat: 10 }, steps: ['Cook toor dal with turmeric until soft.', 'Cook brown rice separately.', 'Heat ghee, add cumin, garlic, onion.', 'Add tomato, cook until soft. Add chili powder.', 'Pour tadka over dal. Serve with rice.'], time: 35 },
            { name: 'Rajma Chawal', ingredients: [{ item: 'Kidney Beans', qty: 200, unit: 'g' }, { item: 'Rice', qty: 150, unit: 'g' }, { item: 'Onion', qty: 1, unit: 'pcs' }, { item: 'Tomato', qty: 2, unit: 'pcs' }, { item: 'Ginger', qty: 1, unit: 'pcs' }, { item: 'Garlic', qty: 3, unit: 'pcs' }], macros: { cal: 450, protein: 20, carbs: 68, fat: 8 }, steps: ['Pressure cook soaked rajma until soft.', 'Sauté onion, ginger-garlic paste.', 'Add tomato, spices, cook until thick.', 'Add cooked rajma and simmer.', 'Serve over steamed basmati rice.'], time: 40 },
        ],
        dinner: [
            { name: 'Paneer Bhurji with Roti', ingredients: [{ item: 'Paneer', qty: 200, unit: 'g' }, { item: 'Whole Wheat Flour', qty: 150, unit: 'g' }, { item: 'Onion', qty: 1, unit: 'pcs' }, { item: 'Tomato', qty: 1, unit: 'pcs' }, { item: 'Capsicum', qty: 1, unit: 'pcs' }], macros: { cal: 380, protein: 22, carbs: 35, fat: 16 }, steps: ['Crumble paneer into small pieces.', 'Sauté onion, tomato, capsicum with spices.', 'Add crumbled paneer, mix well.', 'Cook for 5 minutes. Make roti from dough.', 'Roll and cook roti on tawa. Serve together.'], time: 25 },
            { name: 'Chicken Curry with Chapati', ingredients: [{ item: 'Chicken Breast', qty: 300, unit: 'g' }, { item: 'Whole Wheat Flour', qty: 150, unit: 'g' }, { item: 'Onion', qty: 2, unit: 'pcs' }, { item: 'Tomato', qty: 2, unit: 'pcs' }, { item: 'Greek Yogurt', qty: 100, unit: 'ml' }], macros: { cal: 480, protein: 35, carbs: 38, fat: 18 }, steps: ['Marinate chicken in yogurt and spices.', 'Sauté onion until golden, add ginger-garlic.', 'Add tomato, cook. Add marinated chicken.', 'Simmer until chicken is cooked through.', 'Make chapati. Serve curry with chapati.'], time: 40 },
        ],
        snack: [
            { name: 'Roasted Chana', ingredients: [{ item: 'Chickpeas', qty: 200, unit: 'g' }, { item: 'Salt', qty: 1, unit: 'tsp' }, { item: 'Chili Powder', qty: 0.5, unit: 'tsp' }], macros: { cal: 120, protein: 7, carbs: 18, fat: 2 }, steps: ['Drain and dry canned chickpeas.', 'Toss with spices.', 'Roast in oven at 200°C for 25 min or pan-roast.'], time: 30 },
        ],
    },
    'mediterranean': {
        breakfast: [
            { name: 'Greek Yogurt Bowl', ingredients: [{ item: 'Greek Yogurt', qty: 200, unit: 'g' }, { item: 'Honey', qty: 1, unit: 'tbsp' }, { item: 'Walnuts', qty: 30, unit: 'g' }, { item: 'Berries', qty: 100, unit: 'g' }, { item: 'Granola', qty: 40, unit: 'g' }], macros: { cal: 320, protein: 18, carbs: 35, fat: 12 }, steps: ['Scoop yogurt into a bowl.', 'Drizzle honey over yogurt.', 'Top with walnuts, berries, and granola.'], time: 5 },
            { name: 'Shakshuka', ingredients: [{ item: 'Eggs', qty: 3, unit: 'pcs' }, { item: 'Canned Tomatoes', qty: 400, unit: 'g' }, { item: 'Onion', qty: 1, unit: 'pcs' }, { item: 'Bell Pepper', qty: 1, unit: 'pcs' }, { item: 'Cumin', qty: 1, unit: 'tsp' }, { item: 'Feta', qty: 50, unit: 'g' }], macros: { cal: 300, protein: 18, carbs: 15, fat: 18 }, steps: ['Sauté onion and bell pepper.', 'Add canned tomatoes, cumin, paprika.', 'Simmer for 10 minutes.', 'Make wells, crack eggs in. Cover and cook 5 min.', 'Crumble feta on top. Serve with bread.'], time: 20 },
        ],
        lunch: [
            { name: 'Falafel Wrap', ingredients: [{ item: 'Chickpeas', qty: 300, unit: 'g' }, { item: 'Parsley', qty: 1, unit: 'bunch' }, { item: 'Bread', qty: 2, unit: 'pcs' }, { item: 'Tahini', qty: 2, unit: 'tbsp' }, { item: 'Lettuce', qty: 100, unit: 'g' }, { item: 'Tomato', qty: 1, unit: 'pcs' }], macros: { cal: 420, protein: 16, carbs: 52, fat: 16 }, steps: ['Blend chickpeas, parsley, onion, spices.', 'Form into balls, pan-fry until golden.', 'Warm pita bread.', 'Fill pita with falafel, lettuce, tomato.', 'Drizzle with tahini sauce.'], time: 25 },
        ],
        dinner: [
            { name: 'Grilled Chicken with Quinoa', ingredients: [{ item: 'Chicken Breast', qty: 200, unit: 'g' }, { item: 'Quinoa', qty: 150, unit: 'g' }, { item: 'Lemon', qty: 1, unit: 'pcs' }, { item: 'Olive Oil', qty: 2, unit: 'tbsp' }, { item: 'Cucumber', qty: 1, unit: 'pcs' }, { item: 'Cherry Tomato', qty: 100, unit: 'g' }], macros: { cal: 450, protein: 38, carbs: 35, fat: 16 }, steps: ['Marinate chicken in lemon, olive oil, herbs.', 'Cook quinoa per package directions.', 'Grill chicken until done.', 'Dice cucumber and tomatoes for salad.', 'Serve chicken over quinoa with salad.'], time: 30 },
        ],
        snack: [
            { name: 'Hummus with Veggies', ingredients: [{ item: 'Chickpeas', qty: 200, unit: 'g' }, { item: 'Tahini', qty: 2, unit: 'tbsp' }, { item: 'Lemon', qty: 1, unit: 'pcs' }, { item: 'Carrot', qty: 2, unit: 'pcs' }, { item: 'Cucumber', qty: 1, unit: 'pcs' }], macros: { cal: 180, protein: 8, carbs: 22, fat: 7 }, steps: ['Blend chickpeas, tahini, lemon, garlic until smooth.', 'Slice vegetables into sticks.', 'Serve hummus with vegetable sticks.'], time: 10 },
        ],
    },
    'east-asian': {
        breakfast: [
            { name: 'Congee with Egg', ingredients: [{ item: 'Rice', qty: 100, unit: 'g' }, { item: 'Chicken Breast', qty: 100, unit: 'g' }, { item: 'Eggs', qty: 1, unit: 'pcs' }, { item: 'Ginger', qty: 1, unit: 'pcs' }, { item: 'Sesame Oil', qty: 1, unit: 'tsp' }], macros: { cal: 260, protein: 12, carbs: 38, fat: 6 }, steps: ['Simmer rice in broth with ginger for 30 min.', 'Stir until porridge consistency.', 'Drop in beaten egg, stir gently.', 'Top with green onion and sesame oil.'], time: 35 },
        ],
        lunch: [
            { name: 'Teriyaki Chicken Rice Bowl', ingredients: [{ item: 'Chicken Thigh', qty: 200, unit: 'g' }, { item: 'Rice', qty: 150, unit: 'g' }, { item: 'Soy Sauce', qty: 2, unit: 'tbsp' }, { item: 'Mirin', qty: 1, unit: 'tbsp' }, { item: 'Broccoli', qty: 100, unit: 'g' }, { item: 'Sesame Seeds', qty: 1, unit: 'tsp' }], macros: { cal: 480, protein: 30, carbs: 55, fat: 14 }, steps: ['Cook rice.', 'Mix soy sauce, mirin, sugar for teriyaki.', 'Pan-fry chicken, add sauce. Glaze well.', 'Steam broccoli.', 'Serve chicken and broccoli over rice. Top with sesame.'], time: 25 },
        ],
        dinner: [
            { name: 'Stir-Fry Tofu with Vegetables', ingredients: [{ item: 'Tofu', qty: 200, unit: 'g' }, { item: 'Bell Pepper', qty: 1, unit: 'pcs' }, { item: 'Snap Peas', qty: 100, unit: 'g' }, { item: 'Soy Sauce', qty: 2, unit: 'tbsp' }, { item: 'Garlic', qty: 3, unit: 'pcs' }, { item: 'Rice', qty: 150, unit: 'g' }], macros: { cal: 380, protein: 22, carbs: 42, fat: 12 }, steps: ['Press and cube tofu. Pan-fry until golden.', 'Stir-fry sliced bell pepper and snap peas.', 'Add garlic, soy sauce, and sesame oil.', 'Combine with tofu.', 'Serve over steamed rice.'], time: 20 },
        ],
        snack: [
            { name: 'Edamame', ingredients: [{ item: 'Edamame', qty: 200, unit: 'g' }, { item: 'Salt', qty: 1, unit: 'tsp' }], macros: { cal: 120, protein: 11, carbs: 9, fat: 5 }, steps: ['Boil edamame for 5 minutes.', 'Drain and sprinkle with sea salt.'], time: 5 },
        ],
    },
}

const DEFAULT_MEALS = {
    breakfast: [
        { name: 'Oatmeal Power Bowl', ingredients: [{ item: 'Oats', qty: 100, unit: 'g' }, { item: 'Banana', qty: 1, unit: 'pcs' }, { item: 'Peanut Butter', qty: 2, unit: 'tbsp' }, { item: 'Honey', qty: 1, unit: 'tbsp' }, { item: 'Milk', qty: 200, unit: 'ml' }], macros: { cal: 350, protein: 12, carbs: 50, fat: 12 }, steps: ['Cook oats with milk.', 'Slice banana.', 'Top with peanut butter and honey.'], time: 10 },
    ],
    lunch: [
        { name: 'Grilled Chicken Salad', ingredients: [{ item: 'Chicken Breast', qty: 200, unit: 'g' }, { item: 'Lettuce', qty: 100, unit: 'g' }, { item: 'Tomato', qty: 1, unit: 'pcs' }, { item: 'Cucumber', qty: 1, unit: 'pcs' }, { item: 'Olive Oil', qty: 1, unit: 'tbsp' }], macros: { cal: 380, protein: 35, carbs: 12, fat: 20 }, steps: ['Grill seasoned chicken breast.', 'Chop vegetables.', 'Combine and dress with olive oil and lemon.'], time: 20 },
    ],
    dinner: [
        { name: 'Salmon with Vegetables', ingredients: [{ item: 'Salmon', qty: 200, unit: 'g' }, { item: 'Sweet Potato', qty: 200, unit: 'g' }, { item: 'Broccoli', qty: 100, unit: 'g' }, { item: 'Lemon', qty: 1, unit: 'pcs' }, { item: 'Olive Oil', qty: 1, unit: 'tbsp' }], macros: { cal: 420, protein: 32, carbs: 28, fat: 18 }, steps: ['Season salmon with lemon and herbs.', 'Cube sweet potato, toss with oil.', 'Bake everything at 200°C for 20 min.'], time: 25 },
    ],
    snack: [
        { name: 'Trail Mix', ingredients: [{ item: 'Almonds', qty: 50, unit: 'g' }, { item: 'Berries', qty: 30, unit: 'g' }, { item: 'Dark Chocolate', qty: 20, unit: 'g' }, { item: 'Pumpkin Seeds', qty: 20, unit: 'g' }], macros: { cal: 200, protein: 6, carbs: 20, fat: 12 }, steps: ['Mix all ingredients.', 'Portion into servings.'], time: 2 },
    ],
}

export default function NutritionPage() {
    const navigate = useNavigate()
    const { state } = useUser()
    const { profile } = state

    const [activeTab, setActiveTab] = useState('meals')
    const [pantry, setPantry] = useState([]) // { name, qty, unit }
    const [newItem, setNewItem] = useState('')
    const [newQty, setNewQty] = useState(1)
    const [newUnit, setNewUnit] = useState('pcs')
    const [suggestions, setSuggestions] = useState([])
    const [cookingMeal, setCookingMeal] = useState(null)
    const [cookingStep, setCookingStep] = useState(0)
    const [shoppingList, setShoppingList] = useState([])

    // Load pantry from IndexedDB
    useEffect(() => {
        getSetting('pantry').then((data) => {
            if (data) setPantry(data)
        })
        getSetting('shoppingList').then((data) => {
            if (data) setShoppingList(data)
        })
    }, [])

    // Save pantry
    function savePantry(updated) {
        setPantry(updated)
        saveSetting('pantry', updated)
    }

    // Autocomplete suggestions
    function handleItemInput(val) {
        setNewItem(val)
        if (val.length >= 2) {
            const matches = INGREDIENT_SUGGESTIONS.filter(s =>
                s.toLowerCase().includes(val.toLowerCase()) &&
                !pantry.find(p => p.name.toLowerCase() === s.toLowerCase())
            ).slice(0, 6)
            setSuggestions(matches)
        } else {
            setSuggestions([])
        }
    }

    function addPantryItem(itemName) {
        const name = (itemName || newItem).trim()
        if (!name) return
        // Check if already exists
        const existingIdx = pantry.findIndex(p => p.name.toLowerCase() === name.toLowerCase())
        if (existingIdx >= 0) {
            const updated = [...pantry]
            updated[existingIdx].qty += newQty
            savePantry(updated)
        } else {
            savePantry([...pantry, { name, qty: newQty, unit: newUnit }])
        }
        setNewItem('')
        setNewQty(1)
        setSuggestions([])
    }

    function removePantryItem(idx) {
        savePantry(pantry.filter((_, i) => i !== idx))
    }

    function updatePantryQty(idx, newQtyVal) {
        const updated = [...pantry]
        updated[idx].qty = Math.max(0, newQtyVal)
        if (updated[idx].qty <= 0) {
            updated.splice(idx, 1)
        }
        savePantry(updated)
    }

    // Get meals for user's cuisine
    function getMeals() {
        const cuisine = profile.cuisine || 'western'
        return CUISINE_MEALS[cuisine] || DEFAULT_MEALS
    }

    // Start cooking
    function startCooking(meal) {
        setCookingMeal(meal)
        setCookingStep(0)
    }

    // Done cooking — deduct ingredients from pantry
    function finishCooking() {
        if (!cookingMeal) return
        const updated = [...pantry]
        for (const ing of cookingMeal.ingredients) {
            const idx = updated.findIndex(p => p.name.toLowerCase() === ing.item.toLowerCase())
            if (idx >= 0) {
                updated[idx].qty = Math.max(0, updated[idx].qty - ing.qty)
                if (updated[idx].qty <= 0) updated.splice(idx, 1)
            }
        }
        savePantry(updated)
        setCookingMeal(null)
    }

    // Substitute ingredient
    function substituteIngredient(ingredientIdx) {
        if (!cookingMeal) return
        const ingredient = cookingMeal.ingredients[ingredientIdx]
        const substitutions = {
            'onion': 'Shallots', 'tomato': 'Canned Tomatoes', 'chicken': 'Tofu', 'paneer': 'Tofu',
            'rice': 'Quinoa', 'butter': 'Olive Oil', 'cream': 'Coconut Milk', 'milk': 'Almond Milk',
        }
        const lower = ingredient.item.toLowerCase()
        let sub = null
        for (const [key, val] of Object.entries(substitutions)) {
            if (lower.includes(key)) { sub = val; break }
        }
        if (!sub) sub = 'Skip'
        const updated = { ...cookingMeal, ingredients: [...cookingMeal.ingredients] }
        updated.ingredients[ingredientIdx] = { ...ingredient, item: `${sub} (was: ${ingredient.item})` }
        setCookingMeal(updated)
    }

    // Smart shopping list — only add items NOT in pantry
    function addMealToShoppingList(meal) {
        const pantryNames = pantry.map(p => p.name.toLowerCase())
        const missing = meal.ingredients.filter(ing =>
            !pantryNames.includes(ing.item.toLowerCase())
        ).map(ing => `${ing.item} (${ing.qty} ${ing.unit})`)
        const updated = [...new Set([...shoppingList, ...missing])]
        setShoppingList(updated)
        saveSetting('shoppingList', updated)
    }

    function removeFromShoppingList(idx) {
        const updated = shoppingList.filter((_, i) => i !== idx)
        setShoppingList(updated)
        saveSetting('shoppingList', updated)
    }

    const meals = getMeals()

    // === COOKING MODE ===
    if (cookingMeal) {
        const totalSteps = cookingMeal.steps.length

        return (
            <div className="nutrition-page">
                <div className="bg-gradient-mesh" />
                <button className="btn btn-ghost" onClick={() => setCookingMeal(null)} style={{ marginBottom: 'var(--space-4)' }}>← Back to Meals</button>
                <h2 className="step-title">{cookingMeal.name}</h2>
                <div className="cooking-macros">
                    <span className="macro-chip cal">{cookingMeal.macros.cal} cal</span>
                    <span className="macro-chip protein">{cookingMeal.macros.protein}g protein</span>
                    <span className="macro-chip carbs">{cookingMeal.macros.carbs}g carbs</span>
                    <span className="macro-chip fat">{cookingMeal.macros.fat}g fat</span>
                </div>

                <div className="cooking-section">
                    <h3 className="cooking-section-title">Ingredients</h3>
                    <div className="cooking-ingredients">
                        {cookingMeal.ingredients.map((ing, i) => {
                            const inPantry = pantry.find(p => p.name.toLowerCase() === ing.item.toLowerCase())
                            return (
                                <div key={i} className={`cooking-ingredient ${inPantry ? 'in-pantry' : 'missing'}`}>
                                    <div className="cooking-ing-info">
                                        <span className={`cooking-ing-dot ${inPantry ? 'available' : 'needed'}`} />
                                        <span>{ing.item}</span>
                                        <span className="cooking-ing-qty">{ing.qty} {ing.unit}</span>
                                    </div>
                                    <button className="btn btn-ghost" style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-2)' }} onClick={() => substituteIngredient(i)}>Swap</button>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="cooking-section">
                    <h3 className="cooking-section-title">Step {cookingStep + 1} of {totalSteps}</h3>
                    <div className="progress-bar" style={{ marginBottom: 'var(--space-4)' }}>
                        <div className="progress-bar-fill" style={{ width: `${((cookingStep + 1) / totalSteps) * 100}%` }} />
                    </div>
                    <div className="cooking-step-card glass-card">
                        <p className="cooking-step-text">{cookingMeal.steps[cookingStep]}</p>
                    </div>
                    <div className="cooking-nav">
                        <button className="btn btn-secondary" disabled={cookingStep === 0} onClick={() => setCookingStep((s) => s - 1)}>← Prev</button>
                        {cookingStep < totalSteps - 1 ? (
                            <button className="btn btn-primary" onClick={() => setCookingStep((s) => s + 1)}>Next Step →</button>
                        ) : (
                            <button className="btn btn-accent" onClick={finishCooking}>Done Cooking!</button>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // === MAIN NUTRITION PAGE ===
    return (
        <div className="nutrition-page">
            <div className="bg-gradient-mesh" />
            <button className="btn btn-ghost" onClick={() => navigate('/dashboard')} style={{ marginBottom: 'var(--space-4)' }}>← Dashboard</button>
            <h2 className="step-title">Nutrition</h2>
            <p className="step-subtitle">Meals built for your {profile.cuisine || 'preferred'} cuisine, your kitchen, and your training.</p>

            <div className="nutrition-tabs">
                {['meals', 'pantry', 'shopping'].map((tab) => (
                    <button key={tab} className={`nutrition-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                        {tab === 'meals' ? 'Meals' : tab === 'pantry' ? 'Pantry' : 'Shopping'}
                    </button>
                ))}
            </div>

            {/* MEALS TAB */}
            {activeTab === 'meals' && (
                <div className="nutrition-content stagger-children">
                    {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => {
                        const typeMeals = meals[type] || DEFAULT_MEALS[type] || []
                        return (
                            <div key={type} className="meal-section">
                                <div className="meal-section-header">
                                    <img src={MEAL_IMAGES[type]} className="meal-section-img" alt={type} />
                                    <h3 className="meal-section-title">{type.charAt(0).toUpperCase() + type.slice(1)}</h3>
                                </div>
                                <div className="meal-cards">
                                    {typeMeals.map((meal, i) => (
                                        <div key={i} className="meal-card glass-card">
                                            <div className="meal-card-header">
                                                <div className="meal-name">{meal.name}</div>
                                                <span className="meal-time">{meal.time} min</span>
                                            </div>
                                            <div className="meal-macros">
                                                <span className="macro-chip cal">{meal.macros.cal} cal</span>
                                                <span className="macro-chip protein">{meal.macros.protein}g P</span>
                                                <span className="macro-chip carbs">{meal.macros.carbs}g C</span>
                                                <span className="macro-chip fat">{meal.macros.fat}g F</span>
                                            </div>
                                            <div className="meal-ingredients">
                                                {meal.ingredients.slice(0, 4).map(i => i.item).join(' · ')}
                                                {meal.ingredients.length > 4 && ` +${meal.ingredients.length - 4} more`}
                                            </div>
                                            <div className="meal-actions">
                                                <button className="btn btn-primary" onClick={() => startCooking(meal)}>Cook Now</button>
                                                <button className="btn btn-ghost" onClick={() => addMealToShoppingList(meal)}>+ Shopping List</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* PANTRY TAB */}
            {activeTab === 'pantry' && (
                <div className="nutrition-content">
                    <div className="pantry-add">
                        <div className="pantry-input-row">
                            <div className="pantry-input-group">
                                <input
                                    className="input-field"
                                    placeholder="Add ingredient..."
                                    value={newItem}
                                    onChange={(e) => handleItemInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addPantryItem()}
                                />
                                {suggestions.length > 0 && (
                                    <div className="pantry-suggestions">
                                        {suggestions.map((s, i) => (
                                            <button key={i} className="pantry-suggestion" onClick={() => { setNewItem(s); setSuggestions([]); addPantryItem(s) }}>{s}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <input className="input-field pantry-qty-input" type="number" min="0.5" step="0.5" value={newQty} onChange={(e) => setNewQty(parseFloat(e.target.value) || 1)} />
                            <select className="select-field pantry-unit-select" value={newUnit} onChange={(e) => setNewUnit(e.target.value)}>
                                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                            <button className="btn btn-primary" onClick={() => addPantryItem()}>Add</button>
                        </div>
                    </div>
                    {pantry.length === 0 ? (
                        <div className="pantry-empty glass-card">
                            <p>Your pantry is empty. Add ingredients you have at home.</p>
                        </div>
                    ) : (
                        <div className="pantry-list">
                            {pantry.map((item, i) => (
                                <div key={i} className="pantry-item glass-card">
                                    <span className="pantry-item-name">{item.name}</span>
                                    <div className="pantry-item-controls">
                                        <button className="btn btn-ghost" onClick={() => updatePantryQty(i, item.qty - 1)}>−</button>
                                        <span className="pantry-item-qty">{item.qty} {item.unit}</span>
                                        <button className="btn btn-ghost" onClick={() => updatePantryQty(i, item.qty + 1)}>+</button>
                                        <button className="btn btn-ghost" onClick={() => removePantryItem(i)} style={{ color: 'var(--color-coral)' }}>✕</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* SHOPPING TAB */}
            {activeTab === 'shopping' && (
                <div className="nutrition-content">
                    {shoppingList.length === 0 ? (
                        <div className="pantry-empty glass-card">
                            <p>Shopping list is empty. Add items from meal plans — only missing ingredients will be added.</p>
                        </div>
                    ) : (
                        <div className="shopping-list">
                            {shoppingList.map((item, i) => (
                                <div key={i} className="shopping-item glass-card">
                                    <label className="shopping-label">
                                        <input type="checkbox" onChange={() => removeFromShoppingList(i)} />
                                        <span>{item}</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
