import { BrainCircuit } from 'lucide-react';
import ProfileSelector from './ProfileSelector';

export default function Header() {
  // Check if API key exists (will be true when configured)
  const hasApiKey = true; // In production, check actual env var status
  
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="flex w-full items-center justify-between">
        <a
          href="#"
          className="flex items-center gap-2 text-lg font-semibold text-primary md:text-base"
        >
          <BrainCircuit className="h-8 w-8 text-primary" />
          <span className="font-headline text-2xl font-bold tracking-tight">MathMinds</span>
        </a>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <div className={`h-2 w-2 rounded-full ${hasApiKey ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-muted-foreground hidden sm:inline">
              {hasApiKey ? 'IA Conectada' : 'Modo Demo'}
            </span>
          </div>
          <ProfileSelector />
        </div>
      </nav>
    </header>
  );
}
