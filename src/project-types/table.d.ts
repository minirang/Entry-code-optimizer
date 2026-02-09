export interface TableData {
  id: string
  name: string
  fields: string[]
  data: TableInnerData[]
  origin: OriginData[]
  chart: ChartData[]
  summary?: string
}

export interface TableInnerData {
  key: string
  value: unknown[]
}

export type OriginData = unknown[]

/**
 * @todo 타입지정
 */
export interface ChartData {
  title: string
}
