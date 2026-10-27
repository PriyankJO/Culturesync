import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTriangleExclamation, faBolt, faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import s from './ConfirmDialog.module.css'

/**
 * A lightweight confirmation dialog.
 *
 * Usage:
 *   <ConfirmDialog
 *     open={showDialog}
 *     title="Cancel Registration"
 *     message="Are you sure you want to cancel your registration for this event?"
 *     confirmLabel="Yes, Cancel"
 *     variant="danger"
 *     onConfirm={() => { dispatch(cancelRegistration(id)); setShowDialog(false) }}
 *     onCancel={() => setShowDialog(false)}
 *   />
 */
export default function ConfirmDialog({
  open,
  title       = 'Are you sure?',
  message     = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  variant      = 'danger',   // 'danger' | 'warning' | 'primary'
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  return (
    <div className={s.overlay} onClick={e => e.target === e.currentTarget && onCancel?.()}>
      <div className={s.dialog}>
        <div className={`${s.iconWrap} ${s[variant]}`}>
          {variant === 'danger'  ? <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: 'var(--red)' }} /> : 
           variant === 'warning' ? <FontAwesomeIcon icon={faBolt} style={{ color: 'var(--orange)' }} /> : 
           <FontAwesomeIcon icon={faCircleInfo} style={{ color: 'var(--gold)' }} />}
        </div>
        <h3 className={s.title}>{title}</h3>
        <p className={s.message}>{message}</p>
        <div className={s.actions}>
          <button
            className={`${s.confirmBtn} ${s[variant + 'Btn']}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
          <button className={s.cancelBtn} onClick={onCancel}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
