import Link from 'next/link'
import { Home, Network } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <Network className="w-10 h-10 text-primary" />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4">404</h1>
        <p className="text-slate-400 mb-8 max-w-md">
          The neural network architecture you&#39;re looking for doesn&#39;t exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary border border-primary/20 rounded-xl text-sm font-semibold text-white hover:bg-primary/95 transition-all"
          >
            <Home className="h-4 w-4" />
            Return Home
          </Link>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800/50 border border-border/30 rounded-xl text-sm font-semibold text-slate-350 hover:bg-slate-800/70 hover:text-white transition-all"
          >
            <Network className="h-4 w-4" />
            Browse Catalog
          </Link>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border/10">
          <p className="text-xs text-slate-500 mb-3">Popular Architectures:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['resnet50', 'densenet121', 'vgg16', 'mobilenet'].map((id) => (
              <Link
                key={id}
                href={`/models/${id}`}
                className="text-xs text-primary hover:text-blue-300 transition-colors"
              >
                {id}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
