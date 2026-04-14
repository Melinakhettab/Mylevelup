export interface Meal {
  name: string
  calories: number
  proteins: number
  carbs: number
  fats: number
  ingredients: string[]
}

export interface DayMeals {
  day: number
  breakfast: Meal
  lunch: Meal
  snack?: Meal
  dinner: Meal
  totalCalories: number
}

export interface MealPlan {
  days: DayMeals[]
}

export interface GroceryItem {
  name: string
  quantity: string
  category: string
}

export interface GroceryList {
  items: GroceryItem[]
}
