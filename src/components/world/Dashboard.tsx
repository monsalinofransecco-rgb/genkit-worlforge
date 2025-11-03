'use client';

import { useState, useEffect } from 'react';
import { getWorldById, saveWorld } from '@/lib/world-store';
import type { World } from '@/types/world';
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
import { OverviewTab } from './OverviewTab';
import { DangersTab } from './DangersTab';
import { History, Shield, Users, Skull, FileText, Swords, Sparkles, BookOpen, Hand, Landmark } from 'lucide-react';
import { GraveyardTab } from './GraveyardTab';
import { CharactersTab } from './CharactersTab';
import { RacesTab } from './RacesTab';
import { PoliticsTab } from './PoliticsTab';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { runAdvanceTime } from '@/app/actions';
import { Loader2, CalendarPlus, CalendarClock, Gem } from 'lucide-react';

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    )
}


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
    const result = await runAdvanceTime({
      years,
      worldName: world.name,
      currentYear: world.currentYear,
      raceCount: world.races.length,
      population: world.population,
      significantEvents: world.significantEvents.join('\n'),
      boons: world.races.flatMap(r => r.activeBoons || []).join(', ') || 'None',
      cataclysmPreparations: world.cataclysmPreparations,
    });
    setIsLoading(false);

    if (result.success && result.data) {
      const { data } = result;
      const newEntries = [
        { year: data.newYear, type: 'narrative' as const, content: data.narrativeEvents },
        { year: data.newYear, type: 'population' as const, content: data.populationChanges },
        { year: data.newYear, type: 'character' as const, content: data.characterLifecycleUpdates },
        { year: data.newYear, type: 'problem' as const, content: data.problemSimulations },
        { year: data.newYear, type: 'society' as const, content: data.societalEvolutions },
        { year: data.newYear, type: 'discovery' as const, content: data.geographicalDiscoveries },
      ].filter(entry => entry.content && entry.content.trim() !== '' && !entry.content.toLowerCase().includes('n/a'));

      const popChangeMatch = data.populationChanges.match(/by approximately ([\d,]+)/);
      const popChange = popChangeMatch ? parseInt(popChangeMatch[1].replace(/,/g, ''), 10) : years * 100;
      
      let newPopulation = world.population;
      if (data.populationChanges.includes('increased') || data.populationChanges.includes('grew')) {
        newPopulation += popChange;
      } else if (data.populationChanges.includes('decreased') || data.populationChanges.includes('declined')) {
        newPopulation -= popChange;
      }

      updateWorld({
        ...world,
        currentYear: data.newYear,
        population: Math.max(0, newPopulation),
        narrativeLog: [...world.narrativeLog, ...newEntries],
      });
      toast({
        title: `Time advanced by ${years} year(s).`,
        description: `The year is now ${data.newYear}.`,
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
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="font-headline text-4xl md:text-5xl text-primary">
            {world.name}
          </CardTitle>
          <CardDescription>Current Year: {world.currentYear} - {world.era}</CardDescription>
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
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <StatCard title="Population" value={race.population.toLocaleString()} icon={<Users className="text-muted-foreground" />} />
                    <StatCard title="General Status" value={race.traits ? 'Defined' : 'Nascent'} icon={<BookOpen className="text-muted-foreground" />} />
                    <StatCard title="Race Points" value={race.racePoints} icon={<Gem className="text-muted-foreground" />} />
                    <StatCard title="Politics" value="Tribal" icon={<Landmark className="text-muted-foreground" />} />
                    <StatCard title="Culture" value="Nascent" icon={<Sparkles className="text-muted-foreground" />} />
                    <StatCard title="Location" value={race.location || "Not Set"} icon={<Hand className="text-muted-foreground" />} />
                </div>
                <Tabs defaultValue="overview" className="w-full mt-4">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
                        <TabsTrigger value="overview"><FileText className="mr-2 h-4 w-4" />Overview</TabsTrigger>
                        <TabsTrigger value="characters"><Users className="mr-2 h-4 w-4" />Characters</TabsTrigger>
                        <TabsTrigger value="history"><History className="mr-2 h-4 w-4" />History</TabsTrigger>
                        <TabsTrigger value="culture"><Sparkles className="mr-2 h-4 w-4" />Culture</TabsTrigger>
                        <TabsTrigger value="politics"><Landmark className="mr-2 h-4 w-4" />Politics</TabsTrigger>
                        <TabsTrigger value="graveyard"><Skull className="mr-2 h-4 w-4" />Graveyard</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview">
                        <OverviewTab world={world} setWorld={updateWorld} isLoading={isLoading} setIsLoading={setIsLoading} />
                    </TabsContent>
                    <TabsContent value="characters">
                        <CharactersTab world={world} setWorld={updateWorld} isLoading={isLoading} setIsLoading={setIsLoading} activeRaceId={race.id} />
                    </TabsContent>
                     <TabsContent value="history">
                        <OverviewTab world={world} setWorld={updateWorld} isLoading={isLoading} setIsLoading={setIsLoading} showStats={false} />
                    </TabsContent>
                     <TabsContent value="culture">
                        <RacesTab world={world} setWorld={updateWorld} isLoading={isLoading} setIsLoading={setIsLoading} />
                    </TabsContent>
                     <TabsContent value="politics">
                        <PoliticsTab />
                    </TabsContent>
                    <TabsContent value="graveyard">
                        <GraveyardTab world={world} activeRaceId={race.id} />
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
