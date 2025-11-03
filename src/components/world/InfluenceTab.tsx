'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { World, Boon, NarrativeEntry } from '@/types/world';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  HeartPulse,
  BookUp,
  Shield,
  BrainCircuit,
  Sprout,
  Sparkles,
} from 'lucide-react';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

type TabProps = {
  world: World;
  setWorld: (world: World) => void;
};

const boonDetails: Record<Boon, { name: string, description: string, icon: React.ReactNode }> = {
  fertility: { name: 'Boon of Fertility', description: 'Greatly increases population growth.', icon: <Sprout className="h-6 w-6 text-green-400" /> },
  strength: { name: 'Boon of Strength', description: 'Improves outcomes in conflicts and physical challenges.', icon: <Shield className="h-6 w-6 text-red-400" /> },
  wisdom: { name: 'Boon of Wisdom', description: 'Accelerates technological and societal advancements.', icon: <BrainCircuit className="h-6 w-6 text-blue-400" /> },
  resilience: { name: 'Boon of Resilience', description: 'Helps mitigate the negative effects of cataclysms.', icon: <HeartPulse className="h-6 w-6 text-yellow-400" /> },
};

export function InfluenceTab({ world, setWorld }: TabProps) {
  const [chronicleEntry, setChronicleEntry] = useState('');
  const { toast } = useToast();

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
      description: 'Your entry has been added to the world\'s history.',
    });
  };

  const handleBoonToggle = (boon: Boon) => {
    const newBoons = world.boons.includes(boon)
      ? world.boons.filter((b) => b !== boon)
      : [...world.boons, boon];
    setWorld({ ...world, boons: newBoons });
    toast({
      title: world.boons.includes(boon) ? 'Boon Deactivated' : 'Boon Activated',
      description: `${boonDetails[boon].name} is now ${world.boons.includes(boon) ? 'inactive' : 'active'}.`,
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <BookUp className="mr-2" /> Chronicle Entry
          </CardTitle>
          <CardDescription>
            Directly influence the world's history with your own entries.
            These will be considered by the AI in future simulations.
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

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <Sparkles className="mr-2 text-primary" /> Activate Boons
          </CardTitle>
          <CardDescription>
            Bestow blessings upon your world to guide its development.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.keys(boonDetails).map((boonKey) => {
            const boon = boonKey as Boon;
            return (
              <div key={boon} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-4">
                  {boonDetails[boon].icon}
                  <div>
                    <Label htmlFor={`boon-${boon}`} className="font-semibold">{boonDetails[boon].name}</Label>
                    <p className="text-xs text-muted-foreground">{boonDetails[boon].description}</p>
                  </div>
                </div>
                <Switch
                  id={`boon-${boon}`}
                  checked={world.boons.includes(boon)}
                  onCheckedChange={() => handleBoonToggle(boon)}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
