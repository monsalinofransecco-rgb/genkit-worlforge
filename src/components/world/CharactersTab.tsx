'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { World, NotableCharacter } from '@/types/world';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  runSimulateNotableCharacterDeaths,
} from '@/app/actions';
import { Loader2, Users, UserPlus, Skull } from 'lucide-react';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

type TabProps = {
  world: World;
  setWorld: (world: World) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  activeRaceId: string;
};

export function CharactersTab({ world, setWorld, isLoading, setIsLoading, activeRaceId }: TabProps) {
  const [newCharacterName, setNewCharacterName] = useState('');
  const { toast } = useToast();

  const handleAddCharacter = () => {
    if (!newCharacterName.trim()) return;

    const newCharacter: NotableCharacter = {
      id: crypto.randomUUID(),
      name: newCharacterName,
      raceId: activeRaceId,
      status: 'alive',
    };

    setWorld({
      ...world,
      notableCharacters: [...world.notableCharacters, newCharacter],
    });
    setNewCharacterName('');
    toast({ title: 'Notable Character Added', description: `${newCharacter.name} has joined the world.` });
  };
  
  const handleSimulateDeaths = async () => {
    const race = world.races.find(r => r.id === activeRaceId);
    const characters = world.notableCharacters.filter(c => c.raceId === activeRaceId && c.status === 'alive');
    if (!race || characters.length === 0) {
      toast({ variant: 'destructive', title: 'No living notable characters for this race.'});
      return;
    }

    setIsLoading(true);
    const result = await runSimulateNotableCharacterDeaths({
      notableCharacterNames: characters.map(c => c.name),
      reasonForDeaths: 'Old age and natural causes',
      currentYear: world.currentYear,
      raceName: race.name,
    });
    setIsLoading(false);

    if (result.success && result.data) {
      const { deathNarratives, commonerDeathToll, impactfulQuote } = result.data;
      
      const updatedCharacters = world.notableCharacters.map(c => {
        if (characters.find(char => char.id === c.id)) {
          const narrative = deathNarratives.find(n => n.includes(c.name)) || "Died of old age.";
          return { ...c, status: 'dead', deathYear: world.currentYear, deathNarrative: narrative };
        }
        return c;
      });

      const newLogEntries = [
        ...deathNarratives.map(n => ({ year: world.currentYear, type: 'death' as const, content: n})),
        { year: world.currentYear, type: 'death' as const, content: `${commonerDeathToll.toLocaleString()} commoners also perished.`},
        { year: world.currentYear, type: 'death' as const, content: `A reflection on the loss: "${impactfulQuote}"`},
      ].filter(entry => entry.content && entry.content.trim() !== '' && !entry.content.toLowerCase().includes('n/a'));

      setWorld({
        ...world,
        notableCharacters: updatedCharacters,
        narrativeLog: [...world.narrativeLog, ...newLogEntries],
      });

      toast({ title: "Characters' Fates Sealed", description: "The annals of history have been updated."});
    } else {
       toast({ variant: 'destructive', title: 'Error Simulating Deaths', description: result.error });
    }
  };

  const livingCharacters = world.notableCharacters.filter(c => c.raceId === activeRaceId && c.status === 'alive');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
          <Users className="mr-2" /> Notable Characters
        </CardTitle>
        <CardDescription>
          Individuals who shape this race's history. Add new characters or simulate the passing of the old guard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            <div className="flex gap-2">
                <Input placeholder="New character name..." value={newCharacterName} onChange={e => setNewCharacterName(e.target.value)} />
                <Button onClick={handleAddCharacter} size="sm" variant="outline"><UserPlus size={16} className='mr-2'/> Add</Button>
            </div>
            <Button onClick={handleSimulateDeaths} disabled={isLoading || livingCharacters.length === 0} size="sm" variant="destructive" className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Skull size={16} className='mr-2'/>} Simulate Deaths
            </Button>
            <ScrollArea className="h-96 pr-4">
                {livingCharacters.length > 0 ? (
                <ul className='space-y-2'>
                    {livingCharacters.map(c => (
                        <li key={c.id} className='flex justify-between items-center text-sm p-2 rounded-md bg-muted/50'>
                            <span>{c.name}</span>
                            <Badge variant='secondary'>{c.status}</Badge>
                        </li>
                    ))}
                </ul>
                ) : <p className='text-sm text-center py-8 text-muted-foreground'>No notable living characters yet.</p>}
            </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
