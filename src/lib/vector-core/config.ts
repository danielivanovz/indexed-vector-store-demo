import { INDEX_STRATEGIES } from "./types"

const DATABASE_NAME = 'VectorDB'
const DATABASE_VERSION = 1

enum TX_MODE {
    READONLY = 'readonly',
    READWRITE = 'readwrite',
}

const STORE_NAME = 'vectors'
const MAGNITUDE_TOLERANCE = 0.00000001
const MAX_RESULTS = 10

export enum SIMILARITY_STRATEGY {
    COSINE = 'cosine',
    EUCLIDEAN = 'euclidean',
}

const config = {
    DATABASE_NAME,
    DATABASE_VERSION,
    TX_MODE,
    STORE_NAME,
    INDEX_STRATEGIES,
    MAGNITUDE_TOLERANCE,
    MAX_RESULTS,
    SIMILARITY_STRATEGY,
}

export default config