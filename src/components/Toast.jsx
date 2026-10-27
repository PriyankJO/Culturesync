import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { removeToast } from '../store/slices/toastSlice'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faCircleXmark, faTriangleExclamation, faCircleInfo, faXmark } from '@fortawesome/free-solid-svg-icons'
import s from './Toast.module.css'

const ICONS = {
  success: <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'var(--green)' }} />,
  error:   <FontAwesomeIcon icon={faCircleXmark} style={{ color: 'var(--orange)' }} />,
  warning: <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: 'var(--gold-lt)' }} />,
  info:    <FontAwesomeIcon icon={faCircleInfo} style={{ color: 'var(--blue)' }} />,
}

function ToastItem({ item }) {
  const dispatch = useDispatch()

  useEffect(() => {
    const timer = setTimeout(() => dispatch(removeToast(item.id)), item.duration)
    return () => clearTimeout(timer)
  }, [item.id, item.duration, dispatch])

  return (
    <div className={`${s.toast} ${s[item.type]}`}>
      <span className={s.icon}>{ICONS[item.type]}</span>
      <span className={s.message}>{item.message}</span>
      <button className={s.close} onClick={() => dispatch(removeToast(item.id))}><FontAwesomeIcon icon={faXmark} /></button>
    </div>
  )
}

export default function Toast() {
  const items = useSelector(s => s.toast.items)
  if (items.length === 0) return null

  return (
    <div className={s.container}>
      {items.map(item => (
        <ToastItem key={item.id} item={item} />
      ))}
    </div>
  )
}
