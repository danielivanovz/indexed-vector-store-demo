import { IDBPDatabase } from 'idb'
import { MaxHeap } from './max-heap'

import config from './config'
import { SIMILARITY_STRATEGY, ProcessedVector, VectorRecord } from './types'
import { batchCosine, batchEuclidean, magnitude } from './utils'
import { VectorCache } from './vector-cache'
import { LSH } from './lsh'

export class VectorDB {
    private db: IDBPDatabase<unknown>
    private vcache = new VectorCache<string, ProcessedVector[]>(20)
    private isCacheEnabled: boolean

    private lsh_dimensions: number = 364
    private lsh_k: number = 10

    private lsh: LSH = new LSH(this.lsh_dimensions, this.lsh_k)

    private similarityMapping: Record<SIMILARITY_STRATEGY, Function> = {
        [SIMILARITY_STRATEGY.COSINE]: batchCosine,
        [SIMILARITY_STRATEGY.EUCLIDEAN]: batchEuclidean,
    }

    constructor(db: IDBPDatabase<unknown>, dimensions: number = 364, k: number = 50, withCache: boolean = false) {
        this.db = db
        this.isCacheEnabled = withCache
        this.lsh_dimensions = dimensions
        this.lsh_k = k
    }

    async insert(vector: number[], id: number): Promise<void> {
        const tx = this.db.transaction(config.STORE_NAME, config.TX_MODE.READWRITE)
        const store = tx.objectStore(config.STORE_NAME)
        const typedArrayVector = new Float64Array(vector)
        await store.put({ vector: typedArrayVector, id, magnitude: magnitude(typedArrayVector) })
        this.lsh.insert(vector)
        return tx.done
    }

    async bulkInsert(vectors: number[][], ids: number[]): Promise<void> {
        const tx = this.db.transaction(config.STORE_NAME, config.TX_MODE.READWRITE)
        const store = tx.objectStore(config.STORE_NAME)

        const records = vectors.map((vector, index) => {
            const typedArrayVector = new Float64Array(vector)
            const hash = this.lsh.computeHash(vector)
            return {
                vector: typedArrayVector,
                id: ids[index],
                magnitude: magnitude(typedArrayVector),
                lsh: hash,
            }
        })

        await Promise.all(records.map((record) => store.put(record)))

        await tx.done
    }

    async searchWithLHS(
        queryVector: number[],
        limit: number = config.MAX_RESULTS,
        similarity: SIMILARITY_STRATEGY = config.SIMILARITY_STRATEGY.COSINE
    ): Promise<ProcessedVector[]> {
        const cacheKey = JSON.stringify(queryVector)
        const cachedResults = this.vcache.get(cacheKey)
        if (this.isCacheEnabled && cachedResults) {
            return cachedResults
        }

        const tx = this.db.transaction(config.STORE_NAME, config.TX_MODE.READONLY)
        const store = tx.objectStore(config.STORE_NAME)
        const index = store.index(config.INDEX_STRATEGIES.LSH)
        const range = IDBKeyRange.bound(this.lsh.computeHash(queryVector), this.lsh.computeHash(queryVector))
        const bucket: VectorRecord[] = await index.getAll(range)

        const typedArrayQueryVector = new Float64Array(queryVector)
        const typedArraysVectors = bucket.map((record) => new Float64Array(record.vector))

        const similarityFn = this.similarityMapping[similarity]
        const similarities = (await similarityFn(typedArrayQueryVector, typedArraysVectors)).flat()

        if (!similarities) return []

        const heap = new MaxHeap<ProcessedVector>()

        bucket.forEach(({ vector, id }, idx) => {
            heap.insert({
                vector: vector,
                similarity: similarities[idx],
                id: id,
            })
        })

        const results = Array.from(Array(limit).keys()).reduce(
            (acc) => (heap.size() > 0 ? [...acc, heap.extractMax()!] : acc),
            [] as ProcessedVector[]
        )

        this.isCacheEnabled && this.vcache.set(cacheKey, results)

        return results
    }

    async searchWithMagnitude(
        queryVector: number[],
        limit: number = config.MAX_RESULTS,
        tolerance: number = config.MAGNITUDE_TOLERANCE,
        similarity: SIMILARITY_STRATEGY = config.SIMILARITY_STRATEGY.COSINE
    ): Promise<ProcessedVector[]> {
        const cacheKey = JSON.stringify(queryVector)
        const cachedResults = this.vcache.get(cacheKey)
        if (this.isCacheEnabled && cachedResults) {
            return cachedResults
        }

        const typedArrayQueryVector = new Float64Array(queryVector)
        const queryMagnitude = magnitude(typedArrayQueryVector)
        const lowerBound = queryMagnitude - tolerance * queryMagnitude
        const upperBound = queryMagnitude + tolerance * queryMagnitude

        const tx = this.db.transaction(config.STORE_NAME, config.TX_MODE.READONLY)
        const store = tx.objectStore(config.STORE_NAME)
        const index = store.index(config.INDEX_STRATEGIES.MAGNITUDE)
        const records: VectorRecord[] = await index.getAll(IDBKeyRange.bound(lowerBound, upperBound))
        const typedArraysVectors = records.map((record) => new Float64Array(record.vector))

        const similarityFn = this.similarityMapping[similarity]
        const similarities = (await similarityFn(typedArrayQueryVector, typedArraysVectors)).flat()

        if (!similarities) return []

        const heap = new MaxHeap<ProcessedVector>()

        records.forEach((record, idx) => {
            heap.insert({
                vector: record.vector,
                similarity: similarities[idx],
                id: record.id,
            })
        })

        const results = Array.from(Array(limit).keys()).reduce(
            (acc) => (heap.size() > 0 ? [...acc, heap.extractMax()!] : acc),
            [] as ProcessedVector[]
        )

        this.isCacheEnabled && this.vcache.set(cacheKey, results)

        return results
    }

    async update(id: number, vector: number[]): Promise<void> {
        const tx = this.db.transaction(config.STORE_NAME, config.TX_MODE.READWRITE)
        const store = tx.objectStore(config.STORE_NAME)
        const record = await store.get(id)
        if (record) {
            record.vector = vector
            await store.put(record)
            if (this.vcache.get(JSON.stringify(record.vector))) {
                this.vcache.clear()
            }
        }

        return tx.done
    }

    async delete(id: number): Promise<void> {
        const tx = this.db.transaction(config.STORE_NAME, config.TX_MODE.READWRITE)
        const store = tx.objectStore(config.STORE_NAME)
        const record = await store.get(id)
        if (record) {
            await store.delete(id)
            if (this.vcache.get(JSON.stringify(record.vector))) {
                this.vcache.clear()
            }
        }

        return tx.done
    }

    async clear(): Promise<void> {
        const tx = this.db.transaction(config.STORE_NAME, config.TX_MODE.READWRITE)
        const store = tx.objectStore(config.STORE_NAME)
        await store.clear()
        await tx.done
    }
}
