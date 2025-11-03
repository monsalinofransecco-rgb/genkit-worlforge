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
import { InfluenceTab } from './InfluenceTab';
import { RacesTab } from './RacesTab';
import { DangersTab } from './DangersTab';
import { History, Shield, Sparkles, Users, Skull, Bot, FileText, Swords } from 'lucide-react';
import { GraveyardTab } from './GraveyardTab';
import { CharactersTab } from './CharactersTab';


export default function Dashboard({ worldId }: { worldId: string }) {
  const [world, setWorld] = useState<World | null>(null);
  const [activeRaceId, setActiveRaceId] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
  
  const activeRace = world?.races.find(r => r.id === activeRaceId);

  if (!isMounted) {
    return <DashboardSkeleton />;
  }

  if (!world) {
    notFound();
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
                <Tabs defaultValue="simulation-cycle" className="w-full mt-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="simulation-cycle"><Bot className="mr-2 h-4 w-4" />Simulation Cycle</TabsTrigger>
                        <TabsTrigger value="data-logs"><FileText className="mr-2 h-4 w-4" />Data Logs</TabsTrigger>
                    </TabsList>
                    <TabsContent value="simulation-cycle">
                        <div className="grid md:grid-cols-2 gap-6 mt-4">
                           <OverviewTab world={world} setWorld={updateWorld} isLoading={isLoading} setIsLoading={setIsLoading} />
                           <InfluenceTab world={world} setWorld={updateWorld} isLoading={isLoading} activeRaceId={race.id} />
                        </div>
                    </TabsContent>
                    <TabsContent value="data-logs">
                        <div className="mt-4">
                        <Tabs defaultValue="characters" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
                                <TabsTrigger value="characters"><Users className="mr-2 h-4 w-4" />Characters</TabsTrigger>
                                <TabsTrigger value="history"><History className="mr-2 h-4 w-4" />History</TabsTrigger>
                                <TabsTrigger value="dangers"><Shield className="mr-2 h-4 w-4" />Dangers</TabsTrigger>
                                <TabsTrigger value="races"><Sparkles className="mr-2 h-4 w-4" />Culture</TabsTrigger>
                                <TabsTrigger value="graveyard"><Skull className="mr-2 h-4 w-4" />Graveyard</TabsTrigger>
                            </TabsList>
                            <TabsContent value="characters">
                                <CharactersTab world={world} setWorld={updateWorld} isLoading={isLoading} setIsLoading={setIsLoading} activeRaceId={race.id} />
                            </TabsContent>
                             <TabsContent value="history">
                                {/* The overview tab contains the narrative log which is the history */}
                                <OverviewTab world={world} setWorld={updateWorld} isLoading={isLoading} setIsLoading={setIsLoading} showStats={false} />
                            </TabsContent>
                             <TabsContent value="dangers">
                                <DangersTab world={world} setWorld={updateWorld} isLoading={isLoading} setIsLoading={setIsLoading} />
                            </TabsContent>
                            <TabsContent value="races">
                                <RacesTab world={world} setWorld={updateWorld} isLoading={isLoading} setIsLoading={setIsLoading} />
                            </TabsContent>
                            <TabsContent value="graveyard">
                                <GraveyardTab world={world} activeRaceId={race.id} />
                            </TabsContent>
                        </Tabs>
                        </div>
                    </TabsContent>
                </Tabs>
             </TabsContent>
        ))}
      </Tabs>
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
