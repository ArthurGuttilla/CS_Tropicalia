;(function () {
  'use strict'

  var script = document.currentScript
  var projectId = script && script.getAttribute('data-project-id')
  var appUrl =
    (script && script.getAttribute('data-app-url')) ||
    'http://localhost:3000'

  if (!projectId) {
    console.warn('[CS Tropicalia] data-project-id attribute is required.')
    return
  }

  var WIDGET_URL = appUrl + '/widget/' + projectId

  // ── Styles ──────────────────────────────────────────────────────────────────

  var style = document.createElement('style')
  style.textContent = [
    '#cst-bubble{position:fixed;z-index:2147483640;width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;box-shadow:0 4px 24px rgba(0,0,0,0.18);display:flex;align-items:center;justify-content:center;font-size:24px;transition:transform .2s,box-shadow .2s;}',
    '#cst-bubble:hover{transform:scale(1.08);box-shadow:0 8px 32px rgba(0,0,0,0.22);}',
    '#cst-panel{position:fixed;z-index:2147483639;width:380px;height:600px;border-radius:20px;overflow:hidden;box-shadow:0 16px 64px rgba(0,0,0,0.16);transition:opacity .25s,transform .25s;transform-origin:bottom right;}',
    '#cst-panel.cst-hidden{opacity:0;pointer-events:none;transform:scale(0.92) translateY(12px);}',
    '#cst-panel iframe{width:100%;height:100%;border:none;}',
    '@media (max-width:480px){#cst-panel{width:100vw;height:100vh;bottom:0!important;right:0!important;left:0!important;border-radius:0;}}',
  ].join('')
  document.head.appendChild(style)

  // ── Config (loaded async) ───────────────────────────────────────────────────

  var primaryColor = '#22c55e'
  var position = 'bottom-right'
  var avatarEmoji = '💬'
  var isOpen = false

  // Try to fetch widget config for branding
  fetch(appUrl + '/api/widget-config/' + projectId)
    .then(function (r) { return r.json() })
    .then(function (d) {
      if (d && d.config) {
        if (d.config.primaryColor) {
          primaryColor = d.config.primaryColor
          bubble.style.backgroundColor = primaryColor
        }
        if (d.config.position) position = d.config.position
        if (d.config.avatarEmoji) {
          avatarEmoji = d.config.avatarEmoji
          if (!isOpen) bubble.textContent = avatarEmoji
        }
        positionElements()
      }
    })
    .catch(function () {})

  // ── Elements ────────────────────────────────────────────────────────────────

  var bubble = document.createElement('button')
  bubble.id = 'cst-bubble'
  bubble.setAttribute('aria-label', 'Open chat')
  bubble.style.backgroundColor = primaryColor
  bubble.textContent = avatarEmoji

  var panel = document.createElement('div')
  panel.id = 'cst-panel'
  panel.className = 'cst-hidden'

  var iframe = document.createElement('iframe')
  iframe.src = WIDGET_URL
  iframe.title = 'Customer Support Chat'
  iframe.setAttribute('allow', 'clipboard-write')
  panel.appendChild(iframe)

  document.body.appendChild(panel)
  document.body.appendChild(bubble)

  function positionElements() {
    var GAP = 20
    if (position === 'bottom-left') {
      bubble.style.bottom = GAP + 'px'
      bubble.style.left = GAP + 'px'
      bubble.style.right = 'auto'
      panel.style.bottom = GAP + 56 + 8 + 'px'
      panel.style.left = GAP + 'px'
      panel.style.right = 'auto'
      panel.style.transformOrigin = 'bottom left'
    } else {
      bubble.style.bottom = GAP + 'px'
      bubble.style.right = GAP + 'px'
      bubble.style.left = 'auto'
      panel.style.bottom = GAP + 56 + 8 + 'px'
      panel.style.right = GAP + 'px'
      panel.style.left = 'auto'
      panel.style.transformOrigin = 'bottom right'
    }
  }

  positionElements()

  // ── Toggle ───────────────────────────────────────────────────────────────────

  bubble.addEventListener('click', function () {
    isOpen = !isOpen
    if (isOpen) {
      panel.classList.remove('cst-hidden')
      bubble.textContent = '✕'
      bubble.setAttribute('aria-label', 'Close chat')
    } else {
      panel.classList.add('cst-hidden')
      bubble.textContent = avatarEmoji
      bubble.setAttribute('aria-label', 'Open chat')
    }
  })

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) bubble.click()
  })
})()
