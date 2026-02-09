//@ts-check

import { extractProjectJson } from './src/extract.js'
import { optimize } from './src/optimizer/index.js'

const fileInput = /** @type {HTMLInputElement} */(
  document.getElementById('file_upload')
)

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
    signal
  })

  const optimized = optimize(project, console.log)
  console.log(optimized)
})
