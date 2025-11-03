'use client';

import { useState, useEffect } from 'react';
import { getWorldById, saveWorld } from '@/lib/world-store';
import type { World, Race, Problem } from '@/types/world';
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
import { History, Shield, Users, Skull, FileText, Swords, Sparkles, BookOpen, Hand, Landmark, Store, Gem, AlertTriangle } from 'lucide-react';
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
import { ProblemsTab } from './ProblemsTab';


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
    if (!world || !activeRace) return;
    setIsLoading(true);
    const result = await runAdvanceTime({
      years,
      worldName: world.name,
      currentYear: world.currentYear,
      raceCount: world.races.length,
      population: world.population,
      significantEvents: world.significantEvents.join('\n'),
      boons: activeRace.activeBoons.join(', ') || 'None',
      cataclysmPreparations: world.cataclysmPreparations,
      problems: activeRace.problems || [],
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
      
      let newPopulation = activeRace.population;
      if (data.populationChanges.includes('increased') || data.populationChanges.includes('grew')) {
        newPopulation += popChange;
      } else if (data.populationChanges.includes('decreased') || data.populationChanges.includes('declined')) {
        newPopulation -= popChange;
      }
      
      const updatedRaces = world.races.map(r => 
        r.id === activeRaceId 
        ? { ...r, population: Math.max(0, newPopulation), problems: data.updatedProblems || r.problems }
        : r
      );
      
      const totalPopulation = updatedRaces.reduce((sum, r) => sum + r.population, 0);

      updateWorld({
        ...world,
        currentYear: data.newYear,
        races: updatedRaces,
        population: totalPopulation,
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
                    <TabsContent value="overview" className="pt-6 space-y-6">
                        <OverviewTab race={race} />
                        <ProblemsTab problems={race.problems || []} />
                    </TabsContent>
                    <TabsContent value="characters">
                        <CharactersTab world={world} setWorld={updateWorld} isLoading={isLoading} setIsLoading={setIsLoading} activeRaceId={race.id} />
                    </TabsContent>
                     <TabsContent value="history">
                        <HistoryTab world={world} />
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
