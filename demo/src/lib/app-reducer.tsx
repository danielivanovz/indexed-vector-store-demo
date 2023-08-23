import { Embedding, ProcessedVector, INDEX_STRATEGIES } from './vector-core/types'

interface EmbeddingState {
    isLoading: boolean
    isClearing: boolean
    isLoaded: boolean
    query: string
    isSearching: boolean
    foundEmbeddings: ProcessedVector[]
    embeddings: Embedding[]
    embeddingsNumber: number
    strategy: INDEX_STRATEGIES
}

export enum ACTIONS {
    LOAD = 'LOAD',
    LOAD_START = 'LOAD_START',
    LOAD_SUCCESS = 'LOAD_SUCCESS',
    LOAD_FAIL = 'LOAD_FAIL',
    CLEAR_START = 'CLEAR_START',
    CLEAR_SUCCESS = 'CLEAR_SUCCESS',
    SET_QUERY = 'SET_QUERY',
    SEARCH_START = 'SEARCH_START',
    SEARCH_SUCCESS = 'SEARCH_SUCCESS',
    SET_EMBEDDINGS_NUMBER = 'SET_EMBEDDINGS_NUMBER',
    SET_MAGNITURE = 'SET_MAGNITURE',
}

type AppAction =
    | { type: ACTIONS.LOAD; payload: Embedding[] }
    | { type: ACTIONS.LOAD_START }
    | { type: ACTIONS.LOAD_SUCCESS }
    | { type: ACTIONS.LOAD_FAIL }
    | { type: ACTIONS.CLEAR_START }
    | { type: ACTIONS.CLEAR_SUCCESS }
    | { type: ACTIONS.SET_QUERY; payload: string }
    | { type: ACTIONS.SEARCH_START }
    | { type: ACTIONS.SEARCH_SUCCESS; payload: ProcessedVector[] }
    | { type: ACTIONS.SET_EMBEDDINGS_NUMBER; payload: number }
    | { type: ACTIONS.SET_MAGNITURE; payload: INDEX_STRATEGIES }

const initialState = {
    isLoading: false,
    isClearing: false,
    isLoaded: false,
    query: '',
    isSearching: false,
    foundEmbeddings: [],
    embeddings: [],
    embeddingsNumber: 0,
    strategy: INDEX_STRATEGIES.MAGNITUDE,
}

function appReducer(state: EmbeddingState, action: AppAction): EmbeddingState {
    switch (action.type) {
        case 'LOAD':
            return { ...state, embeddings: action.payload, embeddingsNumber: action.payload.length / 2 }
        case 'LOAD_START':
            return { ...state, isLoading: true }
        case 'LOAD_SUCCESS':
            return { ...state, isLoading: false, isLoaded: true, foundEmbeddings: [] }
        case 'LOAD_FAIL':
            return { ...state, isLoading: false }
        case 'CLEAR_START':
            return { ...state, isClearing: true }
        case 'CLEAR_SUCCESS':
            return { ...state, isClearing: false, isLoading: false, isSearching: false, isLoaded: false, foundEmbeddings: [] }
        case 'SET_QUERY':
            return { ...state, query: action.payload }
        case 'SEARCH_START':
            return { ...state, isSearching: true }
        case 'SEARCH_SUCCESS':
            return { ...state, isSearching: false, foundEmbeddings: action.payload }
        case 'SET_EMBEDDINGS_NUMBER':
            return { ...state, embeddingsNumber: action.payload }
        case 'SET_MAGNITURE':
            return { ...state, strategy: action.payload }
        default:
            throw new Error(`Unhandled action type`)
    }
}

export { initialState, appReducer }
export type { EmbeddingState, AppAction }
