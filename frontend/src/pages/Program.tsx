import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgramStore } from '../store/programStore'
import { useSessionStore } from '../store/sessionStore'
import { getCurrentProgram, generateProgram, type WorkoutDay, type Exercise } from '../services/program.service'
import { completeSession } from '../services/session.service'
import styles from './Program.module.css'

// ─── Day tabs ────────────────────────────────────────────────────────────────

const DAYS = [
  { day: 1, short: 'Lun' },
  { day: 2, short: 'Mar' },
  { day: 3, short: 'Mer' },
  { day: 4, short: 'Jeu' },
  { day: 5, short: 'Ven' },
  { day: 6, short: 'Sam' },
  { day: 7, short: 'Dim' },
]

const TYPE_ICONS: Record<string, string> = {
  musculation: '🏋️',
  cardio: '🏃',
  hiit: '⚡',
  mobilite: '🧘',
  repos: '😴',
}

const TYPE_LABELS: Record<string, string> = {
  musculation: 'Musculation',
  cardio: 'Cardio',
  hiit: 'HIIT',
  mobilite: 'Mobilité',
  repos: 'Repos',
}

const DIFF_COLORS: Record<string, string> = {
  facile: '#22c55e',
  moyen: '#FFD600',
  difficile: '#ff4444',
}

// ─── Exercise card ───────────────────────────────────────────────────────────

