// Verifies: login form starts empty, jawadali/jawad321 works, admin profile
// is editable, the theme switcher works, and the password can be changed.
// Usage: node scripts/verify-settings.mjs <url>
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
  if (result.subtype === 'error') throw new Error(result.description)
  return result.value
}

// Helpers run inside the page. Fields are scoped to the form whose submit
// button matches `buttonPattern`, so store/profile/password inputs never mix.
const fillField = (buttonPattern, fieldIndex, value) =>
  evaluate(`(() => {
    const bp = ${buttonPattern.toString()}
    const form = [...document.querySelectorAll('form')].find((f) =>
      [...f.querySelectorAll('button')].some((b) => bp.test(b.textContent)),
    )
    if (!form) return false
    const el = form.querySelectorAll('input, textarea')[${fieldIndex}]
    if (!el) return false
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    setter.call(el, ${JSON.stringify(value)})
    el.dispatchEvent(new Event('input', { bubbles: true }))
    return true
  })()`)
const click = (pattern) =>
  evaluate(`(() => {
    const re = ${pattern.toString()}
    const el = [...document.querySelectorAll('button, a')].find((n) => re.test(n.textContent))
    if (!el) return false
    el.click()
    return true
  })()`)
// Checks every visible note of a kind, so an older note left over from a
// previous step cannot mask the one being asserted.
const hasNote = (kind, pattern) =>
  evaluate(`[...document.querySelectorAll('.status-note.${kind}')].some((n) => ${pattern.toString()}.test(n.textContent))`)

const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${name}${detail ? ' — ' + detail : ''}`)
}

await send('Runtime.enable')
await send('Page.enable')

// Start from a clean logged-out state.
await send('Page.navigate', { url })
await sleep(2500)
await evaluate("localStorage.removeItem('hardware-auth-user'); true")
await send('Page.reload')
await sleep(3000)

// 1. Login form must start empty.
const emptyValues = JSON.parse(
  await evaluate(`JSON.stringify([...document.querySelectorAll('input')].map((i) => i.value))`),
)
check(
  'login form starts empty',
  emptyValues.length === 2 && emptyValues.every((v) => v === ''),
  JSON.stringify(emptyValues),
)

// 2. Wrong password rejected.
await fillField(/login/i, 0, 'jawadali')
await fillField(/login/i, 1, 'wrongpass')
await click(/login/i)
await sleep(1500)
const wrongRejected = await hasNote('error', /invalid/i)
check('wrong password rejected', wrongRejected)

// 3. jawadali / jawad321 logs in.
await fillField(/login/i, 1, 'jawad321')
await click(/login/i)
await sleep(2500)
const afterLogin = JSON.parse(
  await evaluate(`JSON.stringify({ href: location.href, nav: document.querySelectorAll('nav a').length })`),
)
check(
  'login with jawadali / jawad321',
  /Offline_Hardware\/?$/.test(afterLogin.href) && afterLogin.nav > 0,
  JSON.stringify(afterLogin),
)

// 4. Admin profile is editable (Settings page).
await click(/^settings$/i)
await sleep(1800)
const onSettings = await evaluate(
  "[...document.querySelectorAll('h3')].some((h) => /admin profile/i.test(h.textContent))",
)
check('settings page reachable', onSettings)

const setName = `Test Admin ${Date.now() % 10000}`
const profileFilled = await fillField(/save profile/i, 0, setName)
const profileClicked = await click(/save profile/i)
await sleep(1500)
const profileSaved = await hasNote('success', /profile updated/i)
const sidebarName = await evaluate("document.querySelector('.user-chip strong')?.textContent || ''")
check(
  'admin profile editable',
  profileFilled && profileClicked && profileSaved && sidebarName === setName,
  `sidebar="${sidebarName}"`,
)
// Restore the original display name.
await fillField(/save profile/i, 0, 'jawadali')
await click(/save profile/i)
await sleep(1200)

// 5. Theme switch light -> dark.
await click(/^light$/i)
await sleep(1000)
const themeLight = await evaluate("document.documentElement.dataset.theme || ''")
check('theme switches to light', themeLight === 'light', themeLight)
await click(/^dark$/i)
await sleep(1000)
const themeDark = await evaluate("document.documentElement.dataset.theme || ''")
check('theme switches back to dark', themeDark === 'dark', themeDark)

// 6. Password change: wrong current rejected first.
await fillField(/update password/i, 0, 'not-the-current')
await fillField(/update password/i, 1, 'temporary123')
await fillField(/update password/i, 2, 'temporary123')
await click(/update password/i)
await sleep(1500)
const pwErrRejected = await hasNote('error', /incorrect/i)
check('wrong current password rejected', pwErrRejected)

// Correct current password: change to temporary123.
await fillField(/update password/i, 0, 'jawad321')
await fillField(/update password/i, 1, 'temporary123')
await fillField(/update password/i, 2, 'temporary123')
await click(/update password/i)
await sleep(1500)
const pwChanged = await hasNote('success', /password updated/i)
check('password changed', pwChanged)

// New password must work from a fresh login.
await click(/logout/i)
await sleep(1500)
await fillField(/login/i, 0, 'jawadali')
await fillField(/login/i, 1, 'temporary123')
await click(/login/i)
await sleep(2500)
const relogin = JSON.parse(
  await evaluate(`JSON.stringify({ href: location.href, nav: document.querySelectorAll('nav a').length })`),
)
check(
  'new password logs in',
  /Offline_Hardware\/?$/.test(relogin.href) && relogin.nav > 0,
  JSON.stringify(relogin),
)

// 7. Restore the original password jawad321.
await click(/^settings$/i)
await sleep(1800)
await fillField(/update password/i, 0, 'temporary123')
await fillField(/update password/i, 1, 'jawad321')
await fillField(/update password/i, 2, 'jawad321')
await click(/update password/i)
await sleep(1500)
const restoredOk = await hasNote('success', /password updated/i)
check('password restored to jawad321', restoredOk)

ws.close()

const failed = results.filter((r) => !r.ok)
if (consoleErrors.length) console.log('console errors:', consoleErrors)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length === 0 && consoleErrors.length === 0 ? 0 : 1)
