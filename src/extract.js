// @ts-check
/// <reference path='mod.d.ts' />

import { extract } from 'https://esm.sh/tar-stream@3.1.7'
/** @import { ProjectData } from './project-types' */

const isSupportedNativeGzip = typeof DecompressionStream == 'function'
const fflate = isSupportedNativeGzip || import('https://esm.sh/fflate@0.8.2')

/**
 * @template T
 * @param {Promise<T>} promise
 * @param {AbortSignal} [signal]
 * @returns {Promise<T>}
 */
const withSignal = (promise, signal) => signal ? new Promise((resolve, reject) => {
  if (signal.aborted) return reject(signal.reason)

  const onAbort = () => reject(signal.reason)

  signal.addEventListener('abort', onAbort, { once: true })
  promise
    .finally(() => signal.removeEventListener('abort', onAbort))
    .then(resolve, reject)
}) : promise

/**
 * @param {Blob} blob
 * @param {AbortSignal} [signal]
 * @returns {ReadableStream<Uint8Array>}
 */
function decompressGzip(blob, signal) {
  if (isSupportedNativeGzip) {
    const stream = blob.stream().pipeThrough(new DecompressionStream('gzip'))
    if (signal?.aborted) stream.cancel()

    const onAbort = () => {
      if (!stream.locked) stream.cancel()
    }

    signal?.addEventListener('abort', onAbort, { once: true })

    return stream
  }

  const promises = Promise.all([
    withSignal(blob.arrayBuffer(), signal),
    /** @type {Promise<typeof import('fflate')>} */(fflate),
  ])

  return new ReadableStream({
    async start(controller) {
      if (signal?.aborted) return controller.error('Signal aborted')

      let terminated = false
      /** @type {import('fflate').AsyncTerminable | null} */
      let terminate = null

      const onAbort = () => {
        terminated = true
        terminate?.()
        controller.error('Signal aborted')
      }

      signal?.addEventListener('abort', onAbort, { once: true })

      const [buffer, { gunzip }] = await promises

      terminate = terminated ? null : gunzip(new Uint8Array(buffer), (err, data) => {
        signal?.removeEventListener('abort', onAbort)
        if (err) return controller.error(err)
        controller.enqueue(data)
      })
    },
  })
}

/**
 * @param {Blob} blob
 * @param {Object} [init]
 * @param {AbortSignal} [init.signal]
 * @param {(progress: number) => void} [init.onProgress]
 */
export async function extractProjectJson(blob, { onProgress, signal } = {}) {
  /** @type {PromiseWithResolvers<ProjectData>} */
  const { promise, resolve } = Promise.withResolvers()

  const decompressed = decompressGzip(blob, signal)
  const reader = decompressed.getReader()

  const tar = extract()
  tar.on('entry', async ({ name, size }, stream, next) => {
    if (name != 'temp/project.json') return next()

    const decoder = new TextDecoder
    /** @type {Uint8Array[]} */
    const chunks = []
    let length = 0

    stream.on('data', data => {
      chunks.push(data)
      length += data.length
      onProgress?.(length / Number(size))
    })

    stream.on('end', () => {
      const buffer = new Uint8Array(length)
      let i = 0
      for (const chunk of chunks) {
        buffer.set(chunk, i)
        i += chunk.length
      }

      const json = decoder.decode(buffer)
      resolve(JSON.parse(json))
    })
  })

  async function pipeToTar() {
    for (let data; !(data = await reader.read()).done; ) {
      const { value } = data
      tar.write(value)
    }
  }

  pipeToTar()
  return promise
}
