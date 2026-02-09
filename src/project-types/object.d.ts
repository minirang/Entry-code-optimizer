export type ObjectType = 'sprite' | 'textBox'
export type RotateMethod = 'free' | 'vertical' | 'none'

export interface BaseObjectData {
  id: string
  name: string
  objectType: ObjectType
  scene: string
  lock: boolean
  rotateMethod: RotateMethod
  script: string
  sprite: SpriteData
  selectedPictureId?: string
}

export interface SpriteObjectData extends BaseObjectData {
  objectType: 'sprite'
  entity: SpriteEntityData
}

export interface TextBoxObjectData extends BaseObjectData {
  objectType: 'textBox'
  text: string
  entity: TextBoxEntityData
}

export type ObjectData = SpriteObjectData | TextBoxObjectData

export interface SpriteEntityData {
  x: number
  y: number
  regX: number
  regY: number
  scaleX: number
  scaleY: number
  rotation: number
  direction: number
  width: number
  height: number
  font: string
  visible: boolean
}

export interface TextBoxEntityData extends SpriteEntityData {
  colour: string
  text: string
  textAlign: 0 | 1 | 2
  lineBreak: boolean
  bgColor: string
  underLine: boolean
  strike: boolean
  fontSize: number
}

export interface SpriteData {
  pictures: PictureData[]
  sounds: SoundData[]
}

export interface TextBoxSpriteData extends SpriteData {
  pictures: []
  sounds: SoundData[]
}

export interface PictureData {
  id: string
  name: string
  fileurl: string
  thumbUrl: string
  imageType: string
  dimension: DimensionData
}

export interface SoundData {
  id: string
  name: string
  fileurl: string
  duration: number
  ext: string
}

export interface DimensionData {
  width: number
  height: number
}
