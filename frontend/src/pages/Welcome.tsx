import { useNavigate } from 'react-router-dom'
import styles from './Welcome.module.css'

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <main className={styles.page}>
      {/* Background grid */}
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.content}>
        {/* Logo */}
        <div className={styles.logo}>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-label="My LevelUp logo">
            {/* Dumbbell left */}
            <rect x="1" y="24" width="10" height="8" rx="2" fill="#FFD600" />
            <rect x="4" y="21" width="4" height="14" rx="1.5" fill="#FFD600" />
            {/* Bar */}
            <rect x="11" y="27" width="34" height="2" rx="1" fill="#FFD600" />
            {/* Dumbbell right */}
            <rect x="45" y="24" width="10" height="8" rx="2" fill="#FFD600" />
            <rect x="48" y="21" width="4" height="14" rx="1.5" fill="#FFD600" />
            {/* Heart */}
            <path
              d="M28 22c0 0-8-5.5-8 2.5C20 32 28 38 28 38s8-6 8-13.5C36 16.5 28 22 28 22z"
              fill="#FFD600"
              opacity="0.95"
            />
            {/* EKG pulse */}
            <polyline
              points="14,28 18,28 20,22 22,34 24,26 26,30 28,28 42,28"
              fill="none"
              stroke="#0d0d0d"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className={styles.logoText}>MY LEVELUP</span>
        </div>

        {/* Headline */}
        <h1 className={styles.headline}>
          Deviens la meilleure<br />
          <span className={styles.accent}>version de toi.</span>
        </h1>

        <p className={styles.sub}>
          Coaching sportif et nutritionnel personnalisé,<br />
          gamifié pour te garder motivé chaque jour.
        </p>

        {/* CTA */}
        <div className={styles.actions}>
          <button
            className={styles.btnPrimary}
            onClick={() => navigate('/register')}
          >
            Commencer gratuitement
          </button>
          <button
            className={styles.btnGhost}
            onClick={() => navigate('/login')}
          >
            J'ai déjà un compte
          </button>
        </div>

        {/* Features */}
        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🏋️</span>
            <span>Programmes sur mesure</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🥗</span>
            <span>Plans nutritionnels</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>⚡</span>
            <span>Système de niveaux</span>
          </div>
        </div>
      </div>
    </main>
  )
}
