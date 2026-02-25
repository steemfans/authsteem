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
      <div className="px-3 py-2">
        <table className="w-full text-sm border-collapse">
          <tbody>
            {Object.entries(opData).map(([key, value]) => {
              const fieldSchema = schema[key] ?? {}
              const label = (fieldSchema as { name?: string }).name ?? key
              return (
                <tr key={key} className="border-b border-border/50 last:border-b-0">
                  <td className="py-2 pr-4 align-top w-[1%] whitespace-nowrap text-xs font-medium text-muted-foreground">
                    {label}
                  </td>
                  <td className="py-2 align-top text-foreground text-center">
                    <OperationValue
                      value={value}
                      schema={fieldSchema}
                      username={username}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
