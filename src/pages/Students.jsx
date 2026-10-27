import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setDepartmentFilter, setSearchQuery, deleteStudent } from '../store/slices/studentsSlice'
import { openModal } from '../store/slices/uiSlice'
import { toast } from '../store/slices/toastSlice'
import ConfirmDialog from '../components/ConfirmDialog'
import usePageTitle from '../hooks/usePageTitle'
import useDebounce from '../hooks/useDebounce'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
import s from './Students.module.css'

const DEPTS = ['All', 'Computer Science', 'Commerce', 'Physics', 'Tamil', 'Maths', 'Chemistry']

const COLORS = {
  orange: '#f06a35',
  blue:   '#4e9af1',
  green:  '#3ecf8e',
  gold:   '#c9a84c',
  purple: '#9b7cf7',
}

export default function Students() {
  usePageTitle('Students')
  const dispatch = useDispatch()
  const { list, departmentFilter, searchQuery } = useSelector(s => s.students)
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const debouncedSearch = useDebounce(localSearch, 250)

  function handleDelete() {
    dispatch(deleteStudent(deleteTarget.id || deleteTarget._id))
    dispatch(toast.info(`${deleteTarget.name} has been deleted.`))
    setDeleteTarget(null)
  }

  React.useEffect(() => {
    dispatch(setSearchQuery(debouncedSearch))
  }, [debouncedSearch, dispatch])

  const filtered = list.filter(st => {
    const matchDept = departmentFilter === 'All' || st.department === departmentFilter
    const matchQ    = !searchQuery
      || st.name.toLowerCase().includes(searchQuery.toLowerCase())
      || st.regNo.toLowerCase().includes(searchQuery.toLowerCase())
    return matchDept && matchQ
  })

  return (
    <div className={`${s.page} page-enter`}>

      {/* Controls */}
      <div className={s.controls}>
        <div className={s.left}>
          <div className={s.searchBox}>
            <span className={s.searchIcon}>⌕</span>
            <input
              className={s.searchInput}
              placeholder="Search by name or reg. number…"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
            />
            {localSearch && (
              <button className={s.clearBtn} onClick={() => { setLocalSearch(''); dispatch(setSearchQuery('')) }}>✕</button>
            )}
          </div>
          <select
            className={s.select}
            value={departmentFilter}
            onChange={e => dispatch(setDepartmentFilter(e.target.value))}
          >
            {DEPTS.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
          </select>
        </div>
        <div className={s.right}>
          <span className={s.resultCount}>{filtered.length} students</span>
          <button className={s.addBtn} onClick={() => dispatch(openModal({ type: 'addStudent' }))}>+ Add Student</button>
        </div>
      </div>

      {/* Table */}
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Student</th>
              <th>Reg. Number</th>
              <th>Department</th>
              <th>Mobile</th>
              <th>Date of Birth</th>
              <th>Registrations</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(st => {
              const color = COLORS[st.color] || COLORS.gold
              return (
                <tr key={st.id}>
                  <td>
                    <div className={s.studentCell}>
                      <div
                        className={s.avatar}
                        style={{ background: color + '22', color, borderColor: color + '44' }}
                      >
                        {st.initials}
                      </div>
                      <span className={s.studentName}>{st.name}</span>
                    </div>
                  </td>
                  <td><span className={s.regNo}>{st.regNo}</span></td>
                  <td>
                    <span className={s.deptBadge}>{st.department}</span>
                  </td>
                  <td><span className={s.muted}>{st.mobile}</span></td>
                  <td><span className={s.muted}>{st.dob || '—'}</span></td>
                  <td>
                    <span className={
                      st.events >= 3 ? `${s.evtBadge} ${s.evtHigh}` :
                      st.events >= 2 ? `${s.evtBadge} ${s.evtMid}`  :
                      `${s.evtBadge} ${s.evtLow}`
                    }>
                      {st.events} event{st.events !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td>
                    <span className={st.status === 'active' ? `${s.statusBadge} ${s.active}` : `${s.statusBadge} ${s.pending}`}>
                      <span className={s.statusDot} />
                      {st.status === 'active' ? 'Active' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className={s.actions}>
                      <button
                        className={s.actionBtn}
                        title="View profile"
                        onClick={() => dispatch(openModal({ type: 'viewStudent', payload: st }))}
                      ><FontAwesomeIcon icon={faEye} style={{ color: 'var(--blue)' }} /></button>
                      <button
                        className={s.actionBtn}
                        title="Edit"
                        onClick={() => dispatch(openModal({ type: 'addStudent', payload: st }))}
                      ><FontAwesomeIcon icon={faPen} style={{ color: 'var(--green)' }} /></button>
                      <button
                        className={s.actionBtn}
                        title="Delete"
                        onClick={() => setDeleteTarget(st)}
                      ><FontAwesomeIcon icon={faTrash} style={{ color: 'var(--orange)' }} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className={s.empty}>
            <span>🔍</span>
            <p>No students found matching your search.</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Student?"
        message={`Are you sure you want to delete ${deleteTarget?.name} (${deleteTarget?.regNo})? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
