'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { World, Race, NotableCharacter } from '@/types/world';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  runGenerateRaceNamingProfile,
  runSimulateNotableCharacterDeaths,
} from '@/app/actions';
import { Loader2, Users, Wand2, UserPlus, Skull, Quote } from 'lucide-react';
import { Badge } from '../ui/badge';

type TabProps = {
  world: World;
  setWorld: (world: World) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

export function RacesTab({ world, setWorld, isLoading, setIsLoading }: TabProps) {
  const [newCharacterName, setNewCharacterName] = useState('');
  const [selectedRaceForChar, setSelectedRaceForChar] = useState<string | null>(
    world.races[0]?.id || null
  );
  const { toast } = useToast();

  const handleGenerateNamingProfile = async (raceId: string) => {
    const race = world.races.find((r) => r.id === raceId);
    if (!race) return;

    setIsLoading(true);
    const result = await runGenerateRaceNamingProfile({ raceName: race.name });
    setIsLoading(false);

    if (result.success && result.data) {
      const updatedRaces = world.races.map((r) =>
        r.id === raceId ? { ...r, namingProfile: result.data } : r
      );
      setWorld({ ...world, races: updatedRaces });
      toast({ title: 'Naming Profile Generated!' });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error Generating Profile',
        description: result.error,
      });
    }
  };

  const handleAddCharacter = (raceId: string) => {
    if (!newCharacterName.trim()) return;

    const newCharacter: NotableCharacter = {
      id: crypto.randomUUID(),
      name: newCharacterName,
      raceId: raceId,
      status: 'alive',
    };

    setWorld({
      ...world,
      notableCharacters: [...world.notableCharacters, newCharacter],
    });
    setNewCharacterName('');
    toast({ title: 'Notable Character Added', description: `${newCharacter.name} has joined the world.` });
  };
  
  const handleSimulateDeaths = async (raceId: string) => {
    const race = world.races.find(r => r.id === raceId);
    const characters = world.notableCharacters.filter(c => c.raceId === raceId && c.status === 'alive');
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
      ];

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


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
          <Users className="mr-2" /> Races & Characters
        </CardTitle>
        <CardDescription>
          Manage the races of your world and their notable figures.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {world.races.map((race) => (
            <AccordionItem key={race.id} value={race.id}>
              <AccordionTrigger className='font-headline'>{race.name}</AccordionTrigger>
              <AccordionContent className="space-y-6 p-2">
                
                <Card>
                    <CardHeader>
                        <CardTitle className='text-lg flex items-center gap-2'><Wand2 size={20}/> Naming Profile</CardTitle>
                        {!race.namingProfile && <CardDescription>Generate a linguistic profile for this race.</CardDescription>}
                    </CardHeader>
                    <CardContent>
                        {race.namingProfile ? (
                        <div className="space-y-2 text-sm">
                            <p><strong className="text-muted-foreground">Inspiration:</strong> {race.namingProfile.inspiration}</p>
                            <p><strong className="text-muted-foreground">Structure:</strong> {race.namingProfile.languageStructure}</p>
                            <p><strong className="text-muted-foreground">Phonemes:</strong> {race.namingProfile.phonemes}</p>
                        </div>
                        ) : (
                        <Button onClick={() => handleGenerateNamingProfile(race.id)} disabled={isLoading} size="sm">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Generate Profile
                        </Button>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className='text-lg flex items-center gap-2'><Users size={20} /> Notable Characters</CardTitle>
                        <CardDescription>Individuals who shape this race's history.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                        {world.notableCharacters.filter(c => c.raceId === race.id).length > 0 ? (
                           <ul className='space-y-2'>
                            {world.notableCharacters.filter(c => c.raceId === race.id).map(c => (
                                <li key={c.id} className='flex justify-between items-center text-sm'>
                                    <span>{c.name}</span>
                                    <Badge variant={c.status === 'alive' ? 'secondary' : 'destructive'}>{c.status}{c.status === 'dead' && ` (Y. ${c.deathYear})`}</Badge>
                                </li>
                            ))}
                           </ul>
                        ) : <p className='text-sm text-muted-foreground'>No notable characters yet.</p>}
                        
                        <div className="flex gap-2">
                            <Input placeholder="New character name..." value={newCharacterName} onChange={e => setNewCharacterName(e.target.value)} />
                            <Button onClick={() => handleAddCharacter(race.id)} size="sm" variant="outline"><UserPlus size={16} className='mr-2'/> Add</Button>
                        </div>
                        <Button onClick={() => handleSimulateDeaths(race.id)} disabled={isLoading} size="sm" variant="destructive" className="w-full">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Skull size={16} className='mr-2'/>} Simulate Deaths
                        </Button>
                        </div>
                    </CardContent>
                </Card>

              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
