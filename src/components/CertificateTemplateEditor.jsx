import React, { useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { setCertificateLayout, resetCertificateLayout } from '../store/slices/uiSlice'
import { toast } from '../store/slices/toastSlice'
import {
  DEFAULT_CERTIFICATE_LAYOUT,
  CERTIFICATE_TOKENS,
  buildCertificateData,
  renderCertificateText,
} from '../utils/certificateLayout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPalette, faArrowPointer, faXmark, faMedal, faIcons } from '@fortawesome/free-solid-svg-icons'
import s from './CertificateTemplateEditor.module.css'

// Sample data so the editor shows something realistic instead of raw tokens
const SAMPLE_DATA = buildCertificateData(
  { name: 'Priya Ramanathan', department: 'B.Sc Computer Science', medal: <FontAwesomeIcon icon={faMedal} style={{ color: '#FFD700' }} />, rank: 1 },
  { eventName: 'Classical Dance Solo', emoji: <FontAwesomeIcon icon={faIcons} /> }
)

export default function CertificateTemplateEditor({ template, initialLayout, onClose }) {
  const dispatch = useDispatch()
  const [elements, setElements] = useState(initialLayout || DEFAULT_CERTIFICATE_LAYOUT)
  const [selectedId, setSelectedId] = useState(null)
  const canvasRef = useRef(null)
  const dragState = useRef(null)

  const selected = elements.find(el => el.id === selectedId) || null

  function updateElement(id, patch) {
    setElements(prev => prev.map(el => (el.id === id ? { ...el, ...patch } : el)))
  }

  function handlePointerDown(e, id) {
    e.preventDefault()
    e.stopPropagation()
    setSelectedId(id)
    dragState.current = { id }
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  function handlePointerMove(e) {
    const drag = dragState.current
    const canvas = canvasRef.current
    if (!drag || !canvas) return
    const rect = canvas.getBoundingClientRect()
    let x = ((e.clientX - rect.left) / rect.width) * 100
    let y = ((e.clientY - rect.top) / rect.height) * 100
    x = Math.min(98, Math.max(2, x))
    y = Math.min(98, Math.max(2, y))
    updateElement(drag.id, { x, y })
  }

  function handlePointerUp() {
    dragState.current = null
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
  }

  function insertToken(token) {
    if (!selected) return
    updateElement(selected.id, { text: `${selected.text}${selected.text ? ' ' : ''}${token}` })
  }

  function handleSave() {
    dispatch(setCertificateLayout(elements))
    dispatch(toast.success('Certificate design saved.'))
    onClose()
  }

  function handleResetAll() {
    setElements(DEFAULT_CERTIFICATE_LAYOUT)
    setSelectedId(null)
    dispatch(resetCertificateLayout())
    dispatch(toast.info('Certificate design reset to default.'))
  }

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.shell} onClick={e => e.stopPropagation()}>

        <div className={s.toolbar}>
          <span className={s.toolbarTitle}><FontAwesomeIcon icon={faPalette} style={{ color: 'var(--gold)', marginRight: '8px' }} /> Edit Certificate Design</span>
          <div className={s.toolbarActions}>
            <button className={s.resetBtn} onClick={handleResetAll}>Reset to Default</button>
            <button className={s.saveBtn} onClick={handleSave}>Save Design</button>
            <button className={s.closeBtn} onClick={onClose}><FontAwesomeIcon icon={faXmark} /></button>
          </div>
        </div>

        <div className={s.body}>
          <div className={s.canvasWrap}>
            <p className={s.hint}>Drag any text on the certificate to reposition it. Click it to edit text, size, and color.</p>
            <div
              ref={canvasRef}
              className={s.canvas}
              style={template ? {
                backgroundImage: `url(${template})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              } : undefined}
              onClick={() => setSelectedId(null)}
            >
              <div className={s.canvasBorder} style={template ? { background: 'rgba(10,10,12,0.5)' } : undefined}>
                {elements.map(el => (
                  <div
                    key={el.id}
                    className={`${s.field} ${selectedId === el.id ? s.fieldSelected : ''}`}
                    style={{
                      left: `${el.x}%`,
                      top: `${el.y}%`,
                      maxWidth: `${el.maxWidth || 80}%`,
                      fontSize: `${el.fontSize}px`,
                      fontWeight: el.bold ? 700 : 400,
                      fontStyle: el.italic ? 'italic' : 'normal',
                      color: el.color,
                      fontFamily: el.font === 'display' ? 'var(--font-display)' : 'inherit',
                      borderTop: el.borderTop ? `1px solid ${el.color}` : 'none',
                      paddingTop: el.borderTop ? '8px' : '0',
                      width: el.borderTop ? '150px' : 'auto',
                      letterSpacing: el.letterSpacing || 'normal',
                      textTransform: el.textTransform || 'none',
                    }}
                    onPointerDown={e => handlePointerDown(e, el.id)}
                  >
                    {renderCertificateText(el.text, SAMPLE_DATA)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={s.sidebar}>
            {!selected ? (
              <div className={s.emptyState}>
                <span className={s.emptyIcon}><FontAwesomeIcon icon={faArrowPointer} style={{ color: 'var(--gold-dk)' }} /></span>
                <p>Click any text on the certificate to edit it.</p>
              </div>
            ) : (
              <>
                <div className={s.fieldGroupLabel}>Editing: {selected.id.replace(/([A-Z])/g, ' $1')}</div>

                <label className={s.label}>Text</label>
                <textarea
                  className={s.textarea}
                  rows={3}
                  value={selected.text}
                  onChange={e => updateElement(selected.id, { text: e.target.value })}
                />

                <div className={s.tokenRow}>
                  {CERTIFICATE_TOKENS.map(t => (
                    <button
                      key={t.token}
                      type="button"
                      className={s.tokenChip}
                      title={t.label}
                      onClick={() => insertToken(t.token)}
                    >
                      {t.token}
                    </button>
                  ))}
                </div>

                <label className={s.label}>Font Size ({selected.fontSize}px)</label>
                <input
                  type="range"
                  min="8"
                  max="48"
                  value={selected.fontSize}
                  onChange={e => updateElement(selected.id, { fontSize: Number(e.target.value) })}
                />

                <label className={s.label}>Color</label>
                <input
                  type="color"
                  className={s.colorInput}
                  value={selected.color}
                  onChange={e => updateElement(selected.id, { color: e.target.value })}
                />

                <div className={s.toggleRow}>
                  <label className={s.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={selected.bold}
                      onChange={e => updateElement(selected.id, { bold: e.target.checked })}
                    />
                    Bold
                  </label>
                  <label className={s.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={selected.italic}
                      onChange={e => updateElement(selected.id, { italic: e.target.checked })}
                    />
                    Italic
                  </label>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
