import React, { useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import usePageTitle from '../hooks/usePageTitle'
import CertificateModal from '../components/CertificateModal'
import CertificateTemplateEditor from '../components/CertificateTemplateEditor'
import { setCertificateTemplate, clearCertificateTemplate } from '../store/slices/uiSlice'
import { toast } from '../store/slices/toastSlice'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faPalette, faTrash, faImage, faMedal, faTrophy, faGraduationCap } from '@fortawesome/free-solid-svg-icons'
import s from './Certificates.module.css'

const RANK_STYLES = {
  1: { color: '#e2c97e', label: 'Gold' },
  2: { color: '#d1d5db', label: 'Silver' },
  3: { color: '#f97316', label: 'Bronze' },
}

export default function Certificates() {
  usePageTitle('Certificates')
  const dispatch = useDispatch()
  const results = useSelector(st => st.results.list)
  const role = useSelector(st => st.auth.role)
  const certificateTemplate = useSelector(st => st.ui.certificateTemplate)
  const certificateLayout = useSelector(st => st.ui.certificateLayout)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null) // { winner, event }
  const [showEditor, setShowEditor] = useState(false)
  const isAdmin = role === 'admin'

  function handleTemplateUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      dispatch(toast.error('Please upload an image file (PNG or JPG).'))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      dispatch(setCertificateTemplate(reader.result))
      dispatch(toast.success('Certificate template uploaded. New certificates will use it.'))
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // Flatten every winner across every event into one certificate-eligible list
  const entries = useMemo(() => {
    const rows = []
    results.forEach(ev => {
      ev.winners.forEach(w => {
        rows.push({ event: ev, winner: w })
      })
    })
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(({ event, winner }) =>
      winner.name.toLowerCase().includes(q) ||
      winner.department.toLowerCase().includes(q) ||
      event.eventName.toLowerCase().includes(q)
    )
  }, [results, query])

  return (
    <div className={`${s.page} page-enter`}>
      <div className={s.header}>
        <div className={s.headerLeft}>
          <p className={s.subTitle}>Generate and print certificates for event winners</p>
        </div>
        <div className={s.searchWrap}>
          <span className={s.searchIcon}><FontAwesomeIcon icon={faSearch} /></span>
          <input
            className={s.searchInput}
            placeholder="Search by name, department, or event…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      {isAdmin && (
        <div className={s.panel} style={{ marginBottom: 20 }}>
          <div className={s.panelHead}>
            <h3 className={s.panelTitle}>Certificate Template</h3>
          </div>
          <p className={s.certHint}>
            Upload a background image (landscape, A4-ish ratio works best) to brand every winner
            certificate — college letterhead, seal, borders, whatever you like. Then use
            <strong> Edit Certificate Design</strong> to drag the winner's name, department, and
            every other field wherever you like and change their text, size, and color. Leave the
            image empty to keep the default CultureSync design.
          </p>

          <div className={s.certPreviewActions} style={{ marginBottom: certificateTemplate ? 0 : 16 }}>
            <button className={s.uploadBtn} onClick={() => setShowEditor(true)} style={{ cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faPalette} style={{ marginRight: '6px' }} /> Edit Certificate Design
            </button>
          </div>

          {certificateTemplate ? (
            <div className={s.certPreviewWrap} style={{ marginTop: 14 }}>
              <img src={certificateTemplate} alt="Certificate template preview" className={s.certPreviewImg} />
              <div className={s.certPreviewActions}>
                <label className={s.uploadBtn}>
                  Replace image
                  <input type="file" accept="image/*" hidden onChange={handleTemplateUpload} />
                </label>
                <button
                  className={s.removeBtn}
                  onClick={() => { dispatch(clearCertificateTemplate()); dispatch(toast.info('Certificate template removed — using default design.')) }}
                >
                  <FontAwesomeIcon icon={faTrash} style={{ marginRight: '6px' }} /> Remove & use default
                </button>
              </div>
            </div>
          ) : (
            <label className={s.dropzone}>
              <span className={s.dropzoneIcon}><FontAwesomeIcon icon={faImage} style={{ color: 'var(--muted)' }} /></span>
              <span className={s.dropzoneTitle}>Click to upload a template image</span>
              <span className={s.dropzoneSub}>PNG or JPG · used as the certificate background</span>
              <input type="file" accept="image/*" hidden onChange={handleTemplateUpload} />
            </label>
          )}
        </div>
      )}

      {entries.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={s.empty}>
          <span className={s.emptyIcon} style={{ fontSize: '32px', color: 'var(--muted)' }}><FontAwesomeIcon icon={faMedal} /></span>
          <p style={{ marginTop: '12px' }}>No winners match your search.</p>
        </motion.div>
      ) : (
        <motion.div 
          className={s.grid}
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
        >
          {entries.map(({ event, winner }, i) => {
            const rs = RANK_STYLES[winner.rank] || { color: 'var(--text2)', label: `Rank ${winner.rank}` }
            return (
              <motion.div 
                key={`${event.id}-${winner.rank}-${i}`} 
                className={s.card}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } }
                }}
              >
                <div className={s.cardTop}>
                  <span className={s.medal}><FontAwesomeIcon icon={faMedal} style={{ color: rs.color }} /></span>
                  <span className={s.rankLabel} style={{ color: rs.color }}>{rs.label}</span>
                </div>
                <div className={s.name}>{winner.name}</div>
                <div className={s.dept}>{winner.department}</div>

                <div className={s.divider} />

                <div className={s.eventRow}>
                  <span className={s.eventEmoji}><FontAwesomeIcon icon={faTrophy} style={{ color: 'var(--gold)' }} /></span>
                  <span className={s.eventName}>{event.eventName}</span>
                </div>

                <button
                  className={s.genBtn}
                  onClick={() => setSelected({ winner, event })}
                >
                  <FontAwesomeIcon icon={faGraduationCap} style={{ marginRight: '6px' }} /> Generate Certificate
                </button>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {selected && (
        <CertificateModal
          winner={selected.winner}
          event={selected.event}
          onClose={() => setSelected(null)}
        />
      )}

      {showEditor && (
        <CertificateTemplateEditor
          template={certificateTemplate}
          initialLayout={certificateLayout}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  )
}
