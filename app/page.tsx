"use client"

import { useState, useMemo } from "react"
import { data, type Review } from "@/lib/data/reviews"
import { ImageGrid } from "@/components/gallery/image-grid"
import { ReviewSlideOver } from "@/components/gallery/review-slide-over"
import { RatingsFilter } from "@/components/gallery/ratings-filter"

export default function ImageGallery() {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [selectedRatings, setSelectedRatings] = useState<number[]>([5, 4, 3, 2, 1])

  const filteredReviews = useMemo(() => {
    if (selectedRatings.length === 0) {
      return []
    }
    return data.filter(review => selectedRatings.includes(review["Review Score"]))
  }, [selectedRatings])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Product Reviews Gallery</h1>
          <p className="text-muted-foreground text-lg">Browse customer reviews and product images</p>
        </div>

        {/* Ratings Filter */}
        <RatingsFilter 
          selectedRatings={selectedRatings} 
          onRatingsChange={setSelectedRatings} 
        />

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {filteredReviews.length} of {data.length} reviews
          </p>
          
          {filteredReviews.length === 0 && selectedRatings.length > 0 && (
            <p className="text-sm text-muted-foreground">
              No reviews match your filter
            </p>
          )}
        </div>

        {/* Image Grid */}
        <ImageGrid reviews={filteredReviews} onImageClick={setSelectedReview} />
      </div>

      {/* Slide-over Panel */}
      <ReviewSlideOver review={selectedReview} onClose={() => setSelectedReview(null)} />
    </div>
  )
}
