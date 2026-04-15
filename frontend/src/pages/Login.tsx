import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { loginUser } from '../services/auth.service'
import styles from './Auth.module.css'

export default function Login() {
  const navigate = useNavigate()
  const { setAuth, setHasProfile } = useAuthStore()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.email || !form.password) {
      setError('Email et mot de passe requis')
      return
    }

    setLoading(true)
    try {
      const data = await loginUser(form.email, form.password)
      setAuth(data.token, data.user)
      setHasProfile(data.hasProfile)

      if (data.hasProfile) {
        navigate('/dashboard')
      } else {
        navigate('/onboarding')
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Erreur de connexion'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.card}>
        <Link to="/" className={styles.back}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Retour
        </Link>

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
          <h1 className={styles.title}>Content de te revoir</h1>
          <p className={styles.subtitle}>Connecte-toi pour reprendre ton aventure</p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="ton@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="Ton mot de passe"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className={styles.btnSubmit} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Se connecter'}
          </button>
        </form>

        <p className={styles.legal}>
          Pas encore de compte ?{' '}
          <Link to="/register" className={styles.link}>Créer un compte</Link>
        </p>
      </div>
    </main>
  )
}
