import { Skeleton } from "@/components/ui/skeleton";

export function DonorDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header Skeleton */}
        <div className="mb-8 space-y-3">
          <Skeleton className="h-10 w-64 rounded-2xl" />
          <Skeleton className="h-5 w-96 rounded-2xl" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-32 rounded-2xl" />
            </div>
          ))}
        </div>

        {/* Main Content Cards */}
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DonorTableSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 space-y-3">
          <Skeleton className="h-10 w-64 rounded-2xl" />
          <Skeleton className="h-5 w-96 rounded-2xl" />
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <Skeleton className="h-12 flex-1 rounded-2xl" />
          <Skeleton className="h-12 w-40 rounded-2xl" />
          <Skeleton className="h-12 w-32 rounded-2xl" />
        </div>

        {/* Table */}
        <div className="rounded-2xl border bg-card">
          <div className="p-6 space-y-4">
            {/* Table Header */}
            <div className="flex gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-6 flex-1 rounded-xl" />
              ))}
            </div>
            
            {/* Table Rows */}
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex gap-4">
                {[...Array(6)].map((_, j) => (
                  <Skeleton key={j} className="h-12 flex-1 rounded-xl" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DonorCardGridSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 space-y-3">
          <Skeleton className="h-10 w-64 rounded-2xl" />
          <Skeleton className="h-5 w-96 rounded-2xl" />
        </div>

        {/* Search and Filters */}
        <div className="flex gap-3 mb-6">
          <Skeleton className="h-12 flex-1 rounded-2xl" />
          <Skeleton className="h-12 w-32 rounded-2xl" />
        </div>

        {/* Card Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 rounded-2xl" />
              <Skeleton className="h-6 w-3/4 rounded-xl" />
              <Skeleton className="h-4 w-full rounded-xl" />
              <Skeleton className="h-4 w-5/6 rounded-xl" />
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1 rounded-xl" />
                <Skeleton className="h-10 w-20 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DonorNewsfeedSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 space-y-3">
          <Skeleton className="h-10 w-72 rounded-2xl" />
          <Skeleton className="h-5 w-96 rounded-2xl" />
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-8">
          <Skeleton className="h-10 w-40 rounded-2xl" />
          <Skeleton className="h-10 w-32 rounded-2xl" />
        </div>

        {/* Feed Posts */}
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-2xl border bg-card p-6 space-y-4">
              {/* Post Header */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48 rounded-xl" />
                  <Skeleton className="h-4 w-32 rounded-xl" />
                </div>
              </div>
              
              {/* Post Content */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded-xl" />
                <Skeleton className="h-4 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4 rounded-xl" />
              </div>

              {/* Post Image */}
              {i % 2 === 0 && <Skeleton className="h-64 rounded-2xl" />}

              {/* Post Actions */}
              <div className="flex gap-4">
                <Skeleton className="h-10 w-24 rounded-xl" />
                <Skeleton className="h-10 w-24 rounded-xl" />
                <Skeleton className="h-10 w-24 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DonorProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-start gap-6">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-64 rounded-2xl" />
              <Skeleton className="h-5 w-96 rounded-2xl" />
              <div className="flex gap-3">
                <Skeleton className="h-10 w-32 rounded-xl" />
                <Skeleton className="h-10 w-32 rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-48 rounded-xl" />
              <Skeleton className="h-32 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DonorAnalyticsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 space-y-3">
          <Skeleton className="h-10 w-64 rounded-2xl" />
          <Skeleton className="h-5 w-96 rounded-2xl" />
        </div>

        {/* Summary Card */}
        <Skeleton className="h-32 rounded-2xl mb-8" />

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>

        {/* More Charts */}
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  );
}
