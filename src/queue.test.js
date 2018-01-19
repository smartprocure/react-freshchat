// import Queue from 'queue'
let Queue = require('./queue').default

test(`queue method`, () => {
  let q = new Queue()
  expect(q.data).toEqual([])
  expect(q.index).toBe(0)

  q.queue('testing')

  expect(q.data).toEqual(['testing'])
  expect(q.index).toBe(0)

  q.queue('asd')

  expect(q.data).toEqual(['testing', 'asd'])
  expect(q.index).toBe(0)
})

test(`dequeue method`, () => {
  let q = new Queue()
  q.queue('testing')
  q.queue('asd')

  expect(q.dequeue()).toBe('testing')
  expect(q.data).toEqual(['testing', 'asd'])
  expect(q.index).toBe(1)

  expect(q.dequeue()).toBe('asd')
  expect(q.data).toEqual([]) // it should be empty because we reset the queue
  expect(q.index).toBe(0) // it should be 0 because we reset the queue

  expect(q.dequeue()).toBe(undefined)
})

test(`isEmpty`, () => {
  let q = new Queue()
  expect(q.isEmpty).toBe(true)

  q.queue('testing')
  expect(q.isEmpty).toBe(false)

  q.queue('asd')
  expect(q.isEmpty).toBe(false)

  q.dequeue()
  expect(q.isEmpty).toBe(false)

  q.dequeue()
  expect(q.isEmpty).toBe(true)
})

test(`dequeueAll method`, () => {
  let q = new Queue()
  let cb = jest.fn()

  q.queue('testing')
  q.queue('asd')

  expect(() => {
    q.dequeueAll()
  }).toThrowError('Please provide a callback')

  q.dequeueAll(cb)

  expect(cb).toHaveBeenCalledTimes(2)
  expect(cb.mock.calls[0][0]).toBe('testing')
  expect(cb.mock.calls[1][0]).toBe('asd')
})

test(`reset method`, () => {
  let q = new Queue()

  q.queue('testing')
  q.queue('asd')
  q.queue('123')

  q.dequeue()

  expect(q.index).toBe(1)

  q.reset()

  expect(q.data).toEqual([])
  expect(q.index).toBe(0)
})