function ExerciseCard({ exercise, index }: { exercise: Exercise; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={styles.exerciseCard}>
      <button
        className={styles.exerciseHeader}
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span className={styles.exerciseIndex}>{index + 1}</span>
        <div className={styles.exerciseInfo}>
          <span className={styles.exerciseName}>{exercise.name}</span>
          <span className={styles.exerciseMeta}>
            {exercise.sets} × {exercise.reps} reps
          </span>
        </div>
        <span
          className={styles.diffBadge}
          style={{ color: DIFF_COLORS[exercise.difficulty], borderColor: DIFF_COLORS[exercise.difficulty] }}
        >
          {exercise.difficulty}
        </span>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>

      {open && (
        <div className={styles.exerciseDetail}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Séries</span>
            <span className={styles.detailValue}>{exercise.sets}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Répétitions</span>
            <span className={styles.detailValue}>{exercise.reps}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Repos</span>
            <span className={styles.detailValue}>{exercise.rest}s</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Difficulté</span>
            <span className={styles.detailValue} style={{ color: DIFF_COLORS[exercise.difficulty] }}>
              {exercise.difficulty}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Rest day view ───────────────────────────────────────────────────────────

function RestDay() {
  return (
    <div className={styles.restDay}>
      <span className={styles.restIcon}>😴</span>
      <h3 className={styles.restTitle}>Jour de repos</h3>
      <p className={styles.restSub}>
        Ton corps récupère et se renforce. Profite pour t'hydrater,
        bien manger et dormir suffisamment.
      </p>
    </div>
  )
}

// ─── Day workout view ────────────────────────────────────────────────────────

interface DayViewProps {
  workout: WorkoutDay
  programId: number
  isCompleted: boolean
  onComplete: (dayNumber: number) => Promise<void>
}

function DayView({ workout, programId: _programId, isCompleted, onComplete }: DayViewProps) {
  const [validating, setValidating] = useState(false)

  if (workout.type === 'repos') return <RestDay />

  const handleValidate = async () => {
    setValidating(true)
    try {
      await onComplete(workout.day)
    } finally {
      setValidating(false)
    }
  }

  return (
    <div className={styles.dayContent}>
      {/* Day header */}
      <div className={styles.dayHeader}>
        <div className={styles.dayType}>
          <span className={styles.dayTypeIcon}>{TYPE_ICONS[workout.type]}</span>
          <span className={styles.dayTypeLabel}>{TYPE_LABELS[workout.type]}</span>
        </div>
        <div className={styles.dayMeta}>
          <span className={styles.dayFocus}>{workout.focus}</span>
          <span className={styles.dayDuration}>⏱ {workout.duration} min</span>
        </div>
      </div>

      {/* Stats row */}
      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{workout.exercises.length}</span>
          <span className={styles.statLabel}>Exercices</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {workout.exercises.reduce((sum, e) => sum + e.sets, 0)}
          </span>
          <span className={styles.statLabel}>Séries total</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{workout.duration}′</span>
          <span className={styles.statLabel}>Durée</span>
        </div>
      </div>

      {/* Exercises list */}
      <div className={styles.exerciseList}>
        {workout.exercises.map((ex, i) => (
          <ExerciseCard key={i} exercise={ex} index={i} />
        ))}
      </div>

      {/* Validate button */}
      <button
        className={`${styles.validateBtn} ${isCompleted ? styles.validateBtnDone : ''}`}
        onClick={handleValidate}
        disabled={isCompleted || validating}
        type="button"
      >
        {validating ? (
          <span className={styles.spinner} />
        ) : isCompleted ? (
          'Séance validée ✓'
        ) : (
          'Valider la séance ✓'
        )}
      </button>
    </div>
  )
}

// ─── Loading skeleton ────────────────────────────────────────────────────────

function GeneratingState() {
  return (
    <div className={styles.generating}>
      <div className={styles.genPulse}>
        <span className={styles.genIcon}>🤖</span>
      </div>
      <h2 className={styles.genTitle}>Génération en cours…</h2>
      <p className={styles.genSub}>
        Notre IA analyse ton profil et crée un programme sur mesure.
      </p>
      <div className={styles.genBar}>
        <div className={styles.genBarFill} />
      </div>
    </div>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ onGenerate, loading }: { onGenerate: () => void; loading: boolean }) {
  return (
    <div className={styles.empty}>
      <span className={styles.emptyIcon}>💪</span>
      <h2 className={styles.emptyTitle}>Aucun programme actif</h2>
      <p className={styles.emptySub}>
        Génère ton premier programme d'entraînement personnalisé par notre IA.
      </p>
      <button className={styles.generateBtn} onClick={onGenerate} disabled={loading}>
        {loading ? <span className={styles.spinner} /> : 'Générer mon programme'}
      </button>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function Program() {
  const navigate = useNavigate()
  const {
    program,
    selectedDay,
    loading,
    error,
    setProgram,
    setSelectedDay,
    setLoading,
    setError,
  } = useProgramStore()

  const { completedDays, setPoints, markDayCompleted } = useSessionStore()
  const [generating, setGenerating] = useState(false)

  // Load current program on mount
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getCurrentProgram()
      .then((data) => {
        if (!cancelled) setProgram(data)
      })
      .catch(() => {
        if (!cancelled) setError('Impossible de charger le programme')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [setProgram, setLoading, setError])

  const handleGenerate = async () => {
    setGenerating(true)
    setError('')
    try {
      const data = await generateProgram()
      setProgram(data)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Erreur lors de la génération'
      setError(msg)
    } finally {
      setGenerating(false)
    }
  }

  const handleCompleteSession = async (dayNumber: number) => {
    if (!program) return
    try {
      const result = await completeSession({ programId: program.id, dayNumber })
      markDayCompleted(dayNumber)
      setPoints(result.points, result.streak)
    } catch {
      setError('Erreur lors de la validation de la séance')
    }
  }

  const currentWorkout = program?.program.find((d) => d.day === selectedDay)

  return (
    <main className={styles.page}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.topBar}>
          <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Dashboard
          </button>
          <span className={styles.pageTitle}>Mon Programme</span>
          {program && (
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

        {/* Error */}
        {error && <div className={styles.errorBanner}>{error}</div>}

        {/* States */}
        {generating ? (
          <GeneratingState />
        ) : loading ? (
          <div className={styles.loadingWrap}><span className={styles.spinner} /></div>
        ) : !program ? (
          <EmptyState onGenerate={handleGenerate} loading={generating} />
        ) : (
          <>
            {/* Day selector */}
            <div className={styles.dayTabs}>
              {DAYS.map(({ day, short }) => {
                const workout = program.program.find((d) => d.day === day)
                const isRest = workout?.type === 'repos'
                const isActive = selectedDay === day

                return (
                  <button
                    key={day}
                    className={`${styles.dayTab} ${isActive ? styles.dayTabActive : ''} ${isRest ? styles.dayTabRest : ''}`}
                    onClick={() => setSelectedDay(day)}
                  >
                    <span className={styles.dayTabLabel}>{short}</span>
                    <span className={styles.dayTabDot}>
                      {isRest ? '·' : TYPE_ICONS[workout?.type || 'musculation']}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Day content */}
            {currentWorkout && (
              <div className={styles.dayPanel} key={selectedDay}>
                <DayView
                  workout={currentWorkout}
                  programId={program!.id}
                  isCompleted={completedDays.includes(currentWorkout.day)}
                  onComplete={handleCompleteSession}
                />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
