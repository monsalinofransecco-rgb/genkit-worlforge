'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { World } from '@/types/world';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { runSimulateCataclysm } from '@/app/actions';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Loader2, ShieldAlert, Waves, Mountain, Wind } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type TabProps = {
  world: World;
  setWorld: (world: World) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

type CataclysmType = 'flood' | 'volcano' | 'blight';

export function DangersTab({ world, setWorld, isLoading, setIsLoading }: TabProps) {
  const [cataclysmType, setCataclysmType] = useState<CataclysmType>('flood');
  const [preparationLevel, setPreparationLevel] = useState(5);
  const [selectedRace, setSelectedRace] = useState<string>(
    world.races[0]?.id || ''
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', description: '' });

  const { toast } = useToast();

  const handleSimulateCataclysm = async () => {
    const race = world.races.find((r) => r.id === selectedRace);
    if (!race) {
      toast({
        variant: 'destructive',
        title: 'No race selected',
      });
      return;
    }

    setIsLoading(true);
    const result = await runSimulateCataclysm({
      worldName: world.name,
      raceName: race.name,
      cataclysmType,
      preparationLevel,
    });
    setIsLoading(false);

    if (result.success && result.data) {
      const { eventDescription, outcomeDescription, raceSurvivalRate, infrastructureDamage } = result.data;
      
      const newPopulation = Math.round(race.population * raceSurvivalRate);
      const populationLost = race.population - newPopulation;

      const updatedRaces = world.races.map(r => r.id === race.id ? { ...r, population: newPopulation } : r);
      const newTotalPopulation = world.population - populationLost;

      const fullNarrative = `${eventDescription} ${outcomeDescription} The ${race.name} people suffered greatly, with a survival rate of only ${Math.round(raceSurvivalRate * 100)}%. Infrastructure damage was estimated at ${Math.round(infrastructureDamage * 100)}%.`;

      setWorld({
        ...world,
        races: updatedRaces,
        population: newTotalPopulation,
        narrativeLog: [...world.narrativeLog, { year: world.currentYear, type: 'cataclysm', content: fullNarrative }]
      });
      
      setDialogContent({ title: `Cataclysm: ${cataclysmType.charAt(0).toUpperCase() + cataclysmType.slice(1)}`, description: fullNarrative });
      setDialogOpen(true);
      
    } else {
      toast({
        variant: 'destructive',
        title: 'Error Simulating Cataclysm',
        description: result.error,
      });
    }
  };
  
  const CataclysmIcon = ({type}: {type: CataclysmType}) => {
    if (type === 'flood') return <Waves className="h-5 w-5" />;
    if (type === 'volcano') return <Mountain className="h-5 w-5" />;
    return <Wind className="h-5 w-5" />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <ShieldAlert className="mr-2" /> Trigger Cataclysm
          </CardTitle>
          <CardDescription>
            Unleash a disaster upon a race and see how they fare based on their
            preparations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cataclysm Type</Label>
              <Select
                value={cataclysmType}
                onValueChange={(v: CataclysmType) => setCataclysmType(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a cataclysm..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flood">Flood</SelectItem>
                  <SelectItem value="volcano">Volcanic Eruption</SelectItem>
                  <SelectItem value="blight">Blight</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target Race</Label>
              <Select value={selectedRace} onValueChange={setSelectedRace}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a race..." />
                </SelectTrigger>
                <SelectContent>
                  {world.races.map((race) => (
                    <SelectItem key={race.id} value={race.id}>
                      {race.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Preparation Level ({preparationLevel})</Label>
            <Slider
              value={[preparationLevel]}
              onValueChange={(v) => setPreparationLevel(v[0])}
              min={0}
              max={10}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>None</span>
                <span>Legendary</span>
            </div>
          </div>
          
          <Button
            onClick={handleSimulateCataclysm}
            disabled={isLoading || !selectedRace}
            variant="destructive"
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CataclysmIcon type={cataclysmType} />
            )}
            Unleash {cataclysmType.charAt(0).toUpperCase() + cataclysmType.slice(1)}
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='font-headline text-primary'>{dialogContent.title}</AlertDialogTitle>
            <AlertDialogDescription className='max-h-60 overflow-y-auto pr-4'>
              {dialogContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Acknowledge</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
