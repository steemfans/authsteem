import { OperationValue } from './OperationValue'
import operationsData from '@/data/operations.json'
import { useAuthStore } from '@/stores/auth'

type OpSchema = Record<string, { type?: string; name?: string; defaultValue?: unknown }>
type OperationsMap = Record<string, { name: string; authority?: string; schema: OpSchema }>

const operations = operationsData as OperationsMap

export type OperationTuple = [string, Record<string, unknown>]

interface OperationItemProps {
  operation: OperationTuple
}

export function OperationItem({ operation }: OperationItemProps) {
  const username = useAuthStore((s) => s.username)
  const [opName, opData] = operation
  const meta = operations[opName]
  const schema = meta?.schema ?? {}

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="px-3 py-2 bg-muted/50 border-b">
        <h4 className="font-medium text-sm m-0">
          {meta?.name ?? opName}
        </h4>
      </div>
      <div className="px-3 py-2 space-y-2">
        {Object.entries(opData).map(([key, value]) => {
          const fieldSchema = schema[key] ?? {}
          const label = (fieldSchema as { name?: string }).name ?? key
          return (
            <p key={key} className="text-sm m-0">
              <span className="font-medium block text-muted-foreground mb-0.5">{label}</span>
              <OperationValue
                value={value}
                schema={fieldSchema}
                username={username}
              />
            </p>
          )
        })}
      </div>
    </div>
  )
}
