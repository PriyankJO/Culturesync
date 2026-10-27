import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addAdminUser, updateUserProfile } from '../store/slices/authSlice'
import { toast } from '../store/slices/toastSlice'
import usePageTitle from '../hooks/usePageTitle'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faBell, faShieldHalved, faGraduationCap, faCheckCircle, faCalendarCheck, faHourglassHalf, faTrophy, faCalendarDay, faSpinner } from '@fortawesome/free-solid-svg-icons'
import s from './Settings.module.css'

export default function Settings() {
  usePageTitle('Settings')
  const dispatch = useDispatch()
  const user = useSelector(st => st.auth.user)
  const role = useSelector(st => st.auth.role)
  const registrations = useSelector(st => st.registrations?.list || [])
  const results = useSelector(st => st.results?.list || [])
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [notifs, setNotifs] = useState({ reminders: true, confirmations: true, results: false })
  const [activeTab, setActiveTab] = useState('profile')
  const isAdmin = role === 'admin'
  const [newAdmin, setNewAdmin] = useState({ staffName: '', department: '', mobile: '', email: '' })

  const [formData, setFormData] = useState({
    name: user?.name || '',
    department: user?.department || '',
    mobile: user?.mobile || '',
    email: user?.email || '',
    dob: user?.dob || '',
  })

  // Synchronize formData whenever user from Redux updates (e.g. on fetchMe or login)
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        department: user.department || '',
        mobile: user.mobile || '',
        email: user.email || '',
        dob: user.dob || '',
      })
    }
  }, [user])

  async function handleSave() {
    if (!formData.name?.trim()) {
      dispatch(toast.error("Full Name is required."))
      return
    }
    setIsSaving(true)
    try {
      await dispatch(updateUserProfile(formData)).unwrap()
      setSaved(true)
      dispatch(toast.success('Profile details saved to database successfully!'))
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      dispatch(toast.error(err || 'Failed to update profile.'))
    } finally {
      setIsSaving(false)
    }
  }

  function handleCancel() {
    if (user) {
      setFormData({
        name: user.name || '',
        department: user.department || '',
        mobile: user.mobile || '',
        email: user.email || '',
        dob: user.dob || '',
      })
      dispatch(toast.info('Changes reverted to saved values.'))
    }
  }

  function handleAddAdmin() {
    if (!newAdmin.staffName || !newAdmin.mobile) {
      dispatch(toast.error("Staff Name and Mobile (used as password) are required."))
      return
    }
    dispatch(addAdminUser(newAdmin))
      .then((res) => {
        if (res.error) {
          dispatch(toast.error(res.payload || 'Failed to add admin.'))
        } else {
          dispatch(toast.success(`Admin ${newAdmin.staffName} added successfully!`))
          setNewAdmin({ staffName: '', department: '', mobile: '', email: '' })
        }
      })
  }

  function handlePhotoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      dispatch(toast.error('Please upload an image file (PNG or JPG).'))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      dispatch(toast.error('Image is too large — please use a file under 5MB.'))
      return
    }
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result
      try {
        await dispatch(updateUserProfile({ avatar: base64 })).unwrap()
        dispatch(toast.success('Profile photo updated in database.'))
      } catch (err) {
        dispatch(toast.error(err || 'Failed to update profile photo.'))
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  async function handleRemovePhoto() {
    try {
      await dispatch(updateUserProfile({ avatar: '' })).unwrap()
      dispatch(toast.info('Profile photo removed.'))
    } catch (err) {
      dispatch(toast.error(err || 'Failed to remove profile photo.'))
    }
  }

  // Dynamic user activity statistics
  const myRegs = role === 'admin' 
    ? registrations 
    : registrations.filter(r => r.regNo === user?.regNo)
  const registeredCount = myRegs.length
  const confirmedCount = myRegs.filter(r => r.status === 'confirmed').length
  const pendingCount = myRegs.filter(r => r.status === 'pending').length
  const winsCount = results.filter(res => res.winners?.some(w => w.name === user?.name || (user?.regNo && w.regNo === user?.regNo))).length

  const TABS = ['profile', 'notifications']
  const TAB_ICONS = { profile: <FontAwesomeIcon icon={faUser} />, notifications: <FontAwesomeIcon icon={faBell} /> }

  return (
    <div className={`${s.page} page-enter`}>

      {/* Tab bar */}
      <div className={s.tabs}>
        {TABS.map(tab => (
          <button
            key={tab}
            className={`${s.tab} ${activeTab === tab ? s.activeTab : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {TAB_ICONS[tab]}
            &nbsp;
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <motion.div 
          className={s.grid}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0, transition: { type: 'spring', damping: 24, stiffness: 200 } }}
        >
          <div className={s.panel}>
            <div className={s.panelHead}>
              <h3 className={s.panelTitle}>Profile Information</h3>
              <span className={`${s.roleBadge} ${role === 'admin' ? s.badgeAdmin : s.badgeStudent}`}>
                {role === 'admin' ? <><FontAwesomeIcon icon={faShieldHalved} style={{ marginRight: '6px' }} /> Admin</> : <><FontAwesomeIcon icon={faGraduationCap} style={{ marginRight: '6px' }} /> Student</>}
              </span>
            </div>

            {saved && (
              <div className={s.savedBanner}>
                <span style={{ marginRight: '8px' }}><FontAwesomeIcon icon={faCheckCircle} /></span> Changes saved successfully to database!
              </div>
            )}

            {/* Avatar section */}
            <div className={s.avatarSection}>
              <div className={s.bigAvatar}>
                {user?.avatar
                  ? <img src={user.avatar} alt={`${user?.name}'s profile photo`} className={s.bigAvatarImg} />
                  : user?.initials}
              </div>
              <div className={s.avatarInfo}>
                <div className={s.avatarName}>{user?.name}</div>
                <div className={s.avatarSub}>{user?.department}</div>
                <div className={s.avatarBtnRow}>
                  <label className={s.changeAvatarBtn}>
                    Change Photo
                    <input type="file" accept="image/*" hidden onChange={handlePhotoUpload} />
                  </label>
                  {user?.avatar && (
                    <button
                      type="button"
                      className={s.removeAvatarBtn}
                      onClick={handleRemovePhoto}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className={s.divider} />

            <div className={s.fieldGrid}>
              <div className={s.fieldGroup}>
                <label className={s.label}>Full Name *</label>
                <input
                  className={s.input}
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>
              <div className={s.fieldGroup}>
                <label className={s.label}>{role === 'admin' ? 'Staff ID / Username' : 'Register Number'}</label>
                <input
                  className={s.input}
                  value={user?.regNo || user?.staffName || ''}
                  readOnly
                  disabled
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
              </div>
              <div className={s.fieldGroup}>
                <label className={s.label}>Department</label>
                <input
                  className={s.input}
                  value={formData.department}
                  onChange={e => setFormData(p => ({ ...p, department: e.target.value }))}
                  placeholder="e.g. Computer Science"
                />
              </div>
              <div className={s.fieldGroup}>
                <label className={s.label}>Mobile Number</label>
                <input
                  className={s.input}
                  value={formData.mobile}
                  onChange={e => setFormData(p => ({ ...p, mobile: e.target.value }))}
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div className={`${s.fieldGroup} ${role === 'admin' ? s.fullWidth : ''}`}>
                <label className={s.label}>Email Address</label>
                <input
                  className={s.input}
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  placeholder={role === 'admin' ? 'admin@spc.edu' : `${user?.regNo ? user.regNo.toLowerCase() : 'student'}@spc.edu`}
                />
              </div>
              {role !== 'admin' && (
                <div className={s.fieldGroup}>
                  <label className={s.label}>Date of Birth</label>
                  <input
                    type="date"
                    className={s.input}
                    value={formData.dob}
                    onChange={e => setFormData(p => ({ ...p, dob: e.target.value }))}
                  />
                </div>
              )}
            </div>

            <div className={s.actions}>
              <button
                className={s.saveBtn}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? <><FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: 6 }} /> Saving...</> : 'Save Changes'}
              </button>
              <button
                className={s.cancelBtn}
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          </div>

          {isAdmin && (
            <motion.div 
              className={s.panel} 
              style={{ marginTop: 16 }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto', transition: { type: 'spring', damping: 24, stiffness: 200 } }}
            >
              <div className={s.panelHead}>
                <h3 className={s.panelTitle}>Add New Admin</h3>
                <span className={s.panelSub}>Create an additional admin account</span>
              </div>
              <div className={s.divider} style={{ margin: '16px 0' }} />
              <div className={s.fieldGrid}>
                <div className={s.fieldGroup}>
                  <label className={s.label}>Staff Name *</label>
                  <input className={s.input} placeholder="e.g. Mrs. Saraswathi" value={newAdmin.staffName} onChange={e => setNewAdmin(p => ({ ...p, staffName: e.target.value }))} />
                </div>
                <div className={s.fieldGroup}>
                  <label className={s.label}>Mobile Number * (Used as Password)</label>
                  <input className={s.input} placeholder="e.g. 9876543210" value={newAdmin.mobile} onChange={e => setNewAdmin(p => ({ ...p, mobile: e.target.value }))} />
                </div>
                <div className={s.fieldGroup}>
                  <label className={s.label}>Department</label>
                  <input className={s.input} placeholder="e.g. CS" value={newAdmin.department} onChange={e => setNewAdmin(p => ({ ...p, department: e.target.value }))} />
                </div>
                <div className={s.fieldGroup}>
                  <label className={s.label}>Email Address</label>
                  <input className={s.input} placeholder="e.g. saraswathi@spc.edu" value={newAdmin.email} onChange={e => setNewAdmin(p => ({ ...p, email: e.target.value }))} />
                </div>
              </div>
              <div className={s.actions} style={{ marginTop: 16 }}>
                <button className={s.saveBtn} onClick={handleAddAdmin}>
                  <FontAwesomeIcon icon={faShieldHalved} style={{ marginRight: 6 }} /> Add Admin
                </button>
              </div>
            </motion.div>
          )}

          {/* Stats card */}
          <div className={s.sidePanel}>
            <div className={s.panel}>
              <div className={s.panelHead}>
                <h3 className={s.panelTitle}>Activity Summary</h3>
              </div>
              <div className={s.statList}>
                {[
                  { label: 'Events Registered', value: registeredCount, icon: <FontAwesomeIcon icon={faCalendarCheck} />, color: 'var(--gold-lt)'  },
                  { label: 'Confirmed',          value: confirmedCount, icon: <FontAwesomeIcon icon={faCheckCircle} />, color: 'var(--green)'    },
                  { label: 'Pending',            value: pendingCount, icon: <FontAwesomeIcon icon={faHourglassHalf} />, color: 'var(--orange)'   },
                  { label: 'Wins / Podiums',     value: winsCount, icon: <FontAwesomeIcon icon={faTrophy} />, color: 'var(--purple)'   },
                ].map((stat, i) => (
                  <div key={i} className={s.statRow}>
                    <div className={s.statIcon}>{stat.icon}</div>
                    <div className={s.statLabel}>{stat.label}</div>
                    <div className={s.statVal} style={{ color: stat.color }}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={s.panel} style={{ marginTop: 14 }}>
              <div className={s.panelHead}>
                <h3 className={s.panelTitle}>Account</h3>
              </div>
              <div className={s.accountInfo}>
                <div className={s.accountRow}>
                  <span className={s.accountLabel}>Identifier</span>
                  <span className={s.accountVal}>{user?.regNo || user?.staffName || '—'}</span>
                </div>
                <div className={s.accountRow}>
                  <span className={s.accountLabel}>Role</span>
                  <span className={s.accountVal} style={{ textTransform: 'capitalize' }}>{role}</span>
                </div>
                <div className={s.accountRow}>
                  <span className={s.accountLabel}>Status</span>
                  <span className={s.accountVal} style={{ textTransform: 'capitalize', color: 'var(--green)' }}>{user?.status || 'Active'}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notifications tab */}
      {activeTab === 'notifications' && (
        <motion.div 
          className={s.panel} 
          style={{ maxWidth: 600 }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0, transition: { type: 'spring', damping: 24, stiffness: 200 } }}
        >
          <div className={s.panelHead}>
            <h3 className={s.panelTitle}>Notification Preferences</h3>
          </div>
          <div className={s.notifList}>
            {[
              { key: 'reminders',     icon: <FontAwesomeIcon icon={faCalendarDay} />, label: 'Event Reminders',           sub: 'Get notified 24 hours before events you\'re registered for' },
              { key: 'confirmations', icon: <FontAwesomeIcon icon={faCheckCircle} />, label: 'Registration Confirmations', sub: 'SMS and in-app notifications when your registration is confirmed' },
              { key: 'results',       icon: <FontAwesomeIcon icon={faTrophy} />, label: 'Results Published',         sub: 'When winners are announced for events you participated in' },
            ].map(n => (
              <div key={n.key} className={n.notifRow || s.notifRow}>
                <div className={s.notifLeft}>
                  <div className={s.notifIcon}>{n.icon}</div>
                  <div>
                    <div className={s.notifLabel}>{n.label}</div>
                    <div className={s.notifSub}>{n.sub}</div>
                  </div>
                </div>
                <button
                  className={`${s.toggle} ${notifs[n.key] ? s.toggleOn : ''}`}
                  onClick={() => setNotifs(p => ({ ...p, [n.key]: !p[n.key] }))}
                  aria-label={`Toggle ${n.label}`}
                >
                  <div className={s.toggleThumb} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
