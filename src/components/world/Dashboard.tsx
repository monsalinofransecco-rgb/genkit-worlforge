'use client';

import { useState, useEffect } from 'react';
import { getWorldById, saveWorld } from '@/lib/world-store';
import type { World, HistoryEntry, NotableCharacter, Race, DeathDetails } from '@/types/world';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { History, Users, Skull, FileText, Swords, Sparkles, Landmark, Store } from 'lucide-react';
import { GraveyardTab } from './GraveyardTab';
import { CharactersTab } from './CharactersTab';
import { RacesTab } from './RacesTab';
import { PoliticsTab } from './PoliticsTab';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { runAdvanceTime } from '@/app/actions';
import { Loader2, CalendarPlus, CalendarClock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { InfluenceTab } from './InfluenceTab';
import { OverviewTab } from './OverviewTab';
import { HistoryTab } from './HistoryTab';


export default function Dashboard({ worldId }: { worldId: string }) {
  const [world, setWorld] = useState<World | null>(null);
  const [activeRaceId, setActiveRaceId] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    const loadedWorld = getWorldById(worldId);
    if (loadedWorld) {
      setWorld(loadedWorld);
      if (loadedWorld.races.length > 0 && !activeRaceId) {
        setActiveRaceId(loadedWorld.races[0].id);
      }
    }
  }, [worldId, activeRaceId]);

  const updateWorld = (updatedWorld: World) => {
    setWorld(updatedWorld);
    saveWorld(updatedWorld);
  };
  
  const handleTimeAdvance = async (years: 1 | 10) => {
    if (!world) return;
    setIsLoading(true);

    const raceInputs = world.races.map(race => ({
        id: race.id,
        name: race.name,
        population: race.population,
        traits: race.traits || "",
        location: race.location || "",
        livingCharacters: race.notableCharacters.filter(c => c.status === 'alive'),
        problems: race.problems || [],
        activeBoons: race.activeBoons || [],
    }));

    const result = await runAdvanceTime({
      years,
      worldName: world.name,
      era: world.era,
      currentYear: world.currentYear,
      races: raceInputs,
      chronicleEntry: world.significantEvents[world.significantEvents.length-1]
    });
    setIsLoading(false);

    if (result.success && result.data) {
      const { data } = result;
      const { newYear, raceResults } = data;

      const updatedRaces = world.races.map(originalRace => {
          const raceResult = raceResults.find(res => res.raceId === originalRace.id);
          if (!raceResult) return originalRace;

          const { summary, populationChange, events, emergenceReason, updatedProblems, newCharacter, characterLogEntries, fallenNotableCharacters, namedCommonerDeaths } = raceResult;

          const newHistoryEntry: HistoryEntry = {
              year: newYear,
              summary,
              populationChange,
              events,
              emergenceReason,
          };

          let updatedCharacters = [...originalRace.notableCharacters];

          // Process notable deaths
          (fallenNotableCharacters || []).forEach(fallen => {
              const charIndex = updatedCharacters.findIndex(c => c.id === fallen.characterId);
              if (charIndex !== -1) {
                  updatedCharacters[charIndex].status = 'dead';
                  updatedCharacters[charIndex].deathDetails = fallen.deathDetails;
                  updatedCharacters[charIndex].deathYear = newYear;
              }
          });

          // Process commoner deaths
          (namedCommonerDeaths || []).forEach(commoner => {
              const newDeadCharacter: NotableCharacter = {
                  id: crypto.randomUUID(),
                  name: commoner.name,
                  raceId: originalRace.id,
                  status: 'dead',
                  deathYear: newYear,
                  deathDetails: commoner.deathDetails,
                  title: commoner.title,
                  age: commoner.ageAtDeath,
                  class: 'Commoner',
                  ambition: 'Survival',
                  traits: [],
                  skills: [],
                  specialTraits: [],
                  personalLog: [],
              };
              updatedCharacters.push(newDeadCharacter);
          });
          
          // Add new character if one emerged
          if (newCharacter) {
              const fullNewCharacter: NotableCharacter = {
                  ...newCharacter,
                  raceId: originalRace.id,
                  status: 'alive',
                  personalLog: [{ year: newYear, entry: newCharacter.firstLogEntry }]
              };
              updatedCharacters.push(fullNewCharacter);
          }

          // Add new personal log entries to existing characters
          characterLogEntries.forEach(log => {
              const charIndex = updatedCharacters.findIndex(c => c.id === log.characterId && c.status === 'alive');
              if (charIndex > -1) {
                  updatedCharacters[charIndex].personalLog.push({ year: newYear, entry: log.logEntry });
              }
          });

          // Update age of all living characters
          updatedCharacters.forEach(char => {
              if (char.status === 'alive') {
                  char.age += years;
              }
          });

          return {
              ...originalRace,
              population: populationChange.newPopulation,
              problems: updatedProblems || originalRace.problems,
              notableCharacters: updatedCharacters,
              history: [...originalRace.history, newHistoryEntry]
          };
      });

      const totalPopulation = updatedRaces.reduce((sum, r) => sum + r.population, 0);

      updateWorld({
        ...world,
        currentYear: newYear,
        races: updatedRaces,
        population: totalPopulation,
        narrativeLog: [...world.narrativeLog], // Can be updated with a world-level summary if needed
      });

      toast({
        title: `Time advanced by ${years} year(s).`,
        description: `The year is now ${newYear}.`,
      });

    } else {
      toast({
        variant: 'destructive',
        title: 'Error Advancing Time',
        description: result.error,
      });
    }
  };

  const activeRace = world?.races.find(r => r.id === activeRaceId);

  if (!isMounted) {
    return <DashboardSkeleton />;
  }

  if (!world || !activeRace) {
    if (isMounted) notFound();
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <div className="flex justify-between items-start">
                <div className='text-center flex-grow'>
                    <CardTitle className="font-headline text-4xl md:text-5xl text-primary">
                        {world.name}
                    </CardTitle>
                    <CardDescription>Current Year: {world.currentYear} - {world.era}</CardDescription>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Open Creator's Store">
                            <Store className="h-6 w-6 text-primary" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                       <DialogHeader>
                            <DialogTitle className="font-headline flex items-center gap-2">
                                <Sparkles className="text-primary" />
                                Creator's Store
                            </DialogTitle>
                            <DialogDescription>
                                Spend Race Points (RP) to bestow blessings upon the {activeRace.name}.
                            </DialogDescription>
                        </DialogHeader>
                       <InfluenceTab world={world} setWorld={updateWorld} isLoading={isLoading} activeRaceId={activeRaceId} />
                    </DialogContent>
                </Dialog>
            </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue={activeRaceId} onValueChange={setActiveRaceId} className="w-full">
        <TabsList className={`grid w-full grid-cols-${world.races.length}`}>
            {world.races.map(race => (
                <TabsTrigger key={race.id} value={race.id}><Swords className="mr-2 h-4 w-4" />{race.name}</TabsTrigger>
            ))}
        </TabsList>
        {world.races.map(race => (
             <TabsContent key={race.id} value={race.id}>
                <Tabs defaultValue="overview" className="w-full mt-4">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
                        <TabsTrigger value="overview"><FileText className="mr-2 h-4 w-4" />Overview</TabsTrigger>
                        <TabsTrigger value="characters"><Users className="mr-2 h-4 w-4" />Characters</TabsTrigger>
                        <TabsTrigger value="history"><History className="mr-2 h-4 w-4" />History</TabsTrigger>
                        <TabsTrigger value="culture"><Sparkles className="mr-2 h-4 w-4" />Culture</TabsTrigger>
                        <TabsTrigger value="politics"><Landmark className="mr-2 h-4 w-4" />Politics</TabsTrigger>
                        <TabsTrigger value="graveyard"><Skull className="mr-2 h-4 w-4" />Graveyard</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="pt-6">
                        <OverviewTab race={race} />
                    </TabsContent>
                    <TabsContent value="characters" className="pt-6">
                        <CharactersTab race={race} setWorld={updateWorld} isLoading={isLoading} setIsLoading={setIsLoading} />
                    </TabsContent>
                     <TabsContent value="history" className="pt-6">
                        <HistoryTab race={race} />
                    </TabsContent>
                     <TabsContent value="culture" className="pt-6">
                        <RacesTab world={world} setWorld={updateWorld} isLoading={isLoading} setIsLoading={setIsLoading} />
                    </TabsContent>
                     <TabsContent value="politics" className="pt-6">
                        <PoliticsTab />
                    </TabsContent>
                    <TabsContent value="graveyard" className="pt-6">
                        <GraveyardTab race={race} />
                    </TabsContent>
                </Tabs>
             </TabsContent>
        ))}
      </Tabs>
      <Card>
        <CardContent className="flex flex-col sm:flex-row gap-2 p-4 justify-center">
            <Button onClick={() => handleTimeAdvance(1)} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarPlus className="mr-2 h-4 w-4" />} Advance 1 Year
            </Button>
            <Button onClick={() => handleTimeAdvance(10)} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarClock className="mr-2 h-4 w-4" />} Advance 10 Years
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className='items-center'>
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </CardHeader>
      </Card>
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
