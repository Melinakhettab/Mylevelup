import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { getProfile, type Profile } from '../services/profile.service'
import { getCurrentProgram, generateProgram, type ProgramData } from '../services/program.service'
import { getCurrentNutrition, type NutritionData } from '../services/nutrition.service'
import { getPoints } from '../services/session.service'
import { useProgramStore } from '../store/programStore'
import { useSessionStore } from '../store/sessionStore'
import styles from './Dashboard.module.css'

const objectiveLabels: Record<string, string> = {
  perte_poids: 'Perte de poids',
  prise_masse: 'Prise de masse',
  forme: 'Remise en forme',
  remise_en_forme: 'Remise en forme',
  maintien: 'Maintien',
  performance: 'Performance',
}

const levelLabels: Record<string, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
}

export default function Dashboard() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const setProgram = useProgramStore((s) => s.setProgram)
  const { points, streak, setPoints } = useSessionStore()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [program, setProgramLocal] = useState<ProgramData | null>(null)
  const [nutrition, setNutritionLocal] = useState<NutritionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([
      getProfile().catch(() => null),
      getCurrentProgram().catch(() => null),
      getPoints().catch(() => null),
      getCurrentNutrition().catch(() => null),
    ]).then(([p, prog, pts, nutr]) => {
      if (cancelled) return
      setProfile(p)
      setProgramLocal(prog)
      if (prog) setProgram(prog)
      if (pts) setPoints(pts.total, pts.streak)
      setNutritionLocal(nutr)
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [setProgram, setPoints])

  const handleGenerate = async () => {
    setGenerating(true)
    setError('')
    try {
      const data = await generateProgram()
      setProgramLocal(data)
      setProgram(data)
      navigate('/program')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Erreur lors de la génération'
      setError(msg)
    } finally {
      setGenerating(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const name = profile?.firstName || 'Champion'

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.grid} aria-hidden="true" />
        <div className={styles.loadingWrap}><span className={styles.spinner} /></div>
      </main>
    )
  }

  // Count training days
  const trainingDays = program?.program
    ? (program.program as Array<{ type: string }>).filter((d) => d.type !== 'repos').length
    : 0

  return (
    <main className={styles.page}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <svg width="28" height="28" viewBox="0 0 56 56" fill="none">
              <rect x="1" y="24" width="10" height="8" rx="2" fill="#FFD600" />
              <rect x="4" y="21" width="4" height="14" rx="1.5" fill="#FFD600" />
              <rect x="11" y="27" width="34" height="2" rx="1" fill="#FFD600" />
              <rect x="45" y="24" width="10" height="8" rx="2" fill="#FFD600" />
              <rect x="48" y="21" width="4" height="14" rx="1.5" fill="#FFD600" />
              <path d="M28 22c0 0-8-5.5-8 2.5C20 32 28 38 28 38s8-6 8-13.5C36 16.5 28 22 28 22z" fill="#FFD600" opacity="0.95" />
              <polyline points="14,28 18,28 20,22 22,34 24,26 26,30 28,28 42,28" fill="none" stroke="#0d0d0d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={styles.logoText}>MY LEVELUP</span>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>Déconnexion</button>
        </div>

        {/* Welcome */}
        <div className={styles.welcome}>
          <h1 className={styles.welcomeTitle}>
            Salut, <span className={styles.accent}>{name}</span> 👋
          </h1>
          <p className={styles.welcomeSub}>
            {program ? 'Ton programme est prêt. Let\'s go !' : 'Prêt à commencer ton entraînement ?'}
          </p>
        </div>

        {/* Error */}
        {error && <div className={styles.errorBanner}>{error}</div>}

        {/* Profile summary */}
        {profile && (
          <div className={styles.profileGrid}>
            <div className={styles.profileCard}>
              <span className={styles.profileIcon}>🎯</span>
              <div>
                <p className={styles.profileLabel}>Objectif</p>
                <p className={styles.profileValue}>{objectiveLabels[profile.goal] || profile.goal}</p>
              </div>
            </div>
            <div className={styles.profileCard}>
              <span className={styles.profileIcon}>📊</span>
              <div>
                <p className={styles.profileLabel}>Niveau</p>
                <p className={styles.profileValue}>{levelLabels[profile.fitnessLevel] || profile.fitnessLevel}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats: points & streak */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>⚡</span>
            <p className={styles.statLabel}>Points</p>
            <p className={styles.statValue}>{points}</p>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>🔥</span>
            <p className={styles.statLabel}>Streak</p>
            <p className={styles.statValue}>{streak} jour{streak !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Program card */}
        {program ? (
          <button className={styles.programCard} onClick={() => navigate('/program')}>
            <div className={styles.programHeader}>
              <span className={styles.programIcon}>📋</span>
              <div>
                <h2 className={styles.programTitle}>Programme de la semaine</h2>
                <p className={styles.programMeta}>
                  {trainingDays} séances · {7 - trainingDays} repos
                </p>
              </div>
            </div>
            <div className={styles.programPreview}>
              {(program.program as Array<{ day: number; type: string; dayName: string }>).map((d) => (
                <div
                  key={d.day}
                  className={`${styles.previewDot} ${d.type !== 'repos' ? styles.previewDotActive : ''}`}
                  title={d.dayName}
                >
                  {d.type === 'repos' ? '·' : '●'}
                </div>
              ))}
            </div>
            <span className={styles.programCta}>Voir le programme →</span>
          </button>
        ) : (
          <div className={styles.generateCard}>
            <span className={styles.generateIcon}>💪</span>
            <h2 className={styles.generateTitle}>Génère ton programme</h2>
            <p className={styles.generateSub}>
              Notre IA va créer un programme hebdomadaire adapté à ton profil.
            </p>
            <button
              className={styles.generateBtn}
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? <span className={styles.spinner} /> : 'Générer mon programme'}
            </button>
          </div>
        )}

        {/* Nutrition card */}
        {nutrition ? (
          <button className={styles.nutritionCard} onClick={() => navigate('/nutrition')}>
            <div className={styles.programHeader}>
              <span className={styles.programIcon}>🥗</span>
              <div>
                <h2 className={styles.programTitle}>Plan nutritionnel</h2>
                <p className={styles.programMeta}>
                  {Math.round(nutrition.weeklyCalories / 7)} kcal / jour · 7 jours
                </p>
              </div>
            </div>
            <span className={styles.programCta}>Voir le plan →</span>
          </button>
        ) : (
          <button className={styles.nutritionCard} onClick={() => navigate('/nutrition')}>
            <div className={styles.programHeader}>
              <span className={styles.programIcon}>🥗</span>
              <div>
                <h2 className={styles.programTitle}>Plan nutritionnel</h2>
                <p className={styles.programMeta}>Aucun plan actif</p>
              </div>
            </div>
            <span className={styles.programCta}>Générer un plan →</span>
          </button>
        )}
      </div>
    </main>
  )
}
