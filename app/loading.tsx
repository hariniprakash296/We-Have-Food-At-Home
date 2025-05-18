/**
 * Loading component for the application
 * This component is shown while the page is loading
 * It uses the loading spinner defined in globals.css
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="loading-spinner" />
        <p className="text-muted-foreground animate-pulse">Loading recipes...</p>
      </div>
    </div>
  )
}
