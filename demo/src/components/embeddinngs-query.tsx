import { Embedding } from '@/lib/vector-core/types'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

type EmbeddingsQueryProps = {
    loaded: boolean
    query: string
    setQuery: (query: string) => void
    randomEmbeddings: Embedding[]
}

const EmbeddingsQuery: React.FC<EmbeddingsQueryProps> = ({ loaded, query, setQuery, randomEmbeddings }) => {
    return (
        <>
            <Label>
                Search Query <span className="text-sm text-muted-foreground">(required)</span>
            </Label>
            <Select disabled={!loaded} onValueChange={setQuery} defaultValue={query}>
                <SelectTrigger id="query">
                    <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent position="popper">
                    {randomEmbeddings.map((embedding) => (
                        <SelectItem key={embedding.text} value={embedding.text}>
                            {embedding.text}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </>
    )
}

export default EmbeddingsQuery
