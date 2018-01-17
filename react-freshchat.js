import _ from 'lodash/fp'
import React from 'react'

let loadScript = () => {
  let script = document.createElement('script')
  script.async = 'true'
  script.type = 'text/javascript'
  script.src = 'https://wchat.freshchat.com/js/widget.js'
  document.head.appendChild(script)
}

class Queue {
  constructor() {
    this.data = []
    this.index = 0
  }

  queue(value) {
    this.data.push(value)
  }

  dequeue() {
    if (this.index > -1 && this.index < this.data.length) {
      let result = this.data[this.index++]

      if (this.isEmpty()) {
        this.reset()
      }

      return result
    }
  }

  get isEmpty() {
    return this.index >= this.data.length
  }

  dequeueAll(cb) {
    if (!_.isFunction(cb)) {
      throw new Error(`Please provide a callback`)
    }

    while (!this.isEmpty) {
      let { method, args } = this.dequeue()
      cb(method, args)
    }

    this.reset()
  }

  reset() {
    this.data.length = 0
    this.index = 0
  }
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
      settings.onInit = () => tmp(this.widget)
    }

    if (window.fcWidget) {
      window.fcWidget.init(settings)
    } else {
      this.lazyInit(settings)
    }
  }

  lazyInit(settings) {
    window.fcSettings = settings
    this.earlyCalls = new Queue()
    this.fakeWidget = this.mockMethods(availableMethods)

    loadScript()

    let interval = setInterval(() => {
      if (window.fcWidget) {
        clearInterval(interval)
        try {
          this.earlyCalls.dequeueAll((method, value) => {
            window.fcWidget[method](...value)
          })
        } catch (e) {
          console.error(e)
        }
      }
    }, 1000)
  }

  get widget() {
    return window.fcWidget || this.fakeWidget
  }

  mockMethods(methods) {
    let obj = {}
    methods.forEach(method => {
      obj = _.set(method, this.queueMethod(method), obj)
    })
    return obj
  }

  queueMethod(method) {
    return (...args) => {
      this.earlyCalls.queue({ method, args })
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
