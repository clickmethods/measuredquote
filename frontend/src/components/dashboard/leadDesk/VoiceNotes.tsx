import { useRef, useState } from 'react'
import { Mic, MicOff, Sparkles } from 'lucide-react'
import { structureSiteNote } from '../../../lib/leadAI'

interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

interface SpeechRecognitionEventLike {
  resultIndex: number
  results: { [i: number]: { isFinal: boolean; 0: { transcript: string } }; length: number }
}

function getCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as Record<string, new () => SpeechRecognitionLike>
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

interface Props {
  /** Receives the structured note; parent decides whether to save it */
  onNote: (text: string) => void
}

/**
 * Voice-to-notes: dictate on site (browser speech recognition, Chrome/Edge/
 * Safari), and the transcript is tagged with gates, footage, slope, HOA,
 * permits, etc. The result drops into the note box for review before saving.
 */
export default function VoiceNotes({ onNote }: Props) {
  const Ctor = getCtor()
  const [listening, setListening] = useState(false)
  const [finalText, setFinalText] = useState('')
  const [interim, setInterim] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recRef = useRef<SpeechRecognitionLike | null>(null)
  const finalRef = useRef('')

  if (!Ctor) {
    return (
      <p className="text-[11px] text-[#94A3B8]">
        Voice notes need Chrome, Edge or Safari. You can still type notes above.
      </p>
    )
  }

  function start() {
    if (!Ctor) return
    const rec = new Ctor()
    rec.lang = 'en-US'
    rec.continuous = true
    rec.interimResults = true
    finalRef.current = ''
    setFinalText('')
    setInterim('')
    setError(null)
    rec.onresult = (e) => {
      let live = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) finalRef.current += r[0].transcript + ' '
        else live += r[0].transcript
      }
      setFinalText(finalRef.current)
      setInterim(live)
    }
    rec.onerror = () => {
      setError('Microphone unavailable. Check browser permissions.')
      setListening(false)
    }
    rec.onend = () => {
      setListening(false)
      setInterim('')
      const text = finalRef.current.trim()
      if (text) onNote(structureSiteNote(text))
    }
    recRef.current = rec
    setListening(true)
    rec.start()
  }

  function stop() {
    recRef.current?.stop()
  }

  return (
    <div className="mt-3 border border-[#E2E8F0] rounded-[10px] p-3 bg-[#FAFBFC]">
      <div className="flex items-center gap-2">
        <button
          onClick={listening ? stop : start}
          className={
            'flex items-center gap-1.5 px-3 py-2 rounded-[6px] text-xs font-medium transition-colors ' +
            (listening ? 'bg-[#DC2626] text-white animate-pulse' : 'bg-[#0F172A] text-white hover:bg-[#1E293B]')
          }
        >
          {listening ? <MicOff size={13} /> : <Mic size={13} />}
          {listening ? 'Stop & tag note' : 'Dictate site note'}
        </button>
        <span className="text-[11px] text-[#64748B] flex items-center gap-1">
          <Sparkles size={11} /> Tags gates, footage, slope, HOA, permits
        </span>
      </div>
      {(listening || finalText) && (
        <p className="text-xs text-[#334155] mt-2 leading-relaxed">
          {finalText}
          <span className="text-[#94A3B8]">{interim}</span>
        </p>
      )}
      {error && <p className="text-[11px] text-[#DC2626] mt-2">{error}</p>}
    </div>
  )
}
