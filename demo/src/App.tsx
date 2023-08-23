import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { Icons } from './components/icons'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

import useVectorStore from './lib/use-vector-store'
import { Embedding, INDEX_STRATEGIES } from '@/lib/vector-core/types'

import { ACTIONS, appReducer, initialState } from '@/lib/app-reducer'
import { api, cn } from '@/lib/utils'
import useMultiFileDownloader from '@/lib/use-multifile-downloader'
import { Progress } from '@/components/ui/progress'
import EmbeddingsQuery from '@/components/embeddinngs-query'
import SearchStrategy from '@/components/search-strategy'
import EmbeddingsNumber from '@/components/embeddings-number'
import ResultsContainer from '@/components/results-container'
import SpinnerWrapper from '@/components/spinner-wrapper'

const useRandomEmbedding = (howMany: number, embeddings: Embedding[]) => {
    const random = Math.floor(Math.random() * embeddings.length)
    return embeddings.slice(random, random + howMany)
}

function App() {
    const { progress, downloadAllFiles, completed, data } = useMultiFileDownloader(
        Array.from({ length: 5 }, (_, i) => `${api()}/embeddings_${i + 1}.json`)
    )

    const [state, dispatch] = useReducer(appReducer, initialState)

    useEffect(() => {
        if (data.length > 0) {
            dispatch({ type: ACTIONS.LOAD, payload: data as Embedding[] })
        }
    }, [data])

    const { bulkInsert, clear, search, time } = useVectorStore()

    const loadEmbeddings = useCallback(async () => {
        if (state.isLoading || state.isLoaded) return

        dispatch({ type: ACTIONS.LOAD_START })
        try {
            await clear()
            await bulkInsert(
                state.embeddings.slice(0, state.embeddingsNumber).map((e) => e.vector),
                state.embeddings.slice(0, state.embeddingsNumber).map((_, i) => i)
            )
            dispatch({ type: ACTIONS.LOAD_SUCCESS })
        } catch (error) {
            dispatch({ type: ACTIONS.LOAD_FAIL })
            console.error(error)
        }
    }, [state.isLoading, state.isLoaded, state.embeddings, bulkInsert])

    const clearStore = useCallback(async () => {
        dispatch({ type: ACTIONS.CLEAR_START })
        try {
            await clear()
            dispatch({ type: ACTIONS.CLEAR_SUCCESS })
        } catch (error) {
            console.error(error)
        }
    }, [clear])

    const searchForEmbeddings = useCallback(async () => {
        if (!state.query) return

        dispatch({ type: ACTIONS.SEARCH_START })
        const selectedEmbedding = state.embeddings.find((e) => e.text === state.query)
        if (selectedEmbedding) {
            const searchResults = await search(selectedEmbedding.vector, 10, state.strategy)

            dispatch({ type: ACTIONS.SEARCH_SUCCESS, payload: searchResults })
        }
    }, [state.query, state.embeddings, search])

    const randomEmbeddings = useMemo(() => useRandomEmbedding(10, state.embeddings.slice(0, state.embeddingsNumber)), [state.embeddingsNumber])

    const downloadButtonLabel = useMemo(() => {
        if (completed) return 'Downloaded'
        if (progress > 0) return <SpinnerWrapper text={`Downloading ${progress.toFixed(2)}%`} />

        return 'Download Embeddings'
    }, [completed, progress])

    const loadButtonLabel = useMemo(() => {
        if (state.isLoading) return <SpinnerWrapper text="Loading..." />
        if (state.isLoaded) return `${state.embeddingsNumber} Embeddings Loaded`

        return 'Load Embeddings'
    }, [state.isLoading, state.isLoaded, state.embeddings])

    const searchButtonLabel = useMemo(() => {
        if (state.isSearching) return <SpinnerWrapper text="Searching..." />

        return 'Start Search'
    }, [state.isSearching])

    const clearButtonLabel = useMemo(() => {
        if (state.isClearing) return <SpinnerWrapper text="Clearing..." />

        return 'Clear Database'
    }, [state.isClearing])

    const handleStrategyChange = (strategy: INDEX_STRATEGIES) => {
        dispatch({ type: ACTIONS.SET_MAGNITURE, payload: strategy })
    }

    const handleEmbeddingsNumberChange = (value: number[]) => {
        const max = state.embeddings.length
        const howMany = Math.floor((value[0] * max) / 100)

        dispatch({ type: ACTIONS.SET_EMBEDDINGS_NUMBER, payload: howMany })
    }

    const handleQueryChange = (query: string) => {
        dispatch({ type: ACTIONS.SET_QUERY, payload: query })
    }

    return (
        <main className="min-h-screen m-auto bg-background antialiased items-center justify-center">
            <div className="relative h-screen flex justify-center items-center gap-2">
                <Card className="w-[350px] transition-shadow duration-300 hover:shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex flex-row items-center justify-between">
                            <Badge className="my-2">DEMO</Badge>
                            <a href="https://github.com/danielivanovz">
                                <Icons.gitHub className="h-5 w-5 mr-2" />
                            </a>
                        </CardTitle>
                        <CardDescription>
                            Please insert the vectors and then search for the most similar one. <br />
                            <br />
                            <span className="text-sm text-muted-foreground">
                                You can also use the browser inspect tool in order to visualize Indexed DB.
                            </span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid w-full items-center gap-4 my-4">
                            <Button disabled={state.isLoading || state.isLoaded || completed} onClick={downloadAllFiles}>
                                {downloadButtonLabel}
                            </Button>
                            <Progress className={cn(completed && 'opacity-50')} value={progress} />
                        </div>
                        <form>
                            <div className="grid w-full items-center gap-4 my-4">
                                <SearchStrategy handleStrategyChange={handleStrategyChange} strategy={state.strategy} />
                            </div>
                            <div className="grid w-full items-center gap-4">
                                <EmbeddingsNumber state={state} handleSliderChange={handleEmbeddingsNumberChange} data={data} />
                            </div>
                            <div className="grid w-full items-center gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <Button disabled={state.isLoading || state.isLoaded || !completed} variant="outline" onClick={loadEmbeddings}>
                                        {loadButtonLabel}
                                    </Button>
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <EmbeddingsQuery
                                        loaded={state.isLoaded}
                                        query={state.query}
                                        setQuery={handleQueryChange}
                                        randomEmbeddings={randomEmbeddings}
                                    />
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <ResultsContainer foundEmbeddings={state.foundEmbeddings} time={time} embeddings={state.embeddings} />
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button disabled={state.isClearing || !state.isLoaded} variant="destructive" onClick={clearStore}>
                            {clearButtonLabel}
                        </Button>
                        <Button disabled={state.isSearching || !state.isLoaded || !state.query} onClick={searchForEmbeddings}>
                            {searchButtonLabel}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </main>
    )
}

export default App
