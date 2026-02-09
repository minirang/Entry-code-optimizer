export type VariableType = 'variable' | 'list' | 'timer' | 'answer' | 'slide'

export interface BaseVariableData {
  id: string
  variableType: VariableType
  name: string
  value?: unknown
  visible: boolean
  x: number
  y: number
  isCloud: boolean
  isRealTime: boolean
  cloudDate?: false
  object: string | null
}

export interface VariableData extends BaseVariableData {
  variableType: 'variable'
}

export interface ListVariableData extends BaseVariableData {
  variableType: 'list'
  array: ArrayData[]
  width?: number
  height?: number
}

export interface TimerVariableData extends BaseVariableData {
  variableType: 'timer'
}

export interface AnswerVariableData extends BaseVariableData {
  variableType: 'answer'
}

export interface SlideVariableData extends BaseVariableData {
  variableType: 'slide'
  minValue: number
  maxValue: number
}

export interface ArrayData {
  data: unknown
}
