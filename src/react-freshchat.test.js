let FreshChat = require('./react-freshchat')
let Queue = require('./queue').default

test(`widget`, () => {
  let { widget } = FreshChat
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

test(`mockMethods`, () => {
  let q = new Queue()
  let { mockMethods } = FreshChat
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

test(`queueMethod`, () => {
  let { queueMethod } = FreshChat
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

test(`loadScript`, () => {
  let { loadScript } = FreshChat
  let widget = {}
  let document = {
    createElement: jest.fn(() => ({})),
    head: {
      appendChild: jest.fn(),
    },
  }

  loadScript(widget)
  expect(document.createElement).not.toHaveBeenCalled()
  expect(document.head.appendChild).not.toHaveBeenCalled()

  loadScript(null, document)
  expect(document.createElement).toHaveBeenCalledWith('script')
  expect(document.head.appendChild).toHaveBeenCalledWith({
    async: 'true',
    type: 'text/javascript',
    src: 'https://wchat.freshchat.com/js/widget.js',
  })
})
