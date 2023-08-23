import { useState, useEffect } from 'react'
import { createDB } from './vector-core/create-database'
import { VectorDB } from './vector-core/vector-database'
import { INDEX_STRATEGIES, SIMILARITY_STRATEGY } from './vector-core/types'

function useVectorStore() {
    const [db, setDb] = useState<VectorDB | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [time, setTime] = useState<string>('0')

    useEffect(() => {
        async function initialize() {
            const database = await createDB()
            setDb(new VectorDB(database))
            setLoading(false)
        }
        initialize()
    }, [])

    const insert = async (vector: number[], id: number) => {
        if (!db) return
        await db.insert(vector, id)
    }

    const bulkInsert = async (vectors: number[][], ids: number[]) => {
        if (!db) return
        await db.bulkInsert(vectors, ids)
    }

    const search = async (queryVector: number[], limit: number = 10, strategy: INDEX_STRATEGIES = INDEX_STRATEGIES.MAGNITUDE) => {
        if (!db) return []

        const applyStrategy = (strategy: INDEX_STRATEGIES) => () => {
            switch (strategy) {
                case INDEX_STRATEGIES.LSH:
                    return db.searchWithLHS(queryVector, limit, SIMILARITY_STRATEGY.COSINE)
                case INDEX_STRATEGIES.MAGNITUDE:
                    return db.searchWithMagnitude(queryVector, limit, 0.00000001, SIMILARITY_STRATEGY.COSINE)
                default:
                    return db.searchWithMagnitude(queryVector, limit, 0.00000001, SIMILARITY_STRATEGY.COSINE)
            }
        }

        const t0 = performance.now()
        const embeddings = applyStrategy(strategy)()
        const t1 = performance.now()

        setTime((t1 - t0).toFixed(2))
        return embeddings
    }

    const update = async (id: number, vector: number[]) => {
        if (!db) return
        await db.update(id, vector)
    }

    const remove = async (id: number) => {
        if (!db) return
        await db.delete(id)
    }

    const clear = async () => {
        if (!db) return
        await db.clear()
    }

    return {
        loading,
        insert,
        bulkInsert,
        search,
        update,
        remove,
        clear,
        time,
    }
}

export default useVectorStore
