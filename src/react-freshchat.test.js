import React from 'react'
import FreshChat, {
  widget,
  mockMethods,
  queueMethod,
  loadScript,
} from './react-freshchat'
import Queue from './queue'
import Enzyme, { mount, shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({ adapter: new Adapter() })

describe(`widget`, () => {
  let fake = 'FAKE'
  let real = 'REAL'
  expect(widget(fake, real, [])).toEqual(real)
  expect(widget(fake, null, [])).toEqual(fake)
  expect(widget(null, null, [])).toEqual({})
  expect(widget(null, null, ['a', 'b'])).toEqual({
    a: jasmine.any(Function),
    b: jasmine.any(Function),
  })
})

describe(`mockMethods`, () => {
  let q = new Queue()
  let fake = mockMethods(q, ['a'])
  expect(fake).toEqual({
    a: jasmine.any(Function),
  })
  expect(q.isEmpty).toBe(true)
  fake.a('testing')
  expect(q.isEmpty).toBe(false)
  expect(q.dequeue()).toEqual({
    method: 'a',
    args: ['testing'],
  })

  q.reset()

  let withAvailableMethods = mockMethods(q)
  let fn = jasmine.any(Function)
  expect(withAvailableMethods).toEqual({
    close: fn,
    destroy: fn,
    hide: fn,
    init: fn,
    isInitialized: fn,
    isLoaded: fn,
    isOpen: fn,
    off: fn,
    on: fn,
    open: fn,
    setConfig: fn,
    setExternalId: fn,
    setFaqTags: fn,
    setTags: fn,
    track: fn,
    user: {
      show: fn,
      track: fn,
      user: fn,
      clear: fn,
      create: fn,
      get: fn,
      isExists: fn,
      setEmail: fn,
      setFirstName: fn,
      setLastName: fn,
      setMeta: fn,
      setPhone: fn,
      setPhoneCountryCode: fn,
      setProperties: fn,
      update: fn,
    },
  })
})

describe(`queueMethod`, () => {
  let q = new Queue()
  let spy = jest.spyOn(q, 'queue')

  expect(queueMethod(q, 'a')).toEqual(jasmine.any(Function))

  queueMethod(q, 'a')('testing')
  expect(spy).toHaveBeenCalledTimes(1)
  expect(spy).toHaveBeenCalledWith({
    method: 'a',
    args: ['testing'],
  })
})

describe(`loadScript`, () => {
  let widget = {}
  let document = {
    getElementById: jest.fn(() => false),
    createElement: jest.fn(() => ({})),
    head: {
      appendChild: jest.fn(),
    },
  }

  loadScript(document, widget)
  expect(document.createElement).not.toHaveBeenCalled()
  expect(document.head.appendChild).not.toHaveBeenCalled()

  loadScript(document, null)
  expect(document.createElement).toHaveBeenCalledWith('script')
  expect(document.head.appendChild).toHaveBeenCalledWith({
    id: 'freshchat-lib',
    async: 'true',
    type: 'text/javascript',
    src: 'https://wchat.freshchat.com/js/widget.js',
  })
})

describe(`Component`, () => {
  const _settings = {
    host: 'https://wchat.freshchat.com',
    token: 'asd',
  }

  describe(`constructor`, () => {
    beforeEach(() => {
      window.fcWidget = undefined
    })

    it(`should throw an error if the Prop token is not passed`, () => {
      expect(() => shallow(<FreshChat />)).toThrow('token is required')
    })

    it(`should call the 'init' method`, () => {
      // We call 'init' when we construct the class, means that we have to mock the 'init' method to be able to spy it and then we have to restore it

      const originalInit = FreshChat.prototype.init
      FreshChat.prototype.init = jest.fn()

      shallow(<FreshChat token="something" />)

      expect(FreshChat.prototype.init).toHaveBeenCalled()

      FreshChat.prototype.init = originalInit
    })

    it(`should call fcWidget.init if fcWidget is loaded`, () => {
      window.fcWidget = { init: jest.fn() }
      const spyLazyInit = jest.spyOn(FreshChat.prototype, 'lazyInit')

      const settings = { token: _settings.token, test: true }
      new FreshChat(settings)
      expect(window.fcWidget.init).toHaveBeenCalledWith({
        ..._settings,
        ...settings,
      })
      expect(spyLazyInit).not.toHaveBeenCalled()
    })

    it(`should mutate prop 'onInit' if it was passed`, () => {
      window.fcWidget = { init: jest.fn() }
      const spyMutateOnInit = jest.spyOn(FreshChat.prototype, 'mutateOnInit')
      const onInit = jest.fn()
      const component = new FreshChat({ token: _settings.token, onInit })
      expect(spyMutateOnInit).toHaveBeenCalled()
      expect(onInit).toHaveBeenCalled()
      expect(component.interval).toBe(undefined)
    })

    it(`should call 'lazyInit' if window.fcWidget is undefined`, () => {
      const spyLazyInit = jest.spyOn(FreshChat.prototype, 'lazyInit')
      const spyInterval = jest.spyOn(window, 'setInterval')
      const spyCheckAndInit = jest.spyOn(FreshChat.prototype, 'checkAndInit')
      const component = new FreshChat({ token: _settings.token })
      expect(spyLazyInit).toHaveBeenCalled()
      expect(spyInterval).toHaveBeenCalledWith(jasmine.any(Function), 1000)
      expect(spyCheckAndInit).toHaveBeenCalledWith(_settings)
      expect(component.interval).toEqual(jasmine.any(Number))
    })
  })

  describe(`checkAndInit`, () => {
    const component = new FreshChat({ token: _settings.token })
    const { checkAndInit } = component
    expect(checkAndInit).toEqual(jasmine.any(Function))
    expect(checkAndInit(_settings)).toEqual(jasmine.any(Function))

    const spyClearInterval = jest.spyOn(window, 'clearInterval')

    checkAndInit(_settings)()
    expect(spyClearInterval).not.toHaveBeenCalled()

    window.fcWidget = {
      init: jest.fn(),
    }
    checkAndInit(_settings)()

    expect(spyClearInterval).toHaveBeenCalledWith(component.interval)
  })
})
