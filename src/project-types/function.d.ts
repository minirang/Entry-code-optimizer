export type FunctionType = 'normal' | 'value'

export interface FunctionData {
  id: string
  content: string
  type: FunctionType
  useLocalVariables: boolean
  localVariables?: LocalVariableData[]
}

export interface LocalVariableData {
  id: string
  name: string
  value: unknown
}
