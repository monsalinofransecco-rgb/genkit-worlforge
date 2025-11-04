'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { World, NarrativeEntry, BoonId, Boon } from '@/types/world';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BookUp, Sparkles, Gem } from 'lucide-react';
import { creatorStoreBoons } from '@/data/boons';
import { CreatorToolkit } from '../CreatorToolkit';

type TabProps = {
  world: World;
  setWorld: (world: World) => void;
  isLoading: boolean;
  activeRaceId: string;
  onBoonPurchase: (boon: Boon) => void;
};

export function InfluenceTab({ world, setWorld, isLoading, activeRaceId, onBoonPurchase }: TabProps) {
  const [chronicleEntry, setChronicleEntry] = useState('');
  const { toast } = useToast();

  const activeRace = world.races.find((r) => r.id === activeRaceId);

  const handleAddChronicle = () => {
    if (!chronicleEntry.trim()) return;
    const newEntry: NarrativeEntry = {
      year: world.currentYear,
      type: 'user',
      content: `A chronicler recorded: "${chronicleEntry}"`,
    };
    setWorld({
      ...world,
      significantEvents: [...world.significantEvents, chronicleEntry],
      narrativeLog: [...world.narrativeLog, newEntry],
    });
    setChronicleEntry('');
    toast({
      title: 'Chronicle Entry Added',
      description: "Your entry has been added to the world's history.",
    });
  };

  const onBoonToggle = (boonId: string, isActive: boolean) => {
    const boon = creatorStoreBoons.find(b => b.id === boonId);
    if (!boon || !activeRace) return;
    
    let newRaces = world.races.map(r => ({...r, activeBoons: r.activeBoons || []}));
    const raceIndex = newRaces.findIndex(r => r.id === activeRaceId);

    if (isActive) { // Activating
      if (activeRace.racePoints >= boon.cost) {
        const updatedRace = {
            ...activeRace,
            racePoints: activeRace.racePoints - boon.cost,
            activeBoons: [...(activeRace.activeBoons || []), boon.id],
        };
        newRaces[raceIndex] = updatedRace;
        
        toast({
          title: 'Boon Activated!',
          description: `${boon.name} is now active for the ${activeRace.name}.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Not enough Race Points',
          description: `You need ${boon.cost} RP to activate ${boon.name}.`,
        });
        return; // Abort state change
      }
    } else { // Deactivating
        const updatedRace = {
            ...activeRace,
            racePoints: activeRace.racePoints + boon.cost,
            activeBoons: (activeRace.activeBoons || []).filter(id => id !== boonId),
        };
        newRaces[raceIndex] = updatedRace;

        toast({
            title: 'Boon Deactivated',
            description: `${boon.name} is no longer active. ${boon.cost} RP refunded.`,
        });
    }

    setWorld({ ...world, races: newRaces });
  };


  if (!activeRace) {
    return <Card><CardContent className="p-6">Select a race to influence it.</CardContent></Card>
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 pt-4">
      <CreatorToolkit 
        race={activeRace}
        isLoading={isLoading}
        onBoonToggle={onBoonToggle}
        onBoonPurchase={onBoonPurchase}
      />
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <BookUp className="mr-2" /> Chronicle Entry
          </CardTitle>
          <CardDescription>
            Directly influence the world's history with your own entries. These
            will be considered by the AI in future simulations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={chronicleEntry}
            onChange={(e) => setChronicleEntry(e.target.value)}
            placeholder="e.g., A mysterious comet was seen in the sky..."
            rows={4}
          />
          <Button onClick={handleAddChronicle} className="w-full">
            Add to Chronicle
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
