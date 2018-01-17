import _ from 'lodash/fp'
import React from 'react'
import Queue from './queue'

let fakeWidget
let earlyCalls = new Queue()

export let widget = (fake = fakeWidget) => {
  if (window.fcWidget) return window.fcWidget
  if (!fake) fake = mockMethods(availableMethods)
  return fake
}

let mockMethods = methods => {
  let obj = {}
  methods.forEach(method => {
    obj = _.set(method, queueMethod(method), obj)
  })
  return obj
}

let queueMethod = method => (...args) => 
  console.info('  QUEUE', method, args) || earlyCalls.queue({ method, args })

let loadScript = () => {
  let script = document.createElement('script')
  script.async = 'true'
  script.type = 'text/javascript'
  script.src = 'https://wchat.freshchat.com/js/widget.js'
  document.head.appendChild(script)
}

class FreshChat extends React.Component {
  constructor(props) {
    super(props)

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
    if (settings.onInit) {
      let tmp = settings.onInit
      settings.onInit = () => tmp(widget())
    }

    if (window.fcWidget) {
      window.fcWidget.init(settings)
    } else {
      this.lazyInit(settings)
    }
  }

  lazyInit(settings) {
    window.fcSettings = settings

    loadScript()

    let interval = setInterval(() => {
      if (window.fcWidget) {
        clearInterval(interval)
        try {
          console.info('  - LOADED')
          earlyCalls.dequeueAll((method, value) => {
            console.info('    DEQUEUING', method, value)
            window.fcWidget[method](...value)
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
