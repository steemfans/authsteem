import { formatAmount, formatTime } from '@/lib/operation-utils'
import { useSettingsStore } from '@/stores/settings'
import type { DynamicGlobalProperties } from '@/stores/settings'

interface SchemaField {
  type?: string
  name?: string
  defaultValue?: unknown
}

interface OperationValueProps {
  value: unknown
  schema: SchemaField
  username?: string | null
}

function prettyJson(val: unknown): string {
  try {
    const obj = typeof val === 'string' ? JSON.parse(val) : val
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(val)
  }
}

export function OperationValue({
  value,
  schema,
  username,
}: OperationValueProps) {
  const properties = useSettingsStore((s) => s.properties) as DynamicGlobalProperties
  const vestsToSP = properties.total_vesting_fund_steem && properties.total_vesting_shares
    ? parseFloat(String(properties.total_vesting_fund_steem)) / parseFloat(String(properties.total_vesting_shares))
    : 0

  const type = schema.type ?? 'string'
  const displayValue = value ?? schema.defaultValue

  if (displayValue === '__signer') {
    return <span className="italic">{username ? username : 'you'}</span>
  }

  if (displayValue === null || displayValue === undefined || displayValue === '') {
    if (type !== 'bool') return <span className="italic text-muted-foreground">empty</span>
  }

  if (Array.isArray(displayValue)) {
    if (displayValue.length === 0) return <span className="italic text-muted-foreground">empty</span>
    return (
      <pre className="text-xs bg-muted p-2 rounded mt-1 max-h-32 overflow-auto">
        {JSON.stringify(displayValue, null, 2)}
      </pre>
    )
  }

  if (typeof displayValue === 'object') {
    return (
      <pre className="text-xs bg-muted p-2 rounded mt-1 max-h-32 overflow-auto">
        {prettyJson(displayValue)}
      </pre>
    )
  }

  switch (type) {
    case 'account':
      return (
        <a
          href={`https://steemit.com/@${displayValue}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {String(displayValue)}
        </a>
      )
    case 'amount':
      return <span>{formatAmount(String(displayValue), vestsToSP)}</span>
    case 'bool':
      return <span>{String(displayValue)}</span>
    case 'json':
      return (
        <pre className="text-xs bg-muted p-2 rounded mt-1 max-h-32 overflow-auto inline-block">
          {prettyJson(displayValue)}
        </pre>
      )
    case 'time':
      return <span>{formatTime(displayValue as string | number)}</span>
    default:
      return <span>{String(displayValue)}</span>
  }
}
