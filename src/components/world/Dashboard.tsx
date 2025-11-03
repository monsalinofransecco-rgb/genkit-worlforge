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
import { History, Shield, Sparkles, Users } from 'lucide-react';

export default function Dashboard({ worldId }: { worldId: string }) {
  const [world, setWorld] = useState<World | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const loadedWorld = getWorldById(worldId);
    if (loadedWorld) {
      setWorld(loadedWorld);
    }
  }, [worldId]);

  const updateWorld = (updatedWorld: World) => {
    setWorld(updatedWorld);
    saveWorld(updatedWorld);
  };

  if (!isMounted) {
    return <DashboardSkeleton />;
  }

  if (!world) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl md:text-4xl text-primary">
            {world.name}
          </CardTitle>
          <CardDescription>{world.era}</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="overview"><History className="mr-2 h-4 w-4" />Overview</TabsTrigger>
          <TabsTrigger value="influence"><Sparkles className="mr-2 h-4 w-4" />Influence</TabsTrigger>
          <TabsTrigger value="races"><Users className="mr-2 h-4 w-4" />Races</TabsTrigger>
          <TabsTrigger value="dangers"><Shield className="mr-2 h-4 w-4" />Dangers</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <OverviewTab world={world} setWorld={updateWorld} isLoading={isLoading} setIsLoading={setIsLoading} />
        </TabsContent>
        <TabsContent value="influence">
          <InfluenceTab world={world} setWorld={updateWorld} />
        </TabsContent>
        <TabsContent value="races">
          <RacesTab world={world} setWorld={updateWorld} isLoading={isLoading} setIsLoading={setIsLoading} />
        </TabsContent>
        <TabsContent value="dangers">
          <DangersTab world={world} setWorld={updateWorld} isLoading={isLoading} setIsLoading={setIsLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
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
