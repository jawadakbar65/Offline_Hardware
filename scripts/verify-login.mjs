// Logs in with the demo admin account and verifies the dashboard renders.
// Usage: node scripts/verify-login.mjs <url>
const url = process.argv[2] || 'http://localhost:4173/Offline_Hardware/'
const basePath = new URL(url).pathname.replace(/\/$/, '')
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
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data)
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id)
    pending.delete(msg.id)
    if (msg.error) reject(new Error(msg.error.message))
    else resolve(msg.result)
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
await send('Page.enable')
await send('Page.navigate', { url })
await sleep(3000)

// Start from a logged-out state so the test is repeatable.
await evaluate("localStorage.removeItem('hardware-auth-user'); true")
await send('Page.reload')
await sleep(3000)

// Fill the login form with the first demo credential shown on screen.
const filled = await evaluate(`(() => {
  const inputs = document.querySelectorAll('input')
  if (inputs.length < 2) return 'inputs-missing'
  const set = (el, value) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    setter.call(el, value)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }
  set(inputs[0], 'admin@hardware.local')
  set(inputs[1], 'admin123')
  return 'ok'
})()`)
console.log('fill:', filled)

const clicked = await evaluate(`(() => {
  const btn = [...document.querySelectorAll('button')].find((b) => /login|sign/i.test(b.textContent))
  if (!btn) return 'button-missing'
  btn.click()
  return 'clicked'
})()`)
console.log('click:', clicked)

let snapshot = null
for (let i = 0; i < 24; i++) {
  await sleep(500)
  snapshot = await evaluate(`JSON.stringify({
    href: location.href,
    text: (document.body.innerText || '').slice(0, 500),
    rows: document.querySelectorAll('table tbody tr').length,
    nav: document.querySelectorAll('nav a, aside a').length,
  })`)
  const data = JSON.parse(snapshot)
  const atApp = new URL(data.href).pathname.replace(/\/$/, '') === basePath
  if (atApp && data.nav > 0) break
}

ws.close()
const data = JSON.parse(snapshot)
console.log(JSON.stringify(data, null, 2))
const pass = new URL(data.href).pathname.replace(/\/$/, '') === basePath && data.nav > 0 && /Admin User/.test(data.text)
console.log(pass ? 'PASS: login works, dashboard rendered' : 'FAIL: login did not reach dashboard')
process.exit(pass ? 0 : 1)
