class VectorCache<K, V> {
    private data = new Map<K, V>();
    private maxSize: number;
    
    constructor(maxSize: number) {
        this.maxSize = maxSize;
    }

    get(key: K): V | undefined {
        const item = this.data.get(key);
        
        if (item) {
            this.data.delete(key);
            this.data.set(key, item);
        }
        
        return item;
    }

    set(key: K, value: V): void {
        if (this.data.size >= this.maxSize) {
            this.data.delete(this.data.keys().next().value);
        }
        
        this.data.set(key, value);
    }

    clear(): void {
        this.data.clear();
    }
}

export { VectorCache }