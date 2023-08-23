import { Icons } from "@/components/icons"

type SpinnerWrapperProps = {
    text: string
}

const SpinnerWrapper: React.FC<SpinnerWrapperProps> = ({ text }) => {
    return (
        <>
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            {text}
        </>
    )
}

export default SpinnerWrapper
