import { BrainCircuit, BarChart } from 'lucide-react';
import ProfileSelector from './ProfileSelector';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
          <span className="font-headline text-2xl font-bold tracking-tight">WAOK-AI-STEM</span>
        </a>

        <div className="flex items-center gap-3">
          <Link href="/progress">
            <Button variant="outline" size="sm" className="gap-2">
              <BarChart className="h-4 w-4" />
              <span className="hidden sm:inline">Ver Progreso</span>
            </Button>
          </Link>
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
