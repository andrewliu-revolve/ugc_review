"use client"

import { useState } from "react"
import { data, type Review } from "@/lib/data/reviews"
import { ImageGrid } from "@/components/gallery/image-grid"
import { ReviewSlideOver } from "@/components/gallery/review-slide-over"

export default function ImageGallery() {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Product Reviews Gallery</h1>
          <p className="text-muted-foreground text-lg">Browse customer reviews and product images</p>
        </div>

        {/* Image Grid */}
        <ImageGrid reviews={data} onImageClick={setSelectedReview} />
      </div>

      {/* Slide-over Panel */}
      <ReviewSlideOver review={selectedReview} onClose={() => setSelectedReview(null)} />
    </div>
  )
}
