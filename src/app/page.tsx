import Header from '@/components/Header';
import PracticeExercises from '@/components/PracticeExercises';
import ProgressTracker from '@/components/ProgressTracker';
import VisualSolver from '@/components/VisualSolver';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 bg-background/90 p-4 md:p-8">
        <div className="mx-auto grid w-full max-w-6xl gap-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PracticeExercises />
            </div>
            <div className="lg:col-span-1">
              <ProgressTracker />
            </div>
          </div>
          <VisualSolver />
        </div>
      </main>
    </div>
  );
}
