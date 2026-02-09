//@ts-check

import { extractProjectJson } from './src/extract.js'
import { optimize } from './src/optimizer/index.js'

const fileInput = /** @type {HTMLInputElement} */(
  document.getElementById('file_upload')
)

/**
 * @param {number} progress
 */
function onProgress(progress) {
  console.log('추출 %d%%', progress * 100)
}

/**
 * @param {string} message
 * @param {string[]} stack
 */
function log(message, stack) {
  console.log('%s\n%s', message, stack.join('\n'))
}

/**
 * 파일이 로딩 중일 때 다른 파일을 선택하면 abort됨.
 * @type {AbortController | undefined}
 */
let controller

fileInput.addEventListener('change', async () => {
  controller?.abort()
  const { signal } = controller = new AbortController

  const pack = fileInput.files?.[0]
  if (!pack) return

  const project = await extractProjectJson(pack, {
    onProgress,
    signal,
  })

  const optimized = optimize(project, log)
  console.log(optimized)
})
