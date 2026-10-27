import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../store/slices/authSlice'
import usePageTitle from '../hooks/usePageTitle'
import s from './LoginPage.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserGraduate, faPhoneAlt, faCalendarAlt, faUserCog, faCrown, faGift, faMasksTheater } from '@fortawesome/free-solid-svg-icons'

export default function LoginPage() {
  usePageTitle('Sign In')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [role, setRole] = useState('student')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Student fields
  const [regNo, setRegNo] = useState('')
  const [dob, setDob] = useState('')

  // Admin fields
  const [staffName, setStaffName] = useState('')
  const [phone, setPhone] = useState('')

  function switchRole(nextRole) {
    setRole(nextRole)
    setError('')
  }

  function handleLogin(e) {
    e.preventDefault()
    setError('')

    if (role === 'student' && (!regNo.trim() || !dob)) {
      setError('Please enter your register number and date of birth.')
      return
    }
    if (role === 'admin' && (!staffName.trim() || !phone.trim())) {
      setError('Please enter your staff name and phone number.')
      return
    }

    setLoading(true)
    
    let credentials = {}
    if (role === 'admin') {
      credentials = { staffName, phone }
    } else {
      credentials = { regNo, dob }
    }

    dispatch(loginUser(credentials))
      .unwrap()
      .then(() => {
        setLoading(false)
        navigate('/dashboard')
      })
      .catch((err) => {
        setError(err || 'Invalid credentials')
        setLoading(false)
      })
  }

  return (
    <div className={s.page}>
      {/* Decorative background */}
      <div className={s.bgOrb1} />
      <div className={s.bgOrb2} />
      <div className={s.bgGrid} />

      {/* Left panel — branding */}
      <div className={s.left}>
        <div className={s.leftInner}>
          <div className={s.brandMark}><FontAwesomeIcon icon={faMasksTheater} /></div>
          <h1 className={s.brandName}>CultureSync</h1>
          <p className={s.brandTagline}>
            Where tradition meets<br />
            <em>modern management</em>
          </p>
          <div className={s.brandDivider} />
          <p className={s.college}>Sri Parasakthi College for Women</p>
          <p className={s.collegeCity}>Courtallam, Tamil Nadu</p>

          <div className={s.featureList}>
            {[
              { icon: <FontAwesomeIcon icon={faCrown}/>, text: 'Manage cultural events effortlessly' },
              { icon: <FontAwesomeIcon icon={faUserGraduate} />, text: 'Track student registrations live' },
              { icon: <FontAwesomeIcon icon={faGift} />, text: 'Publish results with elegance' },
            ].map((f, i) => (
              <div key={i} className={s.featureItem}>
                <span className={s.featureIcon}>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className={s.right}>
        <form className={s.card} onSubmit={handleLogin} noValidate>
          <div className={s.cardHeader}>
            <h2 className={s.cardTitle}>Welcome back</h2>
            <p className={s.cardSub}>Sign in to access your dashboard</p>
          </div>

          {/* Role selector */}
          <div className={s.roleSelector}>
            <button
              type="button"
              className={`${s.roleTab} ${role === 'student' ? s.roleActive : ''}`}
              onClick={() => switchRole('student')}
            >
              <span>
                <FontAwesomeIcon icon={faUserGraduate}/>
              </span>
              <span>Student</span>
            </button>
            <button
              type="button"
              className={`${s.roleTab} ${role === 'admin' ? s.roleActive : ''}`}
              onClick={() => switchRole('admin')}
            >
              <span>
                <FontAwesomeIcon icon={faUserCog}/>
              </span>
              <span>Admin</span>
            </button>
          </div>

          {/* Fields */}
        {role === 'student' ? (
  <div className={s.fields}>
    <div className={s.fieldGroup}>
      <label className={s.label} htmlFor="regNo">Register Number</label>
      <div className={s.iconContainer}>
        <FontAwesomeIcon icon={faUserGraduate} />
      </div>
      <input
        id="regNo"
        className={s.input}
        placeholder="e.g. 21CS001"
        value={regNo}
        onChange={(e) => setRegNo(e.target.value)}
        autoComplete="off"
      />
    </div>
    <div className={s.fieldGroup}>
      <label className={s.label} htmlFor="dob">Date of Birth</label>
      <div className={s.iconContainer}>
        <FontAwesomeIcon icon={faCalendarAlt} />
      </div>
      <input
        id="dob"
        className={s.input}
        type="date"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
      />
    </div>
  </div>
) : (
  <div className={s.fields}>
    <div className={s.fieldGroup}>
      <label className={s.label} htmlFor="staffName">Staff Name</label>
      <div className={s.iconContainer}>
        <FontAwesomeIcon icon={faUserCog} />
      </div>
      <input
        id="staffName"
        className={s.input}
        placeholder="e.g. Dr. Kalpana Raghavan"
        value={staffName}
        onChange={(e) => setStaffName(e.target.value)}
        autoComplete="off"
      />
    </div>
    <div className={s.fieldGroup}>
      <label className={s.label} htmlFor="phone">Phone Number</label>
      <div className={s.iconContainer}>
        <FontAwesomeIcon icon={faPhoneAlt} />
      </div>
      <input
        id="phone"
        className={s.input}
        type="tel"
        placeholder="e.g. 9876543210"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        autoComplete="off"
      />
    </div>
  </div>
)}

          {error && <p className={s.errorText}>{error}</p>}

          <button
            type="submit"
            className={`${s.loginBtn} ${loading ? s.loginLoading : ''}`}
            disabled={loading}
          >
            {loading ? (
              <span className={s.spinner} />
            ) : (
              <>
                <span>Sign In</span>
                <span className={s.loginArrow}>→</span>
              </>
            )}
          </button>

          <p className={s.demoNote}>
            Enter your correct {role === 'admin' ? 'staff name and phone number' : 'register number and date of birth'} to sign in.
          </p>
        </form>
      </div>
    </div>
  )
}
