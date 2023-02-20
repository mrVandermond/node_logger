class LinkedList {
  #head = null;
  #last = null;

  push(value) {
    if (!this.#head) {
      this.#head = {
        value,
        next: null,
        prev: null,
      }
      this.#last = this.#head;

      return;
    }

    const item = {
      value,
      next: null,
      prev: this.#last,
    };
    this.#last.next = item;
    this.#last = item;
  }

  pop() {
    if (!this.#head) return;

    const item = this.#head;

    this.#head = this.#head.next;

    return item;
  }

  setHead(item) {
    this.#head = item;
  }
}

module.exports = LinkedList;
