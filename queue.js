class Queue {
  constructor() {
    this.events = []
    this.awaitingRequest = undefined
  }

  enqueue(data) {
    if (this.awaitingRequest) {
      const resolveRequest = this.awaitingRequest
      this.awaitingRequest = undefined
      resolveRequest(data)
    } else {
      this.events.push(data)
    }
  }

  async dequeue() {
    if (this.events.length > 0) {
      return this.events.shift()
    }
    return new Promise((res) => (this.awaitingRequest = res))
  }

  // peek() {
  //   return this.this[0]
  // }

  // isEmpty() {
  //   return this.this.length === 0
  // }

  // size() {
  //   return this.this.length
  // }
}

module.exports = Queue

// Example usage:
// const q = new Queue();
// q.enqueue('task1');
// q.enqueue('task2');
// console.log(q.dequeue()); // task1
