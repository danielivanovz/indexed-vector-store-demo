class MaxHeap<T extends { similarity: number }> {
    private heap: T[] = []

    private parent(index: number): number {
        return Math.floor((index - 1) / 2)
    }

    private leftChild(index: number): number {
        return 2 * index + 1
    }

    private rightChild(index: number): number {
        return 2 * index + 2
    }

    private swap(index1: number, index2: number) {
        const temp = this.heap[index1]
        this.heap[index1] = this.heap[index2]
        this.heap[index2] = temp
    }

    private siftUp() {
        let index = this.heap.length - 1

        while (index > 0 && this.heap[this.parent(index)].similarity < this.heap[index].similarity) {
            this.swap(index, this.parent(index))
            index = this.parent(index)
        }
    }

    private siftDown() {
        let index = 0
        const length = this.heap.length
        const elementPriority = this.heap[index].similarity

        while (this.leftChild(index) < length) {
            let largerChildIndex = this.leftChild(index)
            const rightChildIdx = this.rightChild(index)

            if (rightChildIdx < length && this.heap[rightChildIdx].similarity > this.heap[largerChildIndex].similarity) {
                largerChildIndex = rightChildIdx
            }

            if (elementPriority > this.heap[largerChildIndex].similarity) break

            this.swap(index, largerChildIndex)
            index = largerChildIndex
        }
    }

    insert(data: T) {
        this.heap.push(data)
        this.siftUp()
    }

    extractMax(): T | null {
        if (this.heap.length === 0) return null

        const root = this.heap[0]
        const lastElement = this.heap.pop()

        if (this.heap.length > 0) {
            this.heap[0] = lastElement!
            this.siftDown()
        }

        return root
    }

    peek(): T | null {
        if (this.heap.length === 0) return null
        return this.heap[0]
    }

    peekAll(): T[] {
        return this.heap
    }

    size(): number {
        return this.heap.length
    }
}

export { MaxHeap }
