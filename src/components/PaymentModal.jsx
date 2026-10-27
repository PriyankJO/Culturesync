import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { closeModal } from '../store/slices/uiSlice'
import { toast } from '../store/slices/toastSlice'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCreditCard, faTimes, faQrcode } from '@fortawesome/free-solid-svg-icons'
import s from './PaymentModal.module.css'
import { processPaymentTransaction } from '../store/slices/paymentsSlice' // We will create this thunk

export default function PaymentModal({ payload }) {
  const { registration, event } = payload
  const dispatch = useDispatch()
  
  const { user } = useSelector(st => st.auth)
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('qr')
  
  const amount = event.registrationFee || 50

  function handleSubmit(e) {
    e.preventDefault()
    setIsProcessing(true)
    
    // Process real payment transaction
    dispatch(processPaymentTransaction({
      registrationId: registration.regId,
      eventId: event.id,
      subCategory: registration.subCategory,
      name: user?.name || registration.name,
      amount
    })).unwrap()
    .then(() => {
      dispatch(toast.success('Payment successful! Your ticket is now fully valid.'))
      dispatch(closeModal())
    })
    .catch((err) => {
      dispatch(toast.error(err || 'Payment failed. Please try again.'))
      setIsProcessing(false)
    })
  }
  
  return (
    <div className={s.overlay}>
      <motion.div 
        className={s.modal}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <button className={s.closeBtn} onClick={() => dispatch(closeModal())}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        
        <div className={s.header}>
          <h2>Secure Checkout</h2>
          <p>{registration.subCategory} - {event.name}</p>
        </div>
        
        <form className={s.body} onSubmit={handleSubmit}>
          <div className={s.summary}>
            <div className={s.summaryRow}>
              <span>Ticket For</span>
              <span>{registration.name}</span>
            </div>
            <div className={s.summaryRow}>
              <span>Registration Fee</span>
              <strong>₹{amount}</strong>
            </div>
          </div>
          
          <div className={s.methodToggle}>
            <button 
              type="button" 
              className={paymentMethod === 'qr' ? s.methodBtnActive : s.methodBtn}
              onClick={() => setPaymentMethod('qr')}
            >
              <FontAwesomeIcon icon={faQrcode} /> UPI / QR
            </button>
            <button 
              type="button" 
              className={paymentMethod === 'card' ? s.methodBtnActive : s.methodBtn}
              onClick={() => setPaymentMethod('card')}
            >
              <FontAwesomeIcon icon={faCreditCard} /> Card
            </button>
          </div>
          
          {paymentMethod === 'qr' ? (
            <div className={s.qrSection}>
              <div className={s.qrWrapper}>
                <div className={s.qrBox}>
                  <FontAwesomeIcon icon={faQrcode} className={s.qrIcon} />
                  <div className={s.qrScannerBar} />
                </div>
              </div>
              <p className={s.qrText}>Scan with any UPI app to pay <strong>₹{amount}</strong></p>
            </div>
          ) : (
            <>
              <div className={s.formGroup}>
                <label>Name on Card</label>
                <input 
                  type="text" 
                  defaultValue={user?.name || ''} 
                  required={paymentMethod === 'card'}
                />
              </div>
              
              <div className={s.formGroup}>
                <label>Card Details (Simulation)</label>
                <div className={s.mockCardInput}>
                  <FontAwesomeIcon icon={faCreditCard} style={{ color: '#888' }} />
                  <input type="text" value="•••• •••• •••• 4242" readOnly />
                </div>
              </div>
            </>
          )}
          
          <div className={s.footer}>
            <button type="button" className={s.cancelBtn} onClick={() => dispatch(closeModal())} disabled={isProcessing}>
              Cancel
            </button>
            <button type="submit" className={s.payBtn} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : (paymentMethod === 'qr' ? `Simulate Scan & Pay ₹${amount}` : `Pay ₹${amount} Now`)}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
