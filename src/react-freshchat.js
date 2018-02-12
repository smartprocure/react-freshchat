import _ from 'lodash/fp'
import React from 'react'
import Queue from './queue'

let fakeWidget
let earlyCalls = new Queue()

export let widget = (
  fake = fakeWidget,
  real = window.fcWidget,
  methods = availableMethods
) => {
  if (real) return real
  if (!fake) fake = mockMethods(earlyCalls, methods)
  return fake
}

export let mockMethods = (Q = earlyCalls, methods = availableMethods) => {
  let obj = {}
  methods.forEach(method => {
    obj = _.set(method, queueMethod(Q, method), obj)
  })
  return obj
}

export let queueMethod = (Q, method) => (...args) => {
  Q.queue({ method, args })
}

export let loadScript = (document = document, widget = window.fcWidget) => {
  let id = 'freshchat-lib'
  if (widget || document.getElementById(id)) return
  let script = document.createElement('script')
  script.id = id
  script.async = 'true'
  script.type = 'text/javascript'
  script.src = 'https://wchat.freshchat.com/js/widget.js'
  document.head.appendChild(script)
}

class FreshChat extends React.Component {
  constructor(props) {
    super(props)

    this.win = window || {}
    this.doc = document || {}
    this.checkAndInit = this.checkAndInit.bind(this)

    let { token, ...moreProps } = props

    if (!token) {
      throw new Error(`token is required`)
    }

    this.init({
      host: 'https://wchat.freshchat.com',
      token,
      ...moreProps,
    })
  }

  mutateOnInit(settings) {
    let tmp = settings.onInit
    settings.onInit = () => tmp(widget())
    return settings
  }

  init(settings) {
    let { fcWidget } = this.win

    if (settings.onInit) this.mutateOnInit(settings)

    if (fcWidget) {
      fcWidget.init(settings)
      if (settings.onInit) {
        settings.onInit()
      }
    } else {
      this.lazyInit(settings)
    }
  }

  lazyInit(settings) {
    widget().init(settings) // Can't use window.fcSettings because sometimes it doesn't work

    loadScript(this.doc)

    this.interval = setInterval(this.checkAndInit(settings), 1000)
  }

  checkAndInit(settings) {
    return () => {
      if (this.win.fcWidget) {
        clearInterval(this.interval)
        try {
          earlyCalls.dequeueAll(({ method, args }) => {
            this.win.fcWidget[method](...args)
          })
        } catch (e) {
          console.error(e)
        }
        if (settings.onInit) {
          settings.onInit()
        }
      }
    }
  }

  render() {
    return false
  }
}

let availableMethods = [
  'close',
  'destroy',
  'hide',
  'init',
  'isInitialized',
  'isLoaded',
  'isOpen',
  'off',
  'on',
  'open',
  'setConfig',
  'setExternalId',
  'setFaqTags',
  'setTags',
  'track',
  'user.show',
  'user.track',
  'user.user',
  'user.clear',
  'user.create',
  'user.get',
  'user.isExists',
  'user.setEmail',
  'user.setFirstName',
  'user.setLastName',
  'user.setMeta',
  'user.setPhone',
  'user.setPhoneCountryCode',
  'user.setProperties',
  'user.update',
]

export default FreshChat
