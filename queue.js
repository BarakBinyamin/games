class Queue {
  constructor() {
    this.items = [];
  }

  enqueue(item) {
    this.items.push(item); 
  }

  dequeue() {
    return this.items.shift();
  }

  peek() {
    return this.items[0];
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }
}

// Example usage:
// const q = new Queue();
// q.enqueue('task1');
// q.enqueue('task2');
// console.log(q.dequeue()); // task1
