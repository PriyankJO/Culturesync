import React from 'react'
import s from './Skeleton.module.css'

/**
 * A shimmer placeholder for loading states.
 *
 * Usage:
 *   <Skeleton width="100%" height={20} />
 *   <Skeleton variant="circle" size={40} />
 *   <Skeleton variant="card" />
 */
export default function Skeleton({ variant = 'rect', width, height, size, className = '' }) {
  if (variant === 'circle') {
    return (
      <div
        className={`${s.skeleton} ${s.circle} ${className}`}
        style={{ width: size ?? 40, height: size ?? 40 }}
      />
    )
  }

  if (variant === 'card') {
    return (
      <div className={`${s.card} ${className}`}>
        <div className={`${s.skeleton}`} style={{ height: 100 }} />
        <div className={s.cardBody}>
          <div className={`${s.skeleton}`} style={{ height: 16, width: '70%' }} />
          <div className={`${s.skeleton}`} style={{ height: 12, width: '45%' }} />
          <div className={`${s.skeleton}`} style={{ height: 12, width: '90%' }} />
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <div className={`${s.skeleton}`} style={{ height: 20, width: 60, borderRadius: 99 }} />
            <div className={`${s.skeleton}`} style={{ height: 20, width: 80, borderRadius: 99 }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`${s.skeleton} ${className}`}
      style={{ width: width ?? '100%', height: height ?? 16, borderRadius: 6 }}
    />
  )
}

/** Renders N skeleton cards in a grid — drop-in for event/results lists while loading */
export function SkeletonGrid({ count = 6 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="card" />
      ))}
    </div>
  )
}

/** Renders N skeleton table rows */
export function SkeletonTable({ rows = 5, cols = 6 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 12,
            padding: '14px 16px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} height={14} width={j === 0 ? '80%' : j % 2 === 0 ? '60%' : '50%'} />
          ))}
        </div>
      ))}
    </div>
  )
}
