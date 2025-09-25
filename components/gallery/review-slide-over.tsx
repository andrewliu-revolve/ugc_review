"use client"

import { Button } from "@/components/ui/button"
import { X, Calendar, User, MapPin } from "lucide-react"
import Image from "next/image"
import type { Review } from "@/lib/data/reviews"
import { StarRating } from "./star-rating"
import Link from "next/link"

interface ReviewSlideOverProps {
    review: Review | null
    onClose: () => void
}

export function ReviewSlideOver({ review, onClose }: ReviewSlideOverProps) {
    if (!review) return null

    let productImageUrl = ""
    if (review["Images Published Image URL"].length > 0) {
        productImageUrl = review["Images Published Image URL"]
    } else {
        productImageUrl = "https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM="
    }

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={onClose} />

            {/* Panel */}
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-xl transform transition-transform duration-300 ease-in-out">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                        <h2 className="text-lg font-semibold">Review Details</h2>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Review Image */}
                        <div className="aspect-square relative rounded-lg overflow-hidden">
                            <Image
                                src={productImageUrl}
                                alt={review["Review Title"]}
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Review Info */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-bold mb-2">{review["Review Title"]}</h3>
                                <div className="flex items-center gap-2 mb-3">
                                    <StarRating score={review["Review Score"]} />
                                    <span className="text-sm text-muted-foreground">{review["Review Score"]}/5</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span>{review["Review Reviewer Name"]}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span>{review["Review Created Date"]}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span>{review["Review Country Code"]}</span>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Review</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">{review["Review Content"]}</p>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Product</h4>
                                <p className="text-sm">{review["Product Name"]}</p>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Link to Product</h4>
                                <Link href={review["Product URL"]} target="_blank">
                                    <p className="text-sm underline">{review["Product URL"]}</p>
                                </Link>
                            </div>

                            {/* Product Image */}
                            {review["Product Image URL"] && review["Product Image URL"] !== review["Images Published Image URL"] && (
                                <div>
                                    <h4 className="font-semibold mb-2">Product Image</h4>
                                    <div className="aspect-square relative rounded-lg overflow-hidden max-w-48">
                                        <Image
                                            src={review["Product Image URL"] || "/placeholder.svg"}
                                            alt={review["Product Name"]}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
