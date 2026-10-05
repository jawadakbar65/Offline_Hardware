// Verifies the built app renders in a real browser (Chrome CDP).
// Usage: node scripts/verify-app.mjs <url>
const url = process.argv[2] || 'http://localhost:4173/Offline_Hardware/'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getTarget() {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json')
      const targets = await res.json()
      const page = targets.find((t) => t.type === 'page')
      if (page) return page
    } catch {}
    await sleep(500)
  }
  throw new Error('No CDP target found')
}

const target = await getTarget()
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  ws.onopen = resolve
  ws.onerror = reject
})

let id = 0
const pending = new Map()
const consoleErrors = []
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data)
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id)
    pending.delete(msg.id)
    if (msg.error) reject(new Error(msg.error.message))
    else resolve(msg.result)
  }
  if (msg.method === 'Runtime.exceptionThrown') {
    consoleErrors.push(msg.params.exceptionDetails?.text || 'exception')
  }
  if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
    consoleErrors.push(msg.params.entry.text)
  }
}
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const msgId = ++id
    pending.set(msgId, { resolve, reject })
    ws.send(JSON.stringify({ id: msgId, method, params }))
  })

await send('Runtime.enable')
await send('Log.enable')
await send('Page.enable')
await send('Page.navigate', { url })

let snapshot = null
for (let i = 0; i < 24; i++) {
  await sleep(500)
  const { result } = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      href: location.href,
      rootLen: document.getElementById('root')?.innerHTML.length || 0,
      title: document.title,
      text: (document.body.innerText || '').slice(0, 400),
      inputs: document.querySelectorAll('input').length,
      buttons: document.querySelectorAll('button').length,
    })`,
    returnByValue: true,
  })
  const data = JSON.parse(result.value)
  if (data.rootLen > 200) {
    snapshot = data
    break
  }
  snapshot = data
}

ws.close()
console.log(JSON.stringify({ snapshot, consoleErrors }, null, 2))
if (!snapshot || snapshot.rootLen < 200) {
  console.error('FAIL: app did not render')
  process.exit(1)
}
console.log('PASS: app rendered')
