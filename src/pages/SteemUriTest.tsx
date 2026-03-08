import { useState } from 'react'
import { Link } from 'react-router-dom'
import { decode, encodeOps } from '@/lib/steem-uri'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslation } from '@/i18n'

export type InputType = 'op' | 'ops' | 'tx'
type OpEntry = [string, Record<string, unknown>]

function parseOp(raw: string): OpEntry {
  const trimmed = raw.trim()
  if (!trimmed) throw new Error('Empty input')
  const parsed = JSON.parse(trimmed) as unknown
  if (!Array.isArray(parsed) || parsed.length < 2 || typeof parsed[0] !== 'string' || typeof parsed[1] !== 'object' || parsed[1] === null) {
    throw new Error('Input must be a single operation: [opName, opPayload]')
  }
  return parsed as OpEntry
}

function parseOpsInput(raw: string): OpEntry[] {
  const trimmed = raw.trim()
  if (!trimmed) throw new Error('Empty input')
  const parsed = JSON.parse(trimmed) as unknown
  if (!Array.isArray(parsed)) throw new Error('Input must be a JSON array of operations')
  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i]
    if (!Array.isArray(item) || item.length < 2 || typeof item[0] !== 'string' || typeof item[1] !== 'object' || item[1] === null) {
      throw new Error(`Invalid operation at index ${i}: expected [opName, opPayload]`)
    }
  }
  return parsed as OpEntry[]
}

function parseTxInput(raw: string): OpEntry[] {
  const trimmed = raw.trim()
  if (!trimmed) throw new Error('Empty input')
  const parsed = JSON.parse(trimmed) as unknown
  if (typeof parsed !== 'object' || parsed === null) throw new Error('Input must be a transaction object')
  const ops = (parsed as { operations?: unknown }).operations
  if (!Array.isArray(ops)) throw new Error('Transaction must have an operations array')
  for (let i = 0; i < ops.length; i++) {
    const item = ops[i]
    if (!Array.isArray(item) || item.length < 2 || typeof item[0] !== 'string' || typeof item[1] !== 'object' || item[1] === null) {
      throw new Error(`Invalid operation at index ${i}: expected [opName, opPayload]`)
    }
  }
  return ops as OpEntry[]
}

const INPUT_TYPES: InputType[] = ['op', 'ops', 'tx']

export function SteemUriTest() {
  const { t } = useTranslation()
  const [inputType, setInputType] = useState<InputType>('ops')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const getOpsForUri = (): OpEntry[] => {
    if (inputType === 'op') return [parseOp(input)]
    if (inputType === 'ops') return parseOpsInput(input)
    return parseTxInput(input)
  }

  const handleToUri = async () => {
    setError(null)
    setOutput('')
    try {
      const ops = getOpsForUri()
      const uri = await encodeOps(ops)
      setOutput(uri)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleToInput = async () => {
    setError(null)
    setOutput('')
    try {
      const uri = input.trim()
      if (!uri) throw new Error('Empty input')
      const parsed = await decode(uri)
      const tx = parsed?.tx as unknown as { operations?: OpEntry[] } & Record<string, unknown>
      if (inputType === 'op') {
        const ops = tx?.operations
        if (!ops || !Array.isArray(ops) || ops.length === 0) {
          setOutput(JSON.stringify(parsed.tx, null, 2))
          return
        }
        setOutput(JSON.stringify(ops[0], null, 2))
      } else if (inputType === 'ops') {
        const ops = tx?.operations
        if (!ops || !Array.isArray(ops)) {
          setOutput(JSON.stringify(parsed.tx, null, 2))
          return
        }
        setOutput(JSON.stringify(ops, null, 2))
      } else {
        setOutput(JSON.stringify(parsed.tx, null, 2))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const toUriLabel = t(`steemUriTest.toUri.${inputType}`)
  const toInputLabel = t(`steemUriTest.toInput.${inputType}`)

  return (
    <div className="max-w-2xl mx-auto w-full p-4 flex flex-col gap-6">
      <div>
        <h2 className="leading-none font-semibold">{t('steemUriTest.title')}</h2>
        <p className="text-muted-foreground text-sm mt-2">{t('steemUriTest.description')}</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="steem-uri-type">{t('steemUriTest.typeLabel')}</Label>
          <Select value={inputType} onValueChange={(v) => setInputType(v as InputType)}>
            <SelectTrigger id="steem-uri-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INPUT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`steemUriTest.type.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="steem-uri-input">{t('steemUriTest.inputLabel')}</Label>
          <textarea
            id="steem-uri-input"
            className="flex min-h-[140px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
            placeholder={t(`steemUriTest.inputPlaceholder.${inputType}`)}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="default" onClick={handleToUri}>
            {toUriLabel}
          </Button>
          <Button type="button" variant="secondary" onClick={handleToInput}>
            {toInputLabel}
          </Button>
        </div>
        {error && <p className="text-destructive text-sm">{error}</p>}
        {(output || error) && (
          <div className="space-y-2">
            <Label>{t('steemUriTest.outputLabel')}</Label>
            <pre className="rounded-md border border-input bg-muted/50 p-3 text-sm overflow-auto max-h-[280px] font-mono whitespace-pre-wrap break-all">
              {output || (error ? '' : '—')}
            </pre>
          </div>
        )}
      </div>
      <div className="flex gap-4 text-sm text-muted-foreground">
        <Link to="/dev-tools" className="underline">
          {t('devTools.backToDevTools')}
        </Link>
        <Link to="/" className="underline">
          {t('common.backToHome')}
        </Link>
      </div>
    </div>
  )
}
