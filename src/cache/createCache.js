/* global fetch */
import { createContext, useContext } from 'react'

export function createCache() {
  const cache = {}

  function set(url, result) {
    cache[url] = { ...cache[url], result }
  }

  function get(url) {
    if (!cache[url]) {
      cache[url] = {
        request: fetch(url)
          .then(r => r.json())
          .then(result => set(url, result)),
      }
    }
    return cache[url]
  }


  return { get }
}

export const CacheContext = createContext()

export function useFetch(resourceUrl) {
  const cache = useContext(CacheContext)
  const entry = cache.get(resourceUrl)

  if (!('result' in entry)) {
    throw entry.request
  }

  return entry.result
}
