import { ProcessedVector, Embedding } from '@/lib/vector-core/types'

import { Fragment } from 'react'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

type ResultsContainerProps = {
    foundEmbeddings: ProcessedVector[]
    time: string
    embeddings: Embedding[]
}

const ResultsContainer: React.FC<ResultsContainerProps> = ({ foundEmbeddings, time, embeddings }) => {
    return foundEmbeddings.length > 0 ? (
        <>
            <Label>
                Results: Top 10<span className="text-sm text-muted-foreground"> (search took {time}ms)</span>
            </Label>
            <ScrollArea className="h-40 ">
                <div className="p-4">
                    {foundEmbeddings.map((vec) => (
                        <Fragment key={vec.id}>
                            <div className="text-sm">
                                {Number(vec.similarity).toFixed(2)}
                                {' - '}
                                {embeddings[vec.id].text}
                            </div>
                            <Separator className="my-2" />
                        </Fragment>
                    ))}
                </div>
            </ScrollArea>
        </>
    ) : null
}

export default ResultsContainer
