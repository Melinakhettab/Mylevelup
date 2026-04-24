import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNutritionStore } from '../store/nutritionStore'
import {
  getCurrentNutrition,
  generateNutrition,
  type NutritionDay,
  type ShoppingItem,
} from '../services/nutrition.service'
import styles from './Nutrition.module.css'

const DAYS = [
  { day: 1, short: 'Lun' },
  { day: 2, short: 'Mar' },
  { day: 3, short: 'Mer' },
  { day: 4, short: 'Jeu' },
  { day: 5, short: 'Ven' },
  { day: 6, short: 'Sam' },
  { day: 7, short: 'Dim' },
]

const MACRO_COLORS = {
  proteins: '#22c55e',
  carbs: '#3b82f6',
  fats: '#f97316',
}

function MealCard({ meal }: { meal: NutritionDay['meals'][0] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={styles.mealCard}>
      <button
        className={styles.mealHeader}
        onClick={() => setOpen(!open)}
        type="button"
      >
        <div className={styles.mealInfo}>
          <span className={styles.mealName}>{meal.name}</span>
          <span className={styles.mealCalories}>{meal.calories} kcal</span>
        </div>
        <div className={styles.mealMacros}>
          <span className={styles.macroBadge} style={{ color: MACRO_COLORS.proteins }}>
            P {meal.proteins}g
          </span>
          <span className={styles.macroBadge} style={{ color: MACRO_COLORS.carbs }}>
            G {meal.carbs}g
          </span>
          <span className={styles.macroBadge} style={{ color: MACRO_COLORS.fats }}>
            L {meal.fats}g
          </span>
        </div>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open && (
        <div className={styles.mealFoods}>
          {meal.foods.map((food, i) => (
            <div key={i} className={styles.foodItem}>
              <span className={styles.foodDot} />
              <span className={styles.foodText}>{food}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DayPlanView({ dayData }: { dayData: NutritionDay }) {
  return (
    <div className={styles.dayContent}>
      <div className={styles.dayCaloriesBanner}>
        <span className={styles.dayCaloriesValue}>{dayData.calories}</span>
        <span className={styles.dayCaloriesLabel}>kcal / jour</span>
      </div>
      <div className={styles.mealList}>
        {dayData.meals.map((meal, i) => (
          <MealCard key={i} meal={meal} />
        ))}
      </div>
    </div>
  )
}

function ShoppingListView({ items }: { items: ShoppingItem[] }) {
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  return (
    <div className={styles.shoppingList}>
      {items.map((group) => (
        <div key={group.category} className={styles.shoppingGroup}>
          <h3 className={styles.shoppingCategory}>{group.category}</h3>
          {group.items.map((item) => {
            const key = `${group.category}__${item}`
            const isChecked = checked.has(key)
            return (
              <label key={key} className={`${styles.shoppingItem} ${isChecked ? styles.shoppingItemChecked : ''}`}>
                <input
                  type="checkbox"
                  className={styles.shoppingCheckbox}
                  checked={isChecked}
                  onChange={() => toggle(key)}
                />
                <span className={styles.shoppingItemText}>{item}</span>
              </label>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function GeneratingState() {
  return (
    <div className={styles.generating}>
      <div className={styles.genPulse}>
        <span className={styles.genIcon}>🥗</span>
      </div>
      <h2 className={styles.genTitle}>Génération en cours…</h2>
      <p className={styles.genSub}>
        Notre IA crée ton plan nutritionnel personnalisé sur 7 jours.
      </p>
      <div className={styles.genBar}>
        <div className={styles.genBarFill} />
      </div>
    </div>
  )
}

function EmptyState({ onGenerate, loading }: { onGenerate: () => void; loading: boolean }) {
  return (
    <div className={styles.empty}>
      <span className={styles.emptyIcon}>🥗</span>
      <h2 className={styles.emptyTitle}>Aucun plan nutritionnel</h2>
      <p className={styles.emptySub}>
        Génère ton premier plan nutritionnel personnalisé par notre IA, avec liste de courses incluse.
      </p>
      <button className={styles.generateBtn} onClick={onGenerate} disabled={loading}>
        {loading ? <span className={styles.spinner} /> : 'Générer mon plan nutritionnel'}
      </button>
    </div>
  )
}

export default function Nutrition() {
  const navigate = useNavigate()
  const {
    nutrition,
    selectedDay,
    activeTab,
    loading,
    error,
    setNutrition,
    setSelectedDay,
    setActiveTab,
    setLoading,
    setError,
  } = useNutritionStore()

  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getCurrentNutrition()
      .then((data) => {
        if (!cancelled) setNutrition(data)
      })
      .catch(() => {
        if (!cancelled) setError('Impossible de charger le plan nutritionnel')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [setNutrition, setLoading, setError])

  const handleGenerate = async () => {
    setGenerating(true)
    setError('')
    try {
      const data = await generateNutrition()
      setNutrition(data)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Erreur lors de la génération'
      setError(msg)
    } finally {
      setGenerating(false)
    }
  }

  const currentDayData = nutrition?.plan.find((d) => d.day === selectedDay)

  return (
    <main className={styles.page}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.topBar}>
          <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Dashboard
          </button>
          <span className={styles.pageTitle}>Plan Nutritionnel</span>
          {nutrition && (
            <button
              className={styles.regenBtn}
              onClick={handleGenerate}
              disabled={generating}
              title="Régénérer"
            >
              🔄
            </button>
          )}
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {generating ? (
          <GeneratingState />
        ) : loading ? (
          <div className={styles.loadingWrap}><span className={styles.spinner} /></div>
        ) : !nutrition ? (
          <EmptyState onGenerate={handleGenerate} loading={generating} />
        ) : (
          <>
            <div className={styles.summaryRow}>
              <div className={styles.summaryCard}>
                <span className={styles.summaryValue}>{Math.round(nutrition.weeklyCalories / 7)}</span>
                <span className={styles.summaryLabel}>kcal / jour moy.</span>
              </div>
              <div className={styles.summaryCard}>
                <span className={styles.summaryValue}>{Math.round(nutrition.weeklyProteins / 7)}</span>
                <span className={styles.summaryLabel}>protéines g / jour</span>
              </div>
            </div>

            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === 'plan' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('plan')}
              >
                Plan 7 jours
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'shopping' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('shopping')}
              >
                Liste de courses
              </button>
            </div>

            {activeTab === 'plan' && (
              <>
                <div className={styles.dayTabs}>
                  {DAYS.map(({ day, short }) => {
                    const dayData = nutrition.plan.find((d) => d.day === day)
                    const isActive = selectedDay === day
                    return (
                      <button
                        key={day}
                        className={`${styles.dayTab} ${isActive ? styles.dayTabActive : ''}`}
                        onClick={() => setSelectedDay(day)}
                      >
                        <span className={styles.dayTabLabel}>{short}</span>
                        <span className={styles.dayTabCal}>
                          {dayData ? `${Math.round(dayData.calories / 100) * 100}` : '--'}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {currentDayData && (
                  <div className={styles.dayPanel} key={selectedDay}>
                    <DayPlanView dayData={currentDayData} />
                  </div>
                )}
              </>
            )}

            {activeTab === 'shopping' && (
              <ShoppingListView items={nutrition.shoppingList} />
            )}
          </>
        )}
      </div>
    </main>
  )
}
