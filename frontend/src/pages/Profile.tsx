import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, updateProfile, type Profile } from '../services/profile.service'
import styles from './Profile.module.css'

const goalOptions = [
  { value: 'perte_poids', label: 'Perte de poids' },
  { value: 'prise_masse', label: 'Prise de masse' },
  { value: 'maintien', label: 'Maintien' },
  { value: 'performance', label: 'Performance' },
  { value: 'forme', label: 'Remise en forme' },
]

const levelOptions = [
  { value: 'debutant', label: 'Débutant' },
  { value: 'intermediaire', label: 'Intermédiaire' },
  { value: 'avance', label: 'Avancé' },
]

const equipmentOptions = [
  { value: 'maison', label: 'Maison' },
  { value: 'salle', label: 'Salle de sport' },
  { value: 'mixte', label: 'Mixte' },
]

export default function ProfilePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [firstName, setFirstName] = useState('')
  const [goal, setGoal] = useState('')
  const [fitnessLevel, setFitnessLevel] = useState('')
  const [equipment, setEquipment] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [weeklyAvailability, setWeeklyAvailability] = useState('')

  useEffect(() => {
    getProfile()
      .then((p) => {
        setProfile(p)
        setFirstName(p.firstName ?? '')
        setGoal(p.goal)
        setFitnessLevel(p.fitnessLevel)
        setEquipment(p.equipment)
        setWeightKg(String(p.weightKg))
        setWeeklyAvailability(String(p.weeklyAvailability))
      })
      .catch(() => setError('Impossible de charger le profil'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const updated = await updateProfile({
        firstName,
        objective: goal,
        level: fitnessLevel,
        equipment,
        weight: parseFloat(weightKg),
        hoursPerWeek: parseInt(weeklyAvailability, 10),
      })
      setProfile(updated)
      setSuccess('Profil mis à jour avec succès.')
    } catch {
      setError('Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.grid} aria-hidden="true" />
        <div className={styles.loadingWrap}><span className={styles.spinner} /></div>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
            ← Retour
          </button>
          <h1 className={styles.title}>Mon profil</h1>
          <div className={styles.spacer} />
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}
        {success && <div className={styles.successBanner}>{success}</div>}

        <div className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Prénom</label>
            <input
              className={styles.input}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ton prénom"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Objectif</label>
            <select
              className={styles.select}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            >
              {goalOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Niveau de forme</label>
            <select
              className={styles.select}
              value={fitnessLevel}
              onChange={(e) => setFitnessLevel(e.target.value)}
            >
              {levelOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Équipement disponible</label>
            <select
              className={styles.select}
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
            >
              {equipmentOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Poids (kg)</label>
              <input
                className={styles.input}
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Heures / semaine</label>
              <input
                className={styles.input}
                type="number"
                min="1"
                max="20"
                value={weeklyAvailability}
                onChange={(e) => setWeeklyAvailability(e.target.value)}
              />
            </div>
          </div>

          {profile && (
            <div className={styles.statsCard}>
              <h2 className={styles.statsTitle}>Données calculées</h2>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>BMI</span>
                  <span className={styles.statValue}>{profile.bmi?.toFixed(1) ?? '—'}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>BMR</span>
                  <span className={styles.statValue}>{profile.bmr ? `${profile.bmr} kcal` : '—'}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>TDEE</span>
                  <span className={styles.statValue}>{profile.tdee ? `${profile.tdee} kcal` : '—'}</span>
                </div>
              </div>
            </div>
          )}

          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <span className={styles.spinner} /> : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </main>
  )
}
