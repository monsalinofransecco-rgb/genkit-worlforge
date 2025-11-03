'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getWorlds } from '@/lib/world-store';
import type { World } from '@/types/world';
import Header from '@/components/Header';
import { BookOpen, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [worlds, setWorlds] = useState<World[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedWorlds = getWorlds();
    // Filter out any preliminary worlds that haven't been fully forged
    setWorlds(savedWorlds.filter(w => w.races.length > 0 && w.races.every(r => r.name !== `Unnamed Race ${r.id}`)));
  }, []);

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <PlusCircle className="w-6 h-6" /> Create a New World
              </CardTitle>
              <CardDescription>
                Forge a new realm and begin its chronicle.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/create-world" passHref>
                <Button className="w-full">
                  Begin a New Chronicle
                </Button>
              </Link>
            </CardContent>
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
