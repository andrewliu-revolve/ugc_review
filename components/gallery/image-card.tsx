"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import type { Review } from "@/lib/data/reviews"

interface ImageCardProps {
    review: Review
    onClick: (review: Review) => void
}

export function ImageCard({ review, onClick }: ImageCardProps) {
    let productImageUrl = ""
    if (review["Images Published Image URL"].length > 0) {
        productImageUrl = review["Images Published Image URL"]
    } else {
        productImageUrl = "https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM="
    }
    return (
        <div
            className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200"
            onClick={() => onClick(review)}
        >
            <div className="aspect-3/4 relative">
                <Image
                    src={productImageUrl}
                    alt={review["Review Title"]}
                    fill
                    className="object-cover transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-black/50 text-white">
                        {review["Review Score"]} ⭐
                    </Badge>
                </div>
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-sm mb-1 line-clamp-1">{review["Review Title"]}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{review["Review Content"]}</p>
            </div>
        </div>
    )
}
