"use client"

import type { Review } from "@/lib/data/reviews"
import { ImageCard } from "./image-card"

interface ImageGridProps {
    reviews: Review[]
    onImageClick: (review: Review) => void
}

export function ImageGrid({ reviews, onImageClick }: ImageGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {reviews.map((review) => (
                <ImageCard key={review["Review ID"]} review={review} onClick={onImageClick} />
            ))}
        </div>
    )
}
