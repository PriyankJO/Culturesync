import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { closeModal } from '../store/slices/uiSlice'
import { confirmRegistration } from '../store/slices/registrationsSlice'
import { toast } from '../store/slices/toastSlice'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faCheck, faCalendarDay, faClock, faLocationDot, faTicket } from '@fortawesome/free-solid-svg-icons'
import s from './TokenAllocationModal.module.css'

export default function TokenAllocationModal({ payload }) {
  const dispatch = useDispatch()
  const { registration: reg, event } = payload
  
  const competitions = useSelector(st => st.competitions.list)
  const registrations = useSelector(st => st.registrations.list)
  
  // Initialize with event defaults or existing registration data
  const [date, setDate] = useState(event?.date || '')
  const [time, setTime] = useState(event?.time || '')
  const [venue, setVenue] = useState(event?.venue || '')

  function handleSubmit(e) {
    e.preventDefault()
    
    dispatch(confirmRegistration({
      id: reg.id,
      allocatedDate: date,
      allocatedTime: time,
      allocatedVenue: venue
    }))
    
    dispatch(toast.success(`${reg.name}'s registration confirmed and token allocated.`))
    dispatch(closeModal())
  }

  return (
    <div className={s.overlay} onClick={() => dispatch(closeModal())}>
      <div className={s.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className={s.header}>
          <h2>Allocate Token & Confirm</h2>
          <button className={s.closeBtn} onClick={() => dispatch(closeModal())} type="button">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={s.body}>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '16px' }}>
            Allocating token for <strong>{reg.name}</strong> ({reg.subCategory}) in <strong>{event.name}</strong>.
          </p>

          <div className={s.fieldGroup}>
            <label><FontAwesomeIcon icon={faTicket} /> Token Number</label>
            <div className={s.input} style={{ backgroundColor: 'var(--bg3)', color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>
               Automatically generated upon confirmation
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className={s.fieldGroup}>
              <label><FontAwesomeIcon icon={faCalendarDay} /> Allocated Date</label>
              <input 
                type="date"
                className={s.input} 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                required
              />
            </div>
            
            <div className={s.fieldGroup}>
              <label><FontAwesomeIcon icon={faClock} /> Allocated Time</label>
              <input 
                type="time"
                className={s.input} 
                value={time} 
                onChange={e => setTime(e.target.value)} 
                required
              />
            </div>
          </div>

          <div className={s.fieldGroup}>
            <label><FontAwesomeIcon icon={faLocationDot} /> Specific Venue / Room</label>
            <input 
              className={s.input} 
              value={venue} 
              onChange={e => setVenue(e.target.value)} 
              placeholder="e.g. Main Auditorium"
              required
            />
          </div>
          
          {reg.teamMembers && reg.teamMembers.length > 0 && (
            <div className={s.fieldGroup}>
              <label>Team Members (Read-only)</label>
              <div style={{ padding: '10px', background: 'var(--bg3)', borderRadius: '6px', fontSize: '13px' }}>
                {reg.teamMembers.join(', ')}
              </div>
            </div>
          )}

          <div className={s.footer}>
            <button className={s.secondaryBtn} onClick={() => dispatch(closeModal())} type="button">
              Cancel
            </button>
            <button className={s.primaryBtn} type="submit" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <FontAwesomeIcon icon={faCheck} /> Confirm & Allocate
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
