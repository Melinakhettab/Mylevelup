import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { getLeaderboard, type LeaderboardData, type LeaderboardEntry } from '../services/leaderboard.service'
import styles from './Leaderboard.module.css'

const medalColors: Record<number, string> = { 1: styles.gold, 2: styles.silver, 3: styles.bronze }

export default function Leaderboard() {
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.user)
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getLeaderboard()
      .then(setData)
      .catch(() => setError('Impossible de charger le classement'))
      .finally(() => setLoading(false))
  }, [])

  const isMe = (entry: LeaderboardEntry) => entry.userId === currentUser?.id
  const meInTop20 = data ? data.top.some(isMe) : false

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.grid} aria-hidden="true" />
        <div className={styles.loadingWrap}><span className={styles.spinner} /></div>
      </main>
    )
  }

  const podium = data?.top.slice(0, 3) ?? []
  const rest = data?.top.slice(3) ?? []

  return (
    <main className={styles.page}>
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
            ← Retour
          </button>
          <h1 className={styles.title}>Classement</h1>
          <div className={styles.spacer} />
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {data && (
          <>
            <div className={styles.podium}>
              {[podium[1], podium[0], podium[2]].map((entry, visualIndex) => {
                if (!entry) return <div key={visualIndex} className={styles.podiumSlot} />
                const heights = [60, 80, 40]
                return (
                  <div
                    key={entry.userId}
                    className={`${styles.podiumSlot} ${isMe(entry) ? styles.myEntry : ''}`}
                  >
                    <div className={styles.podiumName}>{entry.firstName}</div>
                    <div className={styles.podiumPoints}>
                      <span className={styles.lightning}>⚡</span>{entry.total}
                    </div>
                    <div
                      className={`${styles.podiumBar} ${medalColors[entry.rank] ?? ''}`}
                      style={{ height: `${heights[visualIndex]}px` }}
                    >
                      <span className={styles.podiumRank}>{entry.rank}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className={styles.list}>
              {rest.map((entry) => (
                <div
                  key={entry.userId}
                  className={`${styles.listRow} ${isMe(entry) ? styles.myEntry : ''}`}
                >
                  <span className={styles.listRank}>#{entry.rank}</span>
                  <span className={styles.listName}>{entry.firstName}</span>
                  <span className={styles.listPoints}><span className={styles.lightning}>⚡</span>{entry.total}</span>
                  <span className={styles.listStreak}><span className={styles.fire}>🔥</span>{entry.streak}</span>
                </div>
              ))}
            </div>

            {!meInTop20 && data.me.rank > 0 && (
              <div className={styles.myPositionSection}>
                <p className={styles.myPositionLabel}>Ta position</p>
                <div className={`${styles.listRow} ${styles.myEntry}`}>
                  <span className={styles.listRank}>#{data.me.rank}</span>
                  <span className={styles.listName}>{data.me.firstName}</span>
                  <span className={styles.listPoints}><span className={styles.lightning}>⚡</span>{data.me.total}</span>
                  <span className={styles.listStreak}><span className={styles.fire}>🔥</span>{data.me.streak}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
