import styles from './SkeletonCard.module.css';

interface SkeletonCardProps {
  lines?: number;
  height?: string;
}

export function SkeletonCard({ lines = 3, height = '100px' }: SkeletonCardProps) {
  return (
    <div className={styles.card} style={{ minHeight: height }}>
      <div className={`${styles.shimmer} ${styles.titleLine}`} />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`${styles.shimmer} ${styles.contentLine}`} />
      ))}
    </div>
  );
}
