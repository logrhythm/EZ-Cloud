export function openCollectors (state) {
  return state.openCollectors
}

export function pipelines (state) {
  return state.pipelines
}

// import shippersFallbackUrls from 'src/pages/OpenCollectors/shippers_fallback_urls.json'

// export function shippersUrls (state) {
//   // Use the downloaded ones, otherwise, fallback to pre-recorded list
//   return (
//     Object.keys(state.shippersUrlsInternal).length
//       ? state.shippersUrlsInternal
//       : shippersFallbackUrls
//   )
// }

export function openCollectorLogSources (state) {
  return state.openCollectorLogSources
}
