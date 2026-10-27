import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { closeModal } from '../store/slices/uiSlice'
import Modal from './Modal'
import { AddStudentModal, ViewStudentModal, AddResultModal, AddParticipantModal } from './Modal'
import SubCategoryModal from './SubCategoryModal'
import CompetitionFormModal from './CompetitionFormModal'
import { AddJudgeModal, AssignEventsModal, AssignJudgesToEventModal } from './JudgeModals'
import RegisterModal from './RegisterModal'
import PaymentModal from './PaymentModal'
import TokenAllocationModal from './TokenAllocationModal'
import TicketDetailModal from './TicketDetailModal'

export default function ModalRouter() {
  const dispatch = useDispatch()
  const modal = useSelector(s => s.ui.modal)
  const events = useSelector(s => s.events.list)
  const judges = useSelector(s => s.judges.list)
  const close = () => dispatch(closeModal())

  if (!modal) return null

  if (modal.type === 'addStudent')    return <AddStudentModal onClose={close} payload={modal.payload} />
  if (modal.type === 'viewStudent')   return <ViewStudentModal onClose={close} student={modal.payload} />
  if (modal.type === 'addResult')     return <AddResultModal  onClose={close} />
  if (modal.type === 'subCategories') return <SubCategoryModal event={modal.payload} onClose={close} />
  if (modal.type === 'competitionForm') return <CompetitionFormModal payload={modal.payload} onClose={close} />
  if (modal.type === 'registerComp')  return <RegisterModal payload={modal.payload} />
  if (modal.type === 'payment')       return <PaymentModal payload={modal.payload} />
  if (modal.type === 'allocateToken') return <TokenAllocationModal onClose={close} payload={modal.payload} />
  if (modal.type === 'viewTicket')    return <TicketDetailModal payload={modal.payload} />
  if (modal.type === 'addJudge')      return <AddJudgeModal onClose={close} payload={modal.payload} />
  if (modal.type === 'assignJudgeEvents') {
    const judge = judges.find(j => j.id === modal.payload)
    return <AssignEventsModal judge={judge} events={events} onClose={close} />
  }
  if (modal.type === 'assignJudgesToEvent') {
    return <AssignJudgesToEventModal event={modal.payload} judges={judges} onClose={close} />
  }
  if (modal.type === 'addParticipant') {
    // payload may be a full event object (from SubCategoryModal) or just an id
    const event = typeof modal.payload === 'string'
      ? events.find(e => e.id === modal.payload)
      : modal.payload
    return <AddParticipantModal event={event} onClose={close} />
  }

  // Default: register + addEvent handled inside Modal
  return <Modal />
}
