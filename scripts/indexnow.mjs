/**
 * Notifies IndexNow that URLs changed.
 *
 * IndexNow is a push protocol: instead of waiting to be crawled, the site tells
 * participating engines (Bing, Yandex, Seznam, Naver) that something changed.
 * Google does not participate.
 *
 * Ownership is proved by serving the key at /<key>.txt, which is committed
 * alongside this script.
 *
 *     node scripts/indexnow.mjs
 */
const KEY = '84501c3d7ace3f545451abe3f8849fb4'
const HOST = 'vivekjoshy.com'

const ROUTES = [
  '/', '/openskill', '/arc', '/ordinal-replica',
  '/ensemble', '/mcp', '/resume', '/provenance'
]

const body = {
  host: HOST,
  key: KEY,
  keyLocation: `https://${HOST}/${KEY}.txt`,
  urlList: ROUTES.map((r) => `https://${HOST}${r === '/' ? '' : r}`)
}

const res = await fetch('https://api.indexnow.org/IndexNow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body)
})

// 200 accepted, 202 accepted but key still being validated.
if (res.status === 200 || res.status === 202) {
  console.log(`✔ IndexNow accepted ${body.urlList.length} URLs (${res.status})`)
} else {
  console.error(`✖ IndexNow returned ${res.status}: ${await res.text()}`)
  process.exit(1)
}
