'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Race } from '@/types/world';
import { Scroll } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

type TabProps = {
  race: Race;
};

export function GraveyardTab({ race }: TabProps) {
    const deadCharacters = [...race.notableCharacters]
        .filter(c => c.status === 'dead')
        .sort((a, b) => (b.deathYear || 0) - (a.deathYear || 0));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
          <Scroll className="mr-2" /> THE GRAVEYARD
        </CardTitle>
        <CardDescription>
          A memorial to the notable figures and common folk who have passed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[700px] pr-4">
            {deadCharacters.length > 0 ? (
                 <div className='grid md:grid-cols-2 gap-4'>
                    {deadCharacters.map(character => (
                        <Card key={character.id} className="bg-zinc-900 opacity-90 text-muted-foreground">
                            <CardHeader>
                                <CardTitle className='text-lg font-headline text-primary/80'>{character.name}</CardTitle>
                                <CardDescription>{character.title} | Died Y{character.deathYear} at Age {character.age}</CardDescription>
                            </CardHeader>
                            {character.deathDetails && (
                                <CardContent className="space-y-3 text-sm">
                                    <p><strong className="text-foreground/60">Cause of Death:</strong> {character.deathDetails.reason}</p>
                                    <p><strong className="text-foreground/60">Cherished:</strong> {character.deathDetails.favoriteThing}</p>
                                    <p><strong className="text-foreground/60">Happiest Memory:</strong> {character.deathDetails.happiestMemory}</p>
                                    <blockquote className="border-l-2 pl-4 italic">
                                       "{character.deathDetails.lastThought}"
                                    </blockquote>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                 </div>
            ) : (
                <div className='flex flex-col items-center justify-center text-center py-16 text-muted-foreground h-96'>
                    <Scroll className="w-16 h-16 mb-4" />
                    <p>The annals of the fallen are empty.</p>
                    <p className='text-sm'>All are still living.</p>
                </div>
            )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
