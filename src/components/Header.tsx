import { BrainCircuit, User } from 'lucide-react';
import { Button } from './ui/button';

export default function Header() {
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

        <Button variant="outline" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </nav>
    </header>
  );
}
