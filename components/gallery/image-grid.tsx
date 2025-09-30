"use client"

import type { Review } from "@/lib/data/reviews"
import { ImageCard } from "./image-card"

interface ImageGridProps {
    reviews: Review[]
    onImageClick: (review: Review) => void
}

export function ImageGrid({ reviews, onImageClick }: ImageGridProps) {
    // Expand reviews with multiple image URLs into separate entries
    const expandedReviews = reviews.flatMap((review) => {
        const imageUrls = review["Images Published Image URL"]
        
        // If no image URLs or empty, return the original review
        if (!imageUrls || imageUrls.trim() === '') {
            return [review]
        }
        
        // Split by semicolon and create separate review entries for each URL
        const urls = imageUrls.split(';').map(url => url.trim()).filter(url => url !== '')
        
        // If only one URL, return the original review
        if (urls.length <= 1) {
            return [review]
        }
        
        // Create separate review entries for each URL
        return urls.map((url, index) => ({
            ...review,
            "Images Published Image URL": url,
            // Create unique key by appending URL index to Review ID
            "Review ID": Number(`${review["Review ID"]}${index}`)
        }))
    })

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {expandedReviews.map((review, index) => (
                <ImageCard key={`${review["Review ID"]}_${index}`} review={review} onClick={onImageClick} />
            ))}
        </div>
    )
}
