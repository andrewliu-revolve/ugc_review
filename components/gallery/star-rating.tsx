import { Star } from "lucide-react"

interface StarRatingProps {
    score: number
    className?: string
}

export function StarRating({ score, className = "" }: StarRatingProps) {
    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < score ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
            ))}
        </div>
    )
}
