"use client"

import { Card, CardContent } from "@/components/ui/card"

interface SkeletonLoaderProps {
  viewMode: 'grid' | 'list'
  count?: number
}

export default function SkeletonLoader({ viewMode, count = 8 }: SkeletonLoaderProps) {
  return (
    <>
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20 md:pb-4">
          {Array.from({ length: count }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4">
                {/* Thumbnail skeleton */}
                <div className="mb-3 w-full h-40 bg-gray-200 rounded-lg"></div>

                {/* File name skeleton */}
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2 pb-20 md:pb-4">
          {Array.from({ length: count }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {/* Thumbnail skeleton */}
                    <div className="w-12 h-12 bg-gray-200 rounded"></div>

                    {/* File info skeleton */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>

                  {/* Menu button skeleton */}
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}