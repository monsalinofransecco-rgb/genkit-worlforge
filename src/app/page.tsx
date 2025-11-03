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
import { getWorlds, deleteWorld } from '@/lib/world-store';
import type { World } from '@/types/world';
import Header from '@/components/Header';
import { BookOpen, PlusCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Home() {
  const router = useRouter();
  const [worlds, setWorlds] = useState<World[]>([]);
  const [worldToDelete, setWorldToDelete] = useState<World | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedWorlds = getWorlds();
    setWorlds(savedWorlds.filter(w => w.races.length > 0 && w.races.every(r => r.name !== '')));
  }, []);

  const openDeleteDialog = (world: World) => {
    setWorldToDelete(world);
  };

  const confirmDelete = () => {
    if (worldToDelete) {
      deleteWorld(worldToDelete.id);
      setWorlds(worlds.filter(w => w.id !== worldToDelete.id));
      setWorldToDelete(null);
    }
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
                  <Card key={world.id} className="flex flex-col hover:border-primary transition-colors">
                     <Link href={`/world/${world.id}`} passHref className='flex-grow'>
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
                    </Link>
                    <CardFooter className='p-2 pt-0'>
                        <Button variant="ghost" size="icon" className="ml-auto text-muted-foreground hover:text-destructive h-8 w-8" onClick={(e) => {
                            e.stopPropagation();
                            openDeleteDialog(world);
                        }}>
                            <Trash2 className='h-4 w-4'/>
                        </Button>
                    </CardFooter>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

       <AlertDialog open={!!worldToDelete} onOpenChange={() => setWorldToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the world of{' '}
              <span className='font-bold text-primary'>{worldToDelete?.name}</span> and all of its history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}