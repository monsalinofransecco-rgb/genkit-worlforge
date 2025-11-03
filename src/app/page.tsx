'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createWorld, getWorlds } from '@/lib/world-store';
import type { World } from '@/types/world';
import Header from '@/components/Header';
import { BookOpen, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [worldName, setWorldName] = useState('');
  const [era, setEra] = useState('Ancient');
  const [raceCount, setRaceCount] = useState(1);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setWorlds(getWorlds());
  }, []);

  const handleCreateWorld = (e: React.FormEvent) => {
    e.preventDefault();
    if (!worldName.trim()) {
      alert('Please enter a world name.');
      return;
    }
    const newWorld = createWorld(worldName, era, raceCount);
    router.push(`/world/${newWorld.id}`);
  };

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="md:col-span-2 lg:col-span-1">
            <form onSubmit={handleCreateWorld}>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <PlusCircle className="w-6 h-6" /> Create a New World
                </CardTitle>
                <CardDescription>
                  Forge a new realm and begin its chronicle.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="world-name">World Name</Label>
                  <Input
                    id="world-name"
                    value={worldName}
                    onChange={(e) => setWorldName(e.target.value)}
                    placeholder="e.g., Aerthos, The Shattered Isles"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="era">Era</Label>
                  <Input
                    id="era"
                    value={era}
                    onChange={(e) => setEra(e.target.value)}
                    placeholder="e.g., The Age of Dragons"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="race-count">Initial Race Count</Label>
                  <Input
                    id="race-count"
                    type="number"
                    value={raceCount}
                    onChange={(e) => setRaceCount(Math.max(1, parseInt(e.target.value, 10)))}
                    min="1"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">
                  Begin Chronicle
                </Button>
              </CardFooter>
            </form>
          </Card>

          {worlds.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <BookOpen className="w-6 h-6" /> Continue a Chronicle
                </CardTitle>
                <CardDescription>
                  Return to a previously forged world.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {worlds.map((world) => (
                  <Link key={world.id} href={`/world/${world.id}`} passHref>
                    <Card className="hover:border-primary hover:shadow-lg transition-all transform hover:-translate-y-1">
                      <CardHeader>
                        <CardTitle className="truncate">{world.name}</CardTitle>
                        <CardDescription>{world.era}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Year: {world.currentYear}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Races: {world.races.length}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
