"use client"

import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface RatingsFilterProps {
    selectedRatings: number[]
    onRatingsChange: (ratings: number[]) => void
}

export function RatingsFilter({ selectedRatings, onRatingsChange }: RatingsFilterProps) {
    const ratings = [5, 4, 3, 2, 1]

    const toggleRating = (rating: number) => {
        const newRatings = selectedRatings.includes(rating)
            ? selectedRatings.filter(r => r !== rating)
            : [...selectedRatings, rating]
        onRatingsChange(newRatings)
    }

    const clearAll = () => {
        onRatingsChange([])
    }

    const selectAll = () => {
        onRatingsChange(ratings)
    }

    return (
        <div className="mb-6">
            <h3 className="text-sm font-medium text-foreground">Filter by Rating</h3>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                    {ratings.map((rating) => {
                        const isSelected = selectedRatings.includes(rating)
                        return (
                            <button
                                key={rating}
                                onClick={() => toggleRating(rating)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${isSelected
                                    ? "bg-foreground text-background"
                                    : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <div className="flex items-center">
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-3 h-3 ${i < rating
                                                ? (isSelected ? "fill-current" : "fill-muted-foreground")
                                                : "fill-none"
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span>{rating}</span>
                            </button>
                        )
                    })}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={selectAll}
                        className="h-8 text-xs"
                    >
                        All
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAll}
                        className="h-8 text-xs"
                    >
                        Clear
                    </Button>
                </div>
            </div>
        </div>
    )
}