export function createCache() {
  const cache = {};
  function get(url) {
    if (!cache[url]) {
      cache[url] = {
        request: fetch(url)
          .then(r => r.json())
          .then(result => set(url, result))
      };
    }
    return cache[url];
  }

  function set(url, result) {
    cache[url] = { ...cache[url], result };
  }

  return { get };
}

export const CacheContext = React.createContext();

export function useFetch(resourceUrl) {
  var cache = React.useContext(CacheContext);
  var entry = cache.get(resourceUrl);

  if (!("result" in entry)) {
    throw entry.request;
  }

  return entry.result;
}