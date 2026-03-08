import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { encodeOps } from '@/lib/steem-uri'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslation } from '@/i18n'
import operationsData from '@/data/operations.json'

type OpSchema = Record<string, { type: string; defaultValue?: unknown }>
type OperationsMap = Record<
  string,
  { name: string; authority: string; description?: string; schema: OpSchema }
>

const operations = operationsData as OperationsMap

function getDefaultValue(def: unknown, type: string): string | number | boolean {
  if (def === undefined || def === null) {
    if (type === 'bool') return false
    if (type === 'int') return 0
    return ''
  }
  if (typeof def === 'boolean' || typeof def === 'number') return def
  return String(def)
}

export function BroadcastOp() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const opKeys = useMemo(() => Object.keys(operations), [])
  const [op, setOp] = useState<string>('')
  const [formData, setFormData] = useState<Record<string, string | number | boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const opMeta = op ? operations[op] : null
  const schema = opMeta?.schema ?? {}

  const schemaEntries = useMemo(() => Object.entries(schema), [op])

  const handleOpChange = (value: string) => {
    setOp(value)
    setError(null)
    if (value) {
      const meta = operations[value]
      const next: Record<string, string | number | boolean> = {}
      for (const [key, def] of Object.entries(meta.schema)) {
        next[key] = getDefaultValue(def.defaultValue, def.type)
      }
      setFormData(next)
    } else {
      setFormData({})
    }
  }

  const updateField = (key: string, value: string) => {
    const def = schema[key]
    if (!def) return
    if (def.type === 'int') {
      const n = parseInt(value, 10)
      setFormData((prev) => ({ ...prev, [key]: isNaN(n) ? 0 : n }))
    } else if (def.type === 'bool') {
      setFormData((prev) => ({ ...prev, [key]: value === 'true' }))
    } else {
      setFormData((prev) => ({ ...prev, [key]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!op) return
    setError(null)
    setIsSubmitting(true)
    try {
      const opDetail: Record<string, unknown> = {}
      for (const [key, val] of Object.entries(formData)) {
        if (val === '' || val === undefined) continue
        if (typeof val === 'string' && val.trim() === '') continue
        opDetail[key] = val
      }
      const ops: [string, Record<string, unknown>][] = [[op, opDetail]]
      const fullUri = await encodeOps(ops)
      const pathPart = fullUri.replace(/^[^:]+:\/\//, '')
      navigate('/' + pathPart)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
    setIsSubmitting(false)
  }

  return (
    <div className="max-w-2xl mx-auto w-full p-4 flex flex-col gap-6">
      <div>
        <div className="leading-none font-semibold">{t('broadcastOp.title')}</div>
        <p className="text-muted-foreground text-sm mt-2">{t('broadcastOp.description')}</p>
      </div>
      <div>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="op">{t('broadcastOp.selectOp')}</Label>
              <Select
                value={op || '__none'}
                onValueChange={(v) => handleOpChange(v === '__none' ? '' : v)}
              >
                <SelectTrigger id="op">
                  <SelectValue placeholder={t('broadcastOp.selectOp')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none" className="text-muted-foreground">
                    {t('broadcastOp.selectOneOp')}
                  </SelectItem>
                  {opKeys.map((key) => (
                    <SelectItem key={key} value={key}>
                      {operations[key].name} ({key})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {op && schemaEntries.length > 0 && (
              <>
                <div className="space-y-3 pt-2">
                  {schemaEntries.map(([key, def]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>
                        {key}
                        {def.type !== 'string' && def.type !== 'account' && (
                          <span className="text-muted-foreground text-xs ml-1">({def.type})</span>
                        )}
                      </Label>
                      {def.type === 'bool' ? (
                        <Select
                          value={String(formData[key])}
                          onValueChange={(v) => updateField(key, v)}
                        >
                          <SelectTrigger id={key}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">true</SelectItem>
                            <SelectItem value="false">false</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id={key}
                          type={def.type === 'int' ? 'number' : 'text'}
                          value={String(formData[key] ?? '')}
                          onChange={(e) => updateField(key, e.target.value)}
                          placeholder={def.defaultValue !== undefined ? String(def.defaultValue) : ''}
                        />
                      )}
                    </div>
                  ))}
                </div>
                {error && <p className="text-destructive text-sm">{error}</p>}
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? t('broadcastOp.opening') : t('broadcastOp.openSign')}
                </Button>
              </>
            )}
          </form>
      </div>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link to="/dev-tools" className="underline">{t('devTools.backToDevTools')}</Link>
        {' · '}
        <Link to="/" className="underline">
          {t('common.backToHome')}
        </Link>
      </p>
    </div>
  )
}
