export interface Embedding {
    text: string
    vector: number[]
}

export interface VectorRecord {
    id: number
    vector: number[]
}

export interface ProcessedVector {
    id: number
    vector: number[]
    similarity: number
}

export enum INDEX_STRATEGIES {
    LSH = 'lsh',
    MAGNITUDE = 'magnitude',
}

export enum SIMILARITY_STRATEGY {
    COSINE = 'cosine',
    EUCLIDEAN = 'euclidean',
}
