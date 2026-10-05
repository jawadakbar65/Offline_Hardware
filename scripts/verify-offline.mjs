// Proves the built app never reaches the internet: records every network
// request during load + login and fails if any request leaves localhost.
// Usage: node scripts/verify-offline.mjs <url>
const url = process.argv[2] || 'http://localhost:4173/Offline_Hardware/'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const res = await fetch('http://127.0.0.1:9222/json')
const target = (await res.json()).find((t) => t.type === 'page')
if (!target) throw new Error('No CDP target')

const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  ws.onopen = resolve
  ws.onerror = reject
})

let id = 0
const pending = new Map()
const requests = []
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data)
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id)
    pending.delete(msg.id)
    if (msg.error) reject(new Error(msg.error.message))
    else resolve(msg.result)
  }
  if (msg.method === 'Network.requestWillBeSent') {
    requests.push(msg.params.request.url)
  }
}
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const msgId = ++id
    pending.set(msgId, { resolve, reject })
    ws.send(JSON.stringify({ id: msgId, method, params }))
  })
const evaluate = async (expression) => {
  const { result } = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  })
  return result.value
}

await send('Runtime.enable')
await send('Network.enable')
await send('Network.setCacheDisabled', { cacheDisabled: false })
await send('Page.enable')
await send('Page.navigate', { url })
await sleep(3500)

// Log in so every authenticated page's resources are requested too.
await evaluate(`(() => {
  const inputs = document.querySelectorAll('input')
  if (inputs.length < 2) return 'skip'
  const set = (el, value) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    setter.call(el, value)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }
  set(inputs[0], 'admin@hardware.local')
  set(inputs[1], 'admin123')
  const btn = [...document.querySelectorAll('button')].find((b) => /login/i.test(b.textContent))
  if (btn) btn.click()
  return 'done'
})()`)
await sleep(3500)

ws.close()

const unique = [...new Set(requests)]
const external = unique.filter((u) => {
  if (u.startsWith('data:') || u.startsWith('blob:')) return false
  try {
    const parsed = new URL(u)
    return !['localhost', '127.0.0.1'].includes(parsed.hostname)
  } catch {
    return false
  }
})

console.log(`total requests: ${unique.length}`)
unique.forEach((u) => console.log('  ', u))
console.log('\nexternal (internet) requests:', external.length)
external.forEach((u) => console.log('  EXTERNAL:', u))

const pass = external.length === 0
console.log(
  pass
    ? 'PASS: app is fully offline — zero internet requests'
    : 'FAIL: app depends on the internet',
)
process.exit(pass ? 0 : 1)
