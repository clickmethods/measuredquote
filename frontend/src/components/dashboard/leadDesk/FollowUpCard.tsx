import { useMemo, useState } from 'react'
import { Sparkles, MessageSquare, Mail, Copy, CheckCircle2, Clock3 } from 'lucide-react'
import type { Lead } from '../../../data/mockLeads'
import { buildFollowUpDraft } from '../../../lib/leadAI'

interface Props {
  lead: Lead
  companyName: string
  now: Date
  /** Called after the contractor sends via their own phone/email app */
  onSent: (channel: 'sms' | 'email', message: string) => Promise<void> | void
  onSnooze: () => void
}

/**
 * Follow-up assistant: drafts a message for a lead that went quiet, in the
 * lead's language. The contractor edits it, then sends it from their own
 * phone or email (sms:/mailto: links), so replies come straight back to them.
 * Sending logs a note and moves the lead to Contacted.
 */
export default function FollowUpCard({ lead, companyName, now, onSent, onSnooze }: Props) {
  const draft = useMemo(() => buildFollowUpDraft(lead, companyName, now), [lead, companyName, now])
  const [channel, setChannel] = useState<'sms' | 'email'>(lead.phone ? 'sms' : 'email')
  const [sms, setSms] = useState(draft.sms)
  const [emailBody, setEmailBody] = useState(draft.emailBody)
  const [done, setDone] = useState(false)
  const [copied, setCopied] = useState(false)

  const message = channel === 'sms' ? sms : emailBody
  const phoneDigits = lead.phone.replace(/[^\d+]/g, '')
  const href =
    channel === 'sms'
      ? `sms:${phoneDigits}?&body=${encodeURIComponent(sms)}`
      : `mailto:${lead.email}?subject=${encodeURIComponent(draft.emailSubject)}&body=${encodeURIComponent(emailBody)}`

  async function handleSend() {
    window.location.href = href
    setDone(true)
    await onSent(channel, message)
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard blocked; user can select the text manually
    }
  }

  if (done) {
    return (
      <div className="border border-[#BBF7D0] bg-[#F0FDF4] rounded-[12px] p-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#16A34A]" />
          <p className="text-sm font-medium text-[#15803D]">Follow-up logged, lead moved to Contacted</p>
        </div>
        <p className="text-xs text-[#64748B] mt-1.5 ml-6">
          Your {channel === 'sms' ? 'messages' : 'email'} app opened with the draft. Replies come straight to you.
        </p>
      </div>
    )
  }

  return (
    <div className="border border-[#FDE68A] bg-[#FFFBEB] rounded-[12px] p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0F172A] text-white text-[10px] font-semibold uppercase tracking-wide">
          <Sparkles size={10} />
          Draft
        </span>
        <p className="text-sm font-semibold text-[#0F172A]">Suggested follow-up</p>
        <span className="ml-auto text-[11px] text-[#B45309] font-medium whitespace-nowrap">
          quiet {draft.daysSilent}d
        </span>
      </div>
      <p className="text-[11px] text-[#64748B] mb-3">{draft.reason}</p>

      <div className="flex items-center gap-1 bg-white rounded-lg p-0.5 border border-[#E2E8F0] w-fit mb-2.5">
        {(['sms', 'email'] as const).map((c) => (
          <button
            key={c}
            onClick={() => setChannel(c)}
            disabled={c === 'sms' ? !lead.phone : !lead.email}
            className={
              'px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 disabled:opacity-40 ' +
              (channel === c ? 'bg-[#0F172A] text-white shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]')
            }
          >
            {c === 'sms' ? <MessageSquare size={12} /> : <Mail size={12} />}
            {c === 'sms' ? 'Text' : 'Email'}
          </button>
        ))}
      </div>

      {channel === 'email' && (
        <p className="text-xs text-[#475569] mb-2 font-medium">Subject: {draft.emailSubject}</p>
      )}

      <textarea
        value={message}
        onChange={(e) => (channel === 'sms' ? setSms(e.target.value) : setEmailBody(e.target.value))}
        rows={channel === 'sms' ? 4 : 7}
        className="w-full px-3 py-2.5 border-[1.5px] border-[#E2E8F0] rounded-[10px] text-[13px] leading-relaxed text-[#334155] focus:outline-none focus:border-[#3B82F6] focus:ring-[3px] focus:ring-[#DBEAFE] bg-white resize-y"
      />

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={handleSend}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#16A34A] text-white text-sm font-medium rounded-[8px] hover:bg-[#15803D] transition-colors"
        >
          {channel === 'sms' ? <MessageSquare size={14} /> : <Mail size={14} />}
          {channel === 'sms' ? 'Open in Messages' : 'Open in Email'}
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-2.5 border-[1.5px] border-[#E2E8F0] text-[#475569] text-sm font-medium rounded-[8px] hover:bg-white transition-colors"
          title="Copy message"
        >
          {copied ? <CheckCircle2 size={14} className="text-[#16A34A]" /> : <Copy size={14} />}
        </button>
        <button
          onClick={onSnooze}
          className="flex items-center gap-1.5 px-3 py-2.5 border-[1.5px] border-[#E2E8F0] text-[#475569] text-sm font-medium rounded-[8px] hover:bg-white transition-colors"
          title="Hide for now"
        >
          <Clock3 size={14} />
          Later
        </button>
      </div>
      <p className="text-[10px] text-[#94A3B8] mt-2">
        Written in {lead.language === 'es' ? 'Spanish' : 'English'} from this lead's estimate. Edit anything before sending.
      </p>
    </div>
  )
}
