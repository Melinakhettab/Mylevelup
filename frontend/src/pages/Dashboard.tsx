import { useOnboardingStore } from '../store/onboardingStore'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const { profileData } = useOnboardingStore()
  const name = profileData.firstName || 'Champion'

  const objectiveLabels: Record<string, string> = {
    perte_poids: 'Perte de poids',
    prise_masse: 'Prise de masse',
    remise_en_forme: 'Remise en forme',
    maintien: 'Maintien',
    performance: 'Performance',
  }

  const levelLabels: Record<string, string> = {
    debutant: 'Débutant',
    intermediaire: 'Intermédiaire',
    avance: 'Avancé',
  }

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
          <div className={styles.xpBadge}>
            <span>⚡</span> Niveau 1
          </div>
        </div>

        {/* Welcome */}
        <div className={styles.welcome}>
          <h1 className={styles.welcomeTitle}>
            Bienvenue, <span className={styles.accent}>{name}</span> ! 🎉
          </h1>
          <p className={styles.welcomeSub}>
            Ton profil est créé. Ton programme personnalisé va être généré.
          </p>
        </div>

        {/* Profile summary */}
        <div className={styles.profileGrid}>
          {profileData.objective && (
            <div className={styles.profileCard}>
              <span className={styles.profileIcon}>🎯</span>
              <div>
                <p className={styles.profileLabel}>Objectif</p>
                <p className={styles.profileValue}>{objectiveLabels[profileData.objective]}</p>
              </div>
            </div>
          )}
          {profileData.level && (
            <div className={styles.profileCard}>
              <span className={styles.profileIcon}>📊</span>
              <div>
                <p className={styles.profileLabel}>Niveau</p>
                <p className={styles.profileValue}>{levelLabels[profileData.level]}</p>
              </div>
            </div>
          )}
          {profileData.hoursPerWeek !== '' && (
            <div className={styles.profileCard}>
              <span className={styles.profileIcon}>⏱️</span>
              <div>
                <p className={styles.profileLabel}>Disponibilités</p>
                <p className={styles.profileValue}>{profileData.hoursPerWeek}h / semaine</p>
              </div>
            </div>
          )}
          {profileData.equipment && (
            <div className={styles.profileCard}>
              <span className={styles.profileIcon}>{profileData.equipment === 'salle' ? '🏋️' : '🏠'}</span>
              <div>
                <p className={styles.profileLabel}>Entraînement</p>
                <p className={styles.profileValue}>{profileData.equipment === 'salle' ? 'En salle' : 'À domicile'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Coming soon */}
        <div className={styles.comingSoon}>
          <div className={styles.csIcon}>🚀</div>
          <h2 className={styles.csTitle}>Programme en cours de génération…</h2>
          <p className={styles.csSub}>
            Notre IA prépare ton planning d'entraînement et ton plan nutritionnel.
            Reviens dans quelques instants.
          </p>
          <div className={styles.loadingBar}>
            <div className={styles.loadingFill} />
          </div>
        </div>
      </div>
    </main>
  )
}
