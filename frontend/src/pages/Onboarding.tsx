import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboardingStore, type Objective, type Level, type Equipment, type Dietary } from '../store/onboardingStore'
import styles from './Onboarding.module.css'

// ─── Step definitions ───────────────────────────────────────────────────────

const TOTAL_STEPS = 6

// ─── Sub-components ─────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className={styles.progressOuter}>
      <div
        className={styles.progressFill}
        style={{ width: `${((current + 1) / total) * 100}%` }}
      />
    </div>
  )
}

function StepHeader({ label, title, sub }: { step?: number; label: string; title: string; sub: string }) {
  return (
    <div className={styles.stepHeader}>
      <span className={styles.stepBadge}>{label}</span>
      <h2 className={styles.stepTitle}>{title}</h2>
      <p className={styles.stepSub}>{sub}</p>
    </div>
  )
}

// ─── Step 1 — Prénom ─────────────────────────────────────────────────────────

function StepName() {
  const { profileData, setProfileData } = useOnboardingStore()
  return (
    <>
      <StepHeader
        step={0}
        label="Étape 1 / 6"
        title="Comment tu t'appelles ?"
        sub="Personnalisons ton expérience dès le début."
      />
      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="firstName">Prénom</label>
        <input
          id="firstName"
          type="text"
          className={styles.input}
          placeholder="Ton prénom"
          value={profileData.firstName}
          onChange={(e) => setProfileData({ firstName: e.target.value })}
          autoFocus
          autoComplete="given-name"
        />
      </div>
    </>
  )
}

// ─── Step 2 — Infos physiques ─────────────────────────────────────────────

