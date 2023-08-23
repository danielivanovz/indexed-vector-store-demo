import { EmbeddingState } from '@/lib/app-reducer'
import { Embedding } from '@/lib/vector-core/types'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Icons } from '@/components/icons'
import { Slider } from '@/components/ui/slider'

type EmbeddingsNumberProps = {
    state: EmbeddingState
    handleSliderChange: (value: number[]) => void
    data: Embedding[]
}

const EmbeddingsNumber: React.FC<EmbeddingsNumberProps> = ({ state, handleSliderChange, data }) => {
    return (
        <>
            <div className="flex flex-row justify-between items-center">
                <Label>Number of Embeddings</Label>
                <Label>
                    <span className="text-sm text-muted-foreground">
                        {(state.embeddingsNumber > 0 && (
                            <span className="text-sm text-muted-foreground">
                                {state.embeddingsNumber} / {state.embeddings.length}
                            </span>
                        )) ||
                            (!!data.length && <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />)}
                    </span>
                </Label>
            </div>
            <Slider
                disabled={!state.embeddingsNumber || state.isLoading || state.isLoaded}
                onValueChange={handleSliderChange}
                defaultValue={[50]}
                min={0.01}
                max={100}
                step={1}
                className={cn('w-[100%] mb-6', !state.embeddingsNumber || state.isLoading || (state.isLoaded && 'opacity-50'))}
            />
        </>
    )
}

export default EmbeddingsNumber
