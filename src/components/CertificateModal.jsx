import React from 'react'
import { useSelector } from 'react-redux'
import { DEFAULT_CERTIFICATE_LAYOUT, buildCertificateData, renderCertificateText } from '../utils/certificateLayout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMasksTheater, faPrint, faXmark } from '@fortawesome/free-solid-svg-icons'
import s from './CertificateModal.module.css'

export default function CertificateModal({ winner, event, onClose }) {
  const template = useSelector(st => st.ui.certificateTemplate)
  const layout = useSelector(st => st.ui.certificateLayout) || DEFAULT_CERTIFICATE_LAYOUT

  if (!winner || !event) return null

  const data = buildCertificateData(winner, event)

  function handlePrint() {
    window.print()
  }

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.shell} onClick={e => e.stopPropagation()}>

        {/* Toolbar — hidden on print */}
        <div className={s.toolbar}>
          <span className={s.toolbarTitle}>Certificate Preview</span>
          <div className={s.toolbarActions}>
            <button className={s.printBtn} onClick={handlePrint}><FontAwesomeIcon icon={faPrint} style={{ marginRight: '6px' }} /> Print / Save as PDF</button>
            <button className={s.closeBtn} onClick={onClose}><FontAwesomeIcon icon={faXmark} /></button>
          </div>
        </div>

        {/* Certificate — this is what prints */}
        <div className={s.certWrap}>
          <div
            className={s.cert}
            id="certificate-print-area"
            style={template ? {
              backgroundImage: `url(${template})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            } : undefined}
          >
            <div
              className={s.certBorder}
              style={template ? {
                background: 'rgba(10,10,12,0.58)',
                backdropFilter: 'blur(1px)',
              } : undefined}
            >
              <div className={s.corner} data-pos="tl" />
              <div className={s.corner} data-pos="tr" />
              <div className={s.corner} data-pos="bl" />
              <div className={s.corner} data-pos="br" />

              <div className={s.emblem}><FontAwesomeIcon icon={faMasksTheater} /></div>

              {layout.map(el => (
                <div
                  key={el.id}
                  className={s.field}
                  style={{
                    position: 'absolute',
                    left: `${el.x}%`,
                    top: `${el.y}%`,
                    maxWidth: `${el.maxWidth || 80}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: `${el.fontSize}px`,
                    fontWeight: el.bold ? 700 : 400,
                    fontStyle: el.italic ? 'italic' : 'normal',
                    color: el.color,
                    fontFamily: el.font === 'display' ? 'var(--font-display)' : 'inherit',
                    textAlign: 'center',
                    lineHeight: 1.3,
                    whiteSpace: 'pre-wrap',
                    borderTop: el.borderTop ? `1px solid ${el.color}` : 'none',
                    paddingTop: el.borderTop ? '8px' : '0',
                    width: el.borderTop ? '150px' : 'auto',
                    letterSpacing: el.letterSpacing || 'normal',
                    textTransform: el.textTransform || 'none',
                  }}
                >
                  {renderCertificateText(el.text, data)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
