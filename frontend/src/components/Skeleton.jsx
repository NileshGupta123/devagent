// ─────────────────────────────────────────
// Skeleton — Loading placeholders
// Shows while data is being fetched
// ─────────────────────────────────────────

function SkeletonBox({ className = '' }) {
  return (
    <div className={`animate-pulse bg-border/50 rounded-lg ${className}`} />
  )
}

function SkeletonText({ width = 'w-full', height = 'h-4' }) {
  return (
    <div className={`animate-pulse bg-border/50 rounded ${width} ${height}`} />
  )
}

// ── Score Card Skeleton ──
export function ScoreCardSkeleton() {
  return (
    <div className="card space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonText width="w-40" height="h-6" />
          <SkeletonText width="w-24" height="h-4" />
        </div>
        <SkeletonBox className="w-24 h-10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <SkeletonText width="w-24" height="h-4" />
                <SkeletonText width="w-12" height="h-4" />
              </div>
              <SkeletonBox className="w-full h-2" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center">
          <SkeletonBox className="w-44 h-44 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// ── Results Panel Skeleton ──
export function ResultsPanelSkeleton() {
  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonText width="w-48" height="h-6" />
        <SkeletonBox className="w-20 h-8" />
      </div>

      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i}
            className="flex items-start gap-3 p-3 rounded-lg bg-black/20 border border-border">
            <SkeletonBox className="w-20 h-6 shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonText width="w-full" height="h-4" />
              <SkeletonText width="w-3/4" height="h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Dashboard Skeleton ──
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card space-y-3">
            <SkeletonBox className="w-8 h-8 rounded-full" />
            <SkeletonText width="w-16" height="h-8" />
            <SkeletonText width="w-24" height="h-4" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <div key={i} className="card space-y-4">
            <SkeletonText width="w-32" height="h-6" />
            <SkeletonBox className="w-full h-48" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card space-y-4">
        <SkeletonText width="w-40" height="h-6" />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i}
            className="flex items-center justify-between p-4
                       rounded-xl bg-black/20 border border-border">
            <div className="flex items-center gap-4">
              <SkeletonBox className="w-8 h-8 rounded-lg" />
              <div className="space-y-1">
                <SkeletonText width="w-32" height="h-4" />
                <SkeletonText width="w-24" height="h-3" />
              </div>
            </div>
            <SkeletonText width="w-16" height="h-6" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Memory Skeleton ──
export function MemorySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SkeletonBox className="w-10 h-10 rounded-xl" />
              <div className="space-y-1">
                <SkeletonText width="w-32" height="h-4" />
                <SkeletonText width="w-24" height="h-3" />
              </div>
            </div>
            <div className="space-y-1 text-right">
              <SkeletonText width="w-12" height="h-8" />
              <SkeletonText width="w-20" height="h-4" />
            </div>
          </div>
          <SkeletonBox className="w-full h-2" />
        </div>
      ))}
    </div>
  )
}

// ── Generic Card Skeleton ──
export function CardSkeleton({ lines = 3 }) {
  return (
    <div className="card space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonText
          key={i}
          width={i === 0 ? 'w-1/2' : i === lines - 1 ? 'w-3/4' : 'w-full'}
          height="h-4"
        />
      ))}
    </div>
  )
}