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

export let mockMethods = (
  earlyCalls = earlyCalls,
  methods = availableMethods
) => {
  let obj = {}
  methods.forEach(method => {
    obj = _.set(method, queueMethod(earlyCalls, method), obj)
  })
  return obj
}

export let queueMethod = (earlyCalls, method) => (...args) =>
  earlyCalls.queue({ method, args })

export let loadScript = (widget = window.fcWidget, document = document) => {
  if (widget) return
  let script = document.createElement('script')
  script.async = 'true'
  script.type = 'text/javascript'
  script.src = 'https://wchat.freshchat.com/js/widget.js'
  document.head.appendChild(script)
}

class FreshChat extends React.Component {
  constructor(props) {
    super(props)

    this.win = window || {}

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

  init(settings) {
    let { fcWidget } = this.win
    if (settings.onInit) {
      let tmp = settings.onInit
      settings.onInit = () => tmp(widget())
    }

    if (fcWidget) {
      fcWidget.init(settings)
    } else {
      this.lazyInit(settings)
    }
  }

  lazyInit(settings) {
    this.win.fcSettings = settings

    loadScript()

    let interval = setInterval(() => {
      if (this.win.fcWidget) {
        clearInterval(interval)
        try {
          earlyCalls.dequeueAll((method, value) => {
            this.win.fcWidget[method](...value)
          })
        } catch (e) {
          console.error(e)
        }
      }
    }, 1000)
  }

  render() {
    return false
  }

  componentWillUnmount() {
    widget().close()
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
