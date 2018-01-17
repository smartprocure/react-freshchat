

export default class Queue {
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