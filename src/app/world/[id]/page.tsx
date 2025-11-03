import Header from '@/components/Header';
import Dashboard from '@/components/world/Dashboard';

export default function WorldPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
        <Dashboard worldId={params.id} />
      </main>
    </div>
  );
}
