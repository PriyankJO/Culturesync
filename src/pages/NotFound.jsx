import React from 'react'
import { useNavigate } from 'react-router-dom'
import usePageTitle from '../hooks/usePageTitle'
import s from './NotFound.module.css'

export default function NotFound() {
  usePageTitle('Page Not Found')
  const navigate = useNavigate()
  return (
    <div className={`${s.page} page-enter`}>
      <div className={s.code}>404</div>
      <h2 className={s.title}>Page not found</h2>
      <p className={s.sub}>The page you're looking for doesn't exist or has been moved.</p>
      <button className={s.homeBtn} onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>
    </div>
  )
}
