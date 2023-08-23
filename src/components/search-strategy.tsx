import { INDEX_STRATEGIES } from "@/lib/vector-core/types"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

type StrategiesProps = {
    handleStrategyChange: (strategy: INDEX_STRATEGIES) => void
    strategy: INDEX_STRATEGIES
}

const SearchStrategy: React.FC<StrategiesProps> = ({ handleStrategyChange, strategy }) => {
    const isLSH = strategy === INDEX_STRATEGIES.LSH
    const isMagnitude = strategy === INDEX_STRATEGIES.MAGNITUDE

    return (
        <>
            <Label>Search Strategies</Label>
            <div className="flex items-center space-x-2">
                <Switch checked={isLSH} onCheckedChange={() => handleStrategyChange(INDEX_STRATEGIES.LSH)} />
                <Label>
                    Use LSH<span className="text-sm text-muted-foreground"> (Locality Sensitive Hashing)</span>
                </Label>
            </div>
            <div className="flex items-center space-x-2">
                <Switch checked={isMagnitude} onCheckedChange={() => handleStrategyChange(INDEX_STRATEGIES.MAGNITUDE)} />
                <Label>
                    Use Magnitude<span className="text-sm text-muted-foreground"> (Magnitude Indexing)</span>
                </Label>
            </div>
        </>
    )
}

export default SearchStrategy