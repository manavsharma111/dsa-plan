import React, { useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import PatternBreakdown from './PatternBreakdown'
import KeyConcepts from './KeyConcepts'
import PatternSection from './PatternSection'
import { patternsData } from '../data/patternsData'

export default function PatternsMasterView() {
  const { patternId } = useParams()
  const location = useLocation()

  useEffect(() => {
    // If a patternId was provided in the route (e.g. /pattern/5) or as hash (#pattern-5)
    const targetId = patternId || (location.hash ? location.hash.replace('#pattern-', '') : null)
    if (targetId) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`pattern-${targetId}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [patternId, location.hash])

  return (
    <>
      <PatternBreakdown />
      <KeyConcepts />

      {/* All 28 Patterns */}
      <div className="space-y-4">
        {patternsData.map((pattern) => (
          <PatternSection key={pattern.id} pattern={pattern} />
        ))}
      </div>
    </>
  )
}