function StepBody() {
  const { profileData, setProfileData } = useOnboardingStore()
  return (
    <>
      <StepHeader
        step={1}
        label="Étape 2 / 6"
        title="Tes infos physiques"
        sub="Pour calculer ton programme personnalisé et tes besoins caloriques."
      />
      <div className={styles.triGrid}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="age">Âge</label>
          <div className={styles.inputUnit}>
            <input
              id="age"
              type="number"
              className={styles.input}
              placeholder="25"
              min={10}
              max={120}
              value={profileData.age === '' ? '' : profileData.age}
              onChange={(e) => setProfileData({ age: e.target.value === '' ? '' : Number(e.target.value) })}
            />
            <span className={styles.unit}>ans</span>
          </div>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="weight">Poids</label>
          <div className={styles.inputUnit}>
            <input
              id="weight"
              type="number"
              className={styles.input}
              placeholder="70"
              min={20}
              max={300}
              step={0.5}
              value={profileData.weight === '' ? '' : profileData.weight}
              onChange={(e) => setProfileData({ weight: e.target.value === '' ? '' : Number(e.target.value) })}
            />
            <span className={styles.unit}>kg</span>
          </div>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="height">Taille</label>
          <div className={styles.inputUnit}>
            <input
              id="height"
              type="number"
              className={styles.input}
              placeholder="175"
              min={100}
              max={250}
              value={profileData.height === '' ? '' : profileData.height}
              onChange={(e) => setProfileData({ height: e.target.value === '' ? '' : Number(e.target.value) })}
            />
            <span className={styles.unit}>cm</span>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Step 3 — Objectif ───────────────────────────────────────────────────────

const OBJECTIVES: Array<{ value: Objective; label: string; icon: string; desc: string }> = [
  { value: 'perte_poids',    label: 'Perte de poids',    icon: '🔥', desc: 'Brûler les graisses et affiner la silhouette' },
  { value: 'prise_masse',    label: 'Prise de masse',    icon: '💪', desc: 'Développer muscles et volume corporel' },
  { value: 'remise_en_forme',label: 'Remise en forme',   icon: '⚡', desc: 'Retrouver énergie et santé générale' },
  { value: 'maintien',       label: 'Maintien',          icon: '⚖️', desc: 'Conserver ma forme actuelle' },
  { value: 'performance',    label: 'Performance',       icon: '🏆', desc: 'Repousser mes limites sportives' },
]

function StepObjective() {
  const { profileData, setProfileData } = useOnboardingStore()
  return (
    <>
      <StepHeader
        step={2}
        label="Étape 3 / 6"
        title="Quel est ton objectif ?"
        sub="Ton programme sera entièrement orienté vers cet objectif."
      />
      <div className={styles.cardGrid}>
        {OBJECTIVES.map((obj) => (
          <button
            key={obj.value}
            type="button"
            className={`${styles.optionCard} ${profileData.objective === obj.value ? styles.optionCardActive : ''}`}
            onClick={() => setProfileData({ objective: obj.value })}
          >
            <span className={styles.optionIcon}>{obj.icon}</span>
            <span className={styles.optionLabel}>{obj.label}</span>
            <span className={styles.optionDesc}>{obj.desc}</span>
          </button>
        ))}
      </div>
    </>
  )
}

// ─── Step 4 — Niveau ─────────────────────────────────────────────────────────

const LEVELS: Array<{ value: Level; label: string; icon: string; desc: string }> = [
  { value: 'debutant',      label: 'Débutant',      icon: '🌱', desc: 'Je débute ou reprends après une longue pause' },
  { value: 'intermediaire', label: 'Intermédiaire', icon: '🔄', desc: 'Je m\'entraîne régulièrement depuis quelques mois' },
  { value: 'avance',        label: 'Avancé',        icon: '🚀', desc: 'Je m\'entraîne intensément depuis plus d\'un an' },
]

function StepLevel() {
  const { profileData, setProfileData } = useOnboardingStore()
  return (
    <>
      <StepHeader
        step={3}
        label="Étape 4 / 6"
        title="Ton niveau actuel"
        sub="Sois honnête, c'est pour calibrer l'intensité de ton programme."
      />
      <div className={styles.listGrid}>
        {LEVELS.map((lvl) => (
          <button
            key={lvl.value}
            type="button"
            className={`${styles.listCard} ${profileData.level === lvl.value ? styles.listCardActive : ''}`}
            onClick={() => setProfileData({ level: lvl.value })}
          >
            <span className={styles.listIcon}>{lvl.icon}</span>
            <div className={styles.listText}>
              <span className={styles.listLabel}>{lvl.label}</span>
              <span className={styles.listDesc}>{lvl.desc}</span>
            </div>
            <span className={styles.listCheck}>
              {profileData.level === lvl.value && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" fill="#FFD600" />
                  <path d="M5 8L7 10L11 6" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
          </button>
        ))}
      </div>
    </>
  )
}

// ─── Step 5 — Équipement ─────────────────────────────────────────────────────

const EQUIPMENTS: Array<{ value: Equipment; label: string; icon: string; desc: string }> = [
  { value: 'domicile', label: 'À domicile', icon: '🏠', desc: 'Exercices au poids du corps et matériel léger' },
  { value: 'salle',    label: 'En salle',   icon: '🏋️', desc: 'Accès à tous les équipements et machines' },
]

const DIETS: Array<{ value: Dietary; label: string }> = [
  { value: 'aucun',        label: 'Aucune restriction' },
  { value: 'vegetarien',   label: 'Végétarien' },
  { value: 'vegan',        label: 'Vegan' },
  { value: 'halal',        label: 'Halal' },
  { value: 'sans_gluten',  label: 'Sans gluten' },
  { value: 'sans_lactose', label: 'Sans lactose' },
]

function StepEquipment() {
  const { profileData, setProfileData, toggleDietary } = useOnboardingStore()
  return (
    <>
      <StepHeader
        step={4}
        label="Étape 5 / 6"
        title="Ton environnement"
        sub="Où tu t'entraînes et tes préférences alimentaires."
      />

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Lieu d'entraînement</p>
        <div className={styles.twoGrid}>
          {EQUIPMENTS.map((eq) => (
            <button
              key={eq.value}
              type="button"
              className={`${styles.optionCard} ${profileData.equipment === eq.value ? styles.optionCardActive : ''}`}
              onClick={() => setProfileData({ equipment: eq.value })}
            >
              <span className={styles.optionIcon}>{eq.icon}</span>
              <span className={styles.optionLabel}>{eq.label}</span>
              <span className={styles.optionDesc}>{eq.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Régime alimentaire <span className={styles.optional}>(optionnel)</span></p>
        <div className={styles.chipGrid}>
          {DIETS.map((d) => (
            <button
              key={d.value}
              type="button"
              className={`${styles.chip} ${profileData.dietary.includes(d.value) ? styles.chipActive : ''}`}
              onClick={() => toggleDietary(d.value)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Step 6 — Disponibilités ─────────────────────────────────────────────────

const HOURS_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20]

function StepAvailability() {
  const { profileData, setProfileData } = useOnboardingStore()
  return (
    <>
      <StepHeader
        step={5}
        label="Étape 6 / 6"
        title="Tes disponibilités"
        sub="Combien d'heures par semaine peux-tu consacrer à l'entraînement ?"
      />
      <div className={styles.hoursGrid}>
        {HOURS_OPTIONS.map((h) => (
          <button
            key={h}
            type="button"
            className={`${styles.hourBtn} ${profileData.hoursPerWeek === h ? styles.hourBtnActive : ''}`}
            onClick={() => setProfileData({ hoursPerWeek: h })}
          >
            <span className={styles.hourNum}>{h}h</span>
            <span className={styles.hourSub}>/ semaine</span>
          </button>
        ))}
      </div>

      {profileData.hoursPerWeek !== '' && (
        <div className={styles.availability}>
          <span className={styles.availIcon}>📅</span>
          <span>
            Soit environ{' '}
            <strong style={{ color: '#FFD600' }}>
              {Math.round(Number(profileData.hoursPerWeek) / 3)} à {Math.ceil(Number(profileData.hoursPerWeek) / 2)} séances
            </strong>{' '}
            de 45–60 min par semaine
          </span>
        </div>
      )}
    </>
  )
}

// ─── Validation per step ──────────────────────────────────────────────────────

function isStepValid(step: number, profileData: ReturnType<typeof useOnboardingStore.getState>['profileData']): boolean {
  switch (step) {
    case 0: return profileData.firstName.trim().length > 0
    case 1: return profileData.age !== '' && profileData.weight !== '' && profileData.height !== ''
    case 2: return profileData.objective !== ''
    case 3: return profileData.level !== ''
    case 4: return profileData.equipment !== ''
    case 5: return profileData.hoursPerWeek !== ''
    default: return true
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Onboarding() {
  const navigate = useNavigate()
  const { step, profileData, nextStep, prevStep } = useOnboardingStore()
  const [submitting, setSubmitting] = useState(false)

  const valid = isStepValid(step, profileData)

  const handleNext = async () => {
    if (!valid) return
    if (step < TOTAL_STEPS - 1) {
      nextStep()
    } else {
      // Final submission
      setSubmitting(true)
      await new Promise((r) => setTimeout(r, 800))
      setSubmitting(false)
      navigate('/dashboard')
    }
  }

  const steps = [
    <StepName key={0} />,
    <StepBody key={1} />,
    <StepObjective key={2} />,
    <StepLevel key={3} />,
    <StepEquipment key={4} />,
    <StepAvailability key={5} />,
  ]

  return (
    <main className={styles.page}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.container}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <button
            className={styles.backBtn}
            onClick={step === 0 ? () => navigate('/register') : prevStep}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {step === 0 ? 'Retour' : 'Précédent'}
          </button>

          <div className={styles.logoMini}>
            <svg width="24" height="24" viewBox="0 0 56 56" fill="none">
              <rect x="1" y="24" width="10" height="8" rx="2" fill="#FFD600" />
              <rect x="4" y="21" width="4" height="14" rx="1.5" fill="#FFD600" />
              <rect x="11" y="27" width="34" height="2" rx="1" fill="#FFD600" />
              <rect x="45" y="24" width="10" height="8" rx="2" fill="#FFD600" />
              <rect x="48" y="21" width="4" height="14" rx="1.5" fill="#FFD600" />
              <path d="M28 22c0 0-8-5.5-8 2.5C20 32 28 38 28 38s8-6 8-13.5C36 16.5 28 22 28 22z" fill="#FFD600" opacity="0.95" />
              <polyline points="14,28 18,28 20,22 22,34 24,26 26,30 28,28 42,28" fill="none" stroke="#0d0d0d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <span className={styles.stepCounter}>{step + 1} / {TOTAL_STEPS}</span>
        </div>

        {/* Progress */}
        <ProgressBar current={step} total={TOTAL_STEPS} />

        {/* Step content */}
        <div className={styles.stepContent} key={step}>
          {steps[step]}
        </div>

        {/* Next button */}
        <button
          className={styles.nextBtn}
          onClick={handleNext}
          disabled={!valid || submitting}
        >
          {submitting ? (
            <span className={styles.spinner} />
          ) : step === TOTAL_STEPS - 1 ? (
            `Lancer mon programme, ${profileData.firstName || 'champion'} !`
          ) : (
            'Continuer'
          )}
        </button>

        {/* Skip hint */}
        {step === 4 && (
          <p className={styles.skipHint}>
            Tu pourras modifier ces informations plus tard dans ton profil.
          </p>
        )}
      </div>
    </main>
  )
}
