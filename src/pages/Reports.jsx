import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import usePageTitle from '../hooks/usePageTitle'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileCsv, faDownload, faChartLine, faUsers } from '@fortawesome/free-solid-svg-icons'
import s from './Reports.module.css'

export default function Reports() {
  usePageTitle('Reports')
  const events = useSelector(s => s.events.list)
  const registrations = useSelector(s => s.registrations.list)
  const transactions = useSelector(s => s.payments.list)
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  
  // Filter transactions for the selected month and year
  const monthlyTransactions = transactions.filter(txn => {
    const d = new Date(txn.date)
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
  })
  
  // Compute totals
  const totalAmount = monthlyTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0)
  
  function downloadTransactionsCSV() {
    if (monthlyTransactions.length === 0) return alert('No transactions for this month.')
    
    const headers = ['Transaction ID', 'Date', 'Event', 'Competition', 'Participant Name', 'Amount (Rs)', 'Status']
    const rows = monthlyTransactions.map(t => [
      t.id,
      new Date(t.date).toLocaleDateString(),
      events.find(e => e.id === t.eventId)?.name || t.eventId,
      t.subCategory,
      `"${t.name}"`,
      t.amount,
      t.status
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n')
    
    downloadFile(`transactions-${months[selectedMonth]}-${selectedYear}.csv`, csvContent)
  }
  
  function downloadParticipantsCSV() {
    // Filter registrations for the selected month based on registeredAt
    const monthlyRegs = registrations.filter(reg => {
      const d = new Date(reg.registeredAt)
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
    })
    
    if (monthlyRegs.length === 0) return alert('No participants for this month.')
    
    const headers = ['Registration ID', 'Date', 'Event', 'Competition', 'Participant Name', 'Reg No', 'Department', 'Token Number', 'Team Members']
    const rows = monthlyRegs.map(r => [
      r.id,
      new Date(r.registeredAt).toLocaleDateString(),
      events.find(e => e.id === r.eventId)?.name || r.eventId,
      r.subCategory,
      `"${r.name}"`,
      r.regNo,
      r.department,
      r.tokenNumber || 'N/A',
      r.teamMembers ? `"${r.teamMembers.join(', ')}"` : 'N/A'
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n')
    
    downloadFile(`participants-${months[selectedMonth]}-${selectedYear}.csv`, csvContent)
  }
  
  function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`${s.page} page-enter`}>
      <div className={s.header}>
        <h1>Monthly Reports</h1>
        <p>Download transaction details and participation reports</p>
      </div>
      
      <div className={s.filters}>
        <div className={s.filterGroup}>
          <label>Month</label>
          <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        </div>
        <div className={s.filterGroup}>
          <label>Year</label>
          <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </div>
      </div>
      
      <div className={s.grid}>
        <motion.div 
          className={s.card}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={s.cardIcon} style={{ color: 'var(--blue)', background: 'var(--blue-bg)' }}>
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <div className={s.cardBody}>
            <h2>Transactions Report</h2>
            <p>{monthlyTransactions.length} transactions in {months[selectedMonth]}</p>
            <h3 className={s.amount}>Total: ₹{totalAmount}</h3>
            
            <button className={s.downloadBtn} onClick={downloadTransactionsCSV}>
              <FontAwesomeIcon icon={faFileCsv} style={{ marginRight: 6 }} />
              Download CSV
            </button>
          </div>
        </motion.div>
        
        <motion.div 
          className={s.card}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
        >
          <div className={s.cardIcon} style={{ color: 'var(--green)', background: 'var(--green-bg)' }}>
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div className={s.cardBody}>
            <h2>Participation Report</h2>
            <p>Download full list of participants for {months[selectedMonth]}</p>
            
            <button className={s.downloadBtn} onClick={downloadParticipantsCSV}>
              <FontAwesomeIcon icon={faFileCsv} style={{ marginRight: 6 }} />
              Download CSV
            </button>
          </div>
        </motion.div>
      </div>
      
      {monthlyTransactions.length > 0 && (
        <div className={s.preview}>
          <h3>Recent Transactions Preview</h3>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Competition</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {monthlyTransactions.slice(0, 5).map(t => (
                <tr key={t.id}>
                  <td>{new Date(t.date).toLocaleDateString()}</td>
                  <td>{t.name}</td>
                  <td>{t.subCategory}</td>
                  <td>₹{t.amount}</td>
                  <td><span className={s.statusPill}>{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
