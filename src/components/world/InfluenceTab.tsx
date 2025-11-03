'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { World, NarrativeEntry, BoonId } from '@/types/world';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BookUp, Sparkles, Gem } from 'lucide-react';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { creatorStoreBoons } from '@/lib/boons';

type TabProps = {
  world: World;
  setWorld: (world: World) => void;
  isLoading: boolean;
  activeRaceId: string;
};

export function InfluenceTab({ world, setWorld, isLoading, activeRaceId }: TabProps) {
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

  const onBoonToggle = (boonId: BoonId, isActive: boolean) => {
    const boon = creatorStoreBoons.find(b => b.id === boonId);
    if (!boon) return;
    
    const raceToUpdate = world.races.find(r => r.id === activeRaceId);
    if (!raceToUpdate) return;

    let newRaces = world.races.map(r => ({...r, activeBoons: r.activeBoons || []}));
    const raceIndex = newRaces.findIndex(r => r.id === activeRaceId);

    if (isActive) { // Activating
      if (raceToUpdate.racePoints >= boon.cost) {
        const updatedRace = {
            ...raceToUpdate,
            racePoints: raceToUpdate.racePoints - boon.cost,
            activeBoons: [...(raceToUpdate.activeBoons || []), boon.id],
        };
        newRaces[raceIndex] = updatedRace;
        
        toast({
          title: 'Boon Activated!',
          description: `${boon.name} is now active for the ${raceToUpdate.name}.`,
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
            ...raceToUpdate,
            racePoints: raceToUpdate.racePoints + boon.cost,
            activeBoons: (raceToUpdate.activeBoons || []).filter(id => id !== boonId),
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
    <div className="grid gap-6 pt-4">
       <div className='flex items-center justify-end gap-2 font-bold text-lg text-primary bg-primary/10 px-3 py-1.5 rounded-md'>
            <Gem className="h-5 w-5" />
            <span>{activeRace.racePoints} RP</span>
        </div>
      <div className="space-y-4">
        {creatorStoreBoons.map((boon) => {
          const isAcquired = (activeRace.activeBoons || []).includes(boon.id);
          const canAfford = activeRace.racePoints >= boon.cost;

          return (
            <div
              key={boon.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-4">
                {boon.icon}
                <div>
                  <Label
                    htmlFor={`boon-${boon.id}-${activeRace.id}`}
                    className="font-semibold"
                  >
                    {boon.name}
                  </Label>
                    <p className="text-xs text-muted-foreground">{boon.description} (Cost: {boon.cost} RP)</p>
                </div>
              </div>
              <Switch
                id={`boon-${boon.id}-${activeRace.id}`}
                checked={isAcquired}
                onCheckedChange={(isActive) => onBoonToggle(boon.id, isActive)}
                disabled={isLoading || (!isAcquired && !canAfford)}
              />
            </div>
          );
        })}
      </div>
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
