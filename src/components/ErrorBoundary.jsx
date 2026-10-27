import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTriangleExclamation, faRotateRight } from '@fortawesome/free-solid-svg-icons'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('CultureSync Error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '100vh', gap: '16px',
          background: 'var(--bg)', color: 'var(--text)', textAlign: 'center', padding: '24px',
        }}>
          <div style={{ fontSize: 48 }}>
            <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: 'var(--red)' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>Something went wrong</h2>
          <p style={{ color: 'var(--muted)', maxWidth: 400, lineHeight: 1.6 }}>
            An unexpected error occurred. Please refresh the page to continue.
          </p>
          <pre style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '12px 16px', fontSize: 12,
            color: 'var(--red)', maxWidth: 500, overflow: 'auto', textAlign: 'left',
          }}>
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px', borderRadius: 8,
              background: 'linear-gradient(135deg, #a07830, #c9a84c)',
              border: 'none', color: '#0e0e10', fontWeight: 700,
              cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <FontAwesomeIcon icon={faRotateRight} /> Reload Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
