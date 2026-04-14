import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useOnboardingStore } from '../store/onboardingStore'
import styles from './Auth.module.css'

interface FormState {
  email: string
  password: string
  confirmPassword: string
}

interface Errors {
  email?: string
  password?: string
  confirmPassword?: string
}

export default function Register() {
  const navigate = useNavigate()
  const setRegisterData = useOnboardingStore((s) => s.setRegisterData)

  const [form, setForm] = useState<FormState>({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Errors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const validate = (): boolean => {
    const errs: Errors = {}
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Adresse email invalide'
    }
    if (form.password.length < 8) {
      errs.password = 'Au moins 8 caractères requis'
    }
    if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Les mots de passe ne correspondent pas'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    // Simulate async (future API call)
    await new Promise((r) => setTimeout(r, 600))
    setRegisterData({ email: form.email, password: form.password })
    setLoading(false)
    navigate('/onboarding')
  }

  const getPasswordStrength = () => {
    const p = form.password
    if (!p) return null
    if (p.length < 6) return { label: 'Faible', color: '#ff4444', width: '25%' }
    if (p.length < 8) return { label: 'Moyen', color: '#ff8800', width: '50%' }
    if (p.length < 12 || !/[^a-zA-Z0-9]/.test(p)) return { label: 'Bon', color: '#FFD600', width: '75%' }
    return { label: 'Fort', color: '#22c55e', width: '100%' }
  }

  const strength = getPasswordStrength()

  return (
    <main className={styles.page}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.card}>
        {/* Back to welcome */}
        <Link to="/" className={styles.back}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Retour
        </Link>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logoMini}>
            <svg width="32" height="32" viewBox="0 0 56 56" fill="none">
              <rect x="1" y="24" width="10" height="8" rx="2" fill="#FFD600" />
              <rect x="4" y="21" width="4" height="14" rx="1.5" fill="#FFD600" />
              <rect x="11" y="27" width="34" height="2" rx="1" fill="#FFD600" />
              <rect x="45" y="24" width="10" height="8" rx="2" fill="#FFD600" />
              <rect x="48" y="21" width="4" height="14" rx="1.5" fill="#FFD600" />
              <path d="M28 22c0 0-8-5.5-8 2.5C20 32 28 38 28 38s8-6 8-13.5C36 16.5 28 22 28 22z" fill="#FFD600" opacity="0.95" />
              <polyline points="14,28 18,28 20,22 22,34 24,26 26,30 28,28 42,28" fill="none" stroke="#0d0d0d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className={styles.title}>Créer un compte</h1>
          <p className={styles.subtitle}>Rejoins ta communauté et commence ton aventure</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* Email */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              placeholder="ton@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
              autoFocus
            />
            {errors.email && <span className={styles.error}>{errors.email}</span>}
          </div>

          {/* Password */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Mot de passe</label>
            <div className={styles.inputWrapper}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                placeholder="Min. 8 caractères"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Masquer' : 'Afficher'}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {/* Strength bar */}
            {strength && (
              <div className={styles.strengthBar}>
                <div
                  className={styles.strengthFill}
                  style={{ width: strength.width, background: strength.color }}
                />
                <span className={styles.strengthLabel} style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
            {errors.password && <span className={styles.error}>{errors.password}</span>}
          </div>

          {/* Confirm password */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
              placeholder="Répète ton mot de passe"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              autoComplete="new-password"
            />
            {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className={styles.btnSubmit} disabled={loading}>
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              'Continuer'
            )}
          </button>
        </form>

        <p className={styles.legal}>
          En continuant tu acceptes nos{' '}
          <span className={styles.link}>Conditions d'utilisation</span>{' '}
          et notre{' '}
          <span className={styles.link}>Politique de confidentialité</span>
        </p>
      </div>
    </main>
  )
}
