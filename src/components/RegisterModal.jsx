import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { closeModal } from '../store/slices/uiSlice'
import { addRegistration } from '../store/slices/registrationsSlice'
import { registerForEvent } from '../store/slices/eventsSlice'
import { toast } from '../store/slices/toastSlice'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faUser, faUsers, faCheckCircle, faMedal } from '@fortawesome/free-solid-svg-icons'
import s from './RegisterModal.module.css' 

export default function RegisterModal({ payload }) {
  const { competition, event } = payload
  const dispatch = useDispatch()
  
  const { user } = useSelector(st => st.auth)
  
  const isTeam = competition.individualOrTeam === 'Team'
  
  const [teamMembers, setTeamMembers] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  function handleSubmit(e) {
    e.preventDefault()
    
    if (isTeam && !teamMembers.trim()) {
      dispatch(toast.error('Please enter your team members.'))
      return
    }
    
    setIsProcessing(true)
    
    setTimeout(() => {
      const membersArray = teamMembers
        .split(',')
        .map(m => m.trim())
        .filter(Boolean)
        
      const newRegistration = {
        eventId: competition.eventId,
        subCategory: competition.subCategory,
        name: user?.name || 'Unknown Student',
        regNo: user?.regNo || 'N/A',
        department: user?.department || 'N/A',
        source: 'self',
        teamMembers: membersArray,
      }
      
      dispatch(addRegistration(newRegistration))
      dispatch(registerForEvent({ eventId: competition.eventId, subCategory: competition.subCategory }))
      
      dispatch(toast.success('Registration submitted! Awaiting admin confirmation.'))
      dispatch(closeModal())
      setIsProcessing(false)
    }, 1000)
  }
  
  return (
    <AnimatePresence>
      <div className={s.overlay} onClick={() => !isProcessing && dispatch(closeModal())}>
        <motion.div 
          className={s.modal}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          <button className={s.closeBtn} onClick={() => dispatch(closeModal())} disabled={isProcessing}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
          
          <div className={s.header}>
            <div className={s.headerIcon}>
              <FontAwesomeIcon icon={faMedal} />
            </div>
            <h2>Register for Competition</h2>
            <p>{competition.subCategory} &middot; {event.name}</p>
          </div>
          
          <form className={s.body} onSubmit={handleSubmit}>
            <div className={s.summary}>
              <div className={s.summaryRow}>
                <span>Participation Type</span>
                <span className={s.summaryType}>
                  {isTeam ? <FontAwesomeIcon icon={faUsers} style={{color: 'var(--gold)'}} /> : <FontAwesomeIcon icon={faUser} style={{color: 'var(--gold)'}} />}
                  {competition.individualOrTeam}
                </span>
              </div>
              <div className={s.summaryRow}>
                <span>Registration Fee</span>
                <strong>₹{event.registrationFee || 50}</strong>
              </div>
              <p className={s.note}>
                <strong>Note:</strong> You will be asked to pay the fee only after an admin confirms your registration and allocates you a token number.
              </p>
            </div>
            
            {isTeam && (
              <div className={s.formGroup}>
                <label>Team Members (comma separated)</label>
                <textarea 
                  placeholder="e.g. Meena, Sowmiya, Lavanya"
                  value={teamMembers}
                  onChange={e => setTeamMembers(e.target.value)}
                  required
                />
              </div>
            )}
            
            <div className={s.footer}>
              <button type="button" className={s.cancelBtn} onClick={() => dispatch(closeModal())} disabled={isProcessing}>
                Cancel
              </button>
              <button type="submit" className={s.submitBtn} disabled={isProcessing}>
                {isProcessing ? (
                  'Processing...'
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheckCircle} /> Submit Registration
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
