import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    notifPanelOpen: false,
    modal: null,
    sidebarCollapsed: false,
    // Admin-uploaded certificate background (data URL). When set, the
    // CertificateModal renders this image full-bleed behind the winner's
    // name/details instead of the default emblem design.
    certificateTemplate: null,
    // Admin-customised positions/text/styling for every field on the
    // certificate (name, department, headings, signatures, etc). When
    // null, CertificateModal falls back to DEFAULT_CERTIFICATE_LAYOUT.
    certificateLayout: null,
  },
  reducers: {
    toggleNotifPanel(state) { state.notifPanelOpen = !state.notifPanelOpen },
    closeNotifPanel(state)  { state.notifPanelOpen = false },
    openModal(state, action)  { state.modal = action.payload },
    closeModal(state)         { state.modal = null },
    toggleSidebar(state)    { state.sidebarCollapsed = !state.sidebarCollapsed },
    setCertificateTemplate(state, action) { state.certificateTemplate = action.payload },
    clearCertificateTemplate(state)       { state.certificateTemplate = null },
    setCertificateLayout(state, action)   { state.certificateLayout = action.payload },
    resetCertificateLayout(state)         { state.certificateLayout = null },
  },
})

export const {
  toggleNotifPanel, closeNotifPanel,
  openModal, closeModal, toggleSidebar,
  setCertificateTemplate, clearCertificateTemplate,
  setCertificateLayout, resetCertificateLayout,
} = uiSlice.actions
export default uiSlice.reducer
