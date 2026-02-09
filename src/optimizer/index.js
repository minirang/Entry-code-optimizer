//@ts-check

/** @import { BlockData, FunctionData, ObjectData, ProjectData, SceneData } from '../project-types' */

/**
 * @param {unknown} value
 * @returns {value is BlockData}
 */
const isBlock = value => !!(typeof value == 'object' && value) // temp

/**
 * @param {ProjectData} project
 * @param {(msg: string, stack: string[]) => void} [log]
 */
export function optimize(project, log) {
  fixAllObjects(project, log)
  fixAllFunctions(project, log)
  return project
}

/**
 * @param {ProjectData} project
 * @param {(msg: string, stack: string[]) => void} [log]
 */
function fixAllObjects(project, log) {
  const { objects, scenes } = project

  objects.forEach(obj => {
    const { sceneIdx, objIdx } = findObjectIdx(objects, scenes, obj)
    const scene = scenes[sceneIdx]
    const stack = [
      `장면 #${sceneIdx + 1} ${scene?.name} (${scene?.id})`,
      `오브젝트 #${objIdx + 1} ${obj.name} (${obj.id})`,
    ]

    const script = JSON.parse(obj.script)
    fixScript(project, obj, script, stack, log)
    obj.script = JSON.stringify(script)
  })
}

/**
 * @param {ProjectData} project
 * @param {(msg: string, stack: string[]) => void} [log]
 */
function fixAllFunctions(project, log) {
  const { functions } = project

  functions.forEach((func, funcIdx) => {
    const stack = [
      `함수 #${funcIdx + 1} (${func.id})`,
    ]

    const script = JSON.parse(func.content)
    fixScript(project, func, script, stack, log)
    func.content = JSON.stringify(script)
  })
}

/**
 * @param {ObjectData[]} objects
 * @param {SceneData[]} scenes
 * @param {ObjectData} obj
 */
function findObjectIdx(objects, scenes, obj) {
  const sceneIdx = scenes.findIndex(v => obj.scene == v.id)
  let objIdx = 0
  for (let i = 0; i < objects.length && objects[i] != obj; ++i) {
    if (objects[i]?.scene == obj.scene) ++objIdx
  }

  return { sceneIdx, objIdx }
}

/**
 * @param {ProjectData} project
 * @param {ObjectData | FunctionData} obj
 * @param {BlockData[][]} script
 * @param {string[]} stack
 * @param {string} [label]
 * @param {(msg: string, stack: string[]) => void} [log]
 */
function fixAllBlocks(project, obj, script, stack, label, log) {
  script.forEach((thread, threadIdx) => {
    thread.forEach((block, blockIdx) => {
      fixBlockRecursive(project, obj, script, thread, block, stack.concat(
        `${label} #${threadIdx + 1}`,
        `블록 #${blockIdx + 1} ${block.type} (${block.id})`,
      ), log)
    })
  })
}

/**
 * @param {ProjectData} project
 * @param {ObjectData | FunctionData} obj
 * @param {BlockData[][]} script
 * @param {string[]} stack
 * @param {(msg: string, stack: string[]) => void} [log]
 */
function fixScript(project, obj, script, stack, log) {
  fixAllBlocks(project, obj, script, stack, '스레드', log)
}

/**
 * @param {ProjectData} project
 * @param {ObjectData | FunctionData} obj
 * @param {BlockData[][]} script
 * @param {string[]} stack
 * @param {(msg: string, stack: string[]) => void} [log]
 */
function fixStatements(project, obj, script, stack, log) {
  fixAllBlocks(project, obj, script, stack, '명령문', log)
}

/**
 * @param {ProjectData} project
 * @param {ObjectData | FunctionData} obj
 * @param {BlockData[][]} script
 * @param {BlockData[]} thread
 * @param {BlockData} block
 * @param {string[]} stack
 * @param {(msg: string, stack: string[]) => void} [log]
 */
function fixBlockRecursive(project, obj, script, thread, block, stack, log) {
  fixBlock(project, obj, script, thread, block, stack, log)

  block.params?.forEach((param, i) => {
    if (isBlock(param)) {
      fixBlockRecursive(project, obj, script, thread, param, stack.concat(`매개변수 #${i + 1} ${param.type}`), log)
    }
  })

  if (block.statements) fixStatements(project, obj, block.statements, stack, log)
}

/**
 * @param {ProjectData} project
 * @param {ObjectData | FunctionData} obj
 * @param {BlockData[][]} script
 * @param {BlockData[]} thread
 * @param {BlockData} block
 * @param {string[]} stack
 * @param {(msg: string, stack: string[]) => void} [log]
 */
function fixBlock(project, obj, script, thread, block, stack, log) {
  if (!block.params || !block.statements) return block

  // temp
  if (block.type == 'repeat_while_true') {
    const cond = block.params[0]
    if (isBlock(cond) && cond.type == 'boolean_not' && Array.isArray(cond.params)) {
      const isUntil = block.params[1] == 'until'
      block.params[0] = cond.params[1]
      block.params[1] = isUntil ? 'while' : 'until'
      log?.(
        `'<~이 아니다> ${isUntil ? '이 될 때까지' : '인 동안'} 반복하기' 블록 감지됨`,
        stack,
      )
    }
  }
}
