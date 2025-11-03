'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { World, NarrativeEntry } from '@/types/world';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { runAdvanceTime } from '@/app/actions';
import {
  Calendar,
  Users,
  BookText,
  Loader2,
  CalendarPlus,
  CalendarClock,
} from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

type TabProps = {
  world: World;
  setWorld: (world: World) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  showStats?: boolean;
};

export function OverviewTab({ world, setWorld, isLoading, setIsLoading, showStats = true }: TabProps) {
  const { toast } = useToast();

  const handleTimeAdvance = async (years: 1 | 10) => {
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
      const newEntries: NarrativeEntry[] = [
        { year: data.newYear, type: 'narrative', content: data.narrativeEvents },
        { year: data.newYear, type: 'population', content: data.populationChanges },
        { year: data.newYear, type: 'character', content: data.characterLifecycleUpdates },
        { year: data.newYear, type: 'problem', content: data.problemSimulations },
        { year: data.newYear, type: 'society', content: data.societalEvolutions },
        { year: data.newYear, type: 'discovery', content: data.geographicalDiscoveries },
      ].filter(entry => entry.content && entry.content.trim() !== '' && !entry.content.toLowerCase().includes('n/a'));

      // A simple heuristic to update population
      const popChangeMatch = data.populationChanges.match(/by approximately ([\d,]+)/);
      const popChange = popChangeMatch ? parseInt(popChangeMatch[1].replace(/,/g, ''), 10) : years * 100;
      
      let newPopulation = world.population;
      if (data.populationChanges.includes('increased') || data.populationChanges.includes('grew')) {
        newPopulation += popChange;
      } else if (data.populationChanges.includes('decreased') || data.populationChanges.includes('declined')) {
        newPopulation -= popChange;
      }

      setWorld({
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

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-1 space-y-6">
        {showStats && (
        <>
            <Card>
            <CardHeader>
                <CardTitle className="font-headline">World Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                <span className="flex items-center text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" /> Current Year
                </span>
                <span className="font-semibold">{world.currentYear}</span>
                </div>
                <div className="flex items-center justify-between">
                <span className="flex items-center text-muted-foreground">
                    <Users className="mr-2 h-4 w-4" /> Total Population
                </span>
                <span className="font-semibold">{world.population.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                <span className="flex items-center text-muted-foreground">
                    <Users className="mr-2 h-4 w-4" /> Races
                </span>
                <span className="font-semibold">{world.races.length}</span>
                </div>
            </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <CardTitle className="font-headline">Advance Time</CardTitle>
                <CardDescription>Simulate the passage of time.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-2">
                <Button onClick={() => handleTimeAdvance(1)} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarPlus className="mr-2 h-4 w-4" />} 1 Year
                </Button>
                <Button onClick={() => handleTimeAdvance(10)} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarClock className="mr-2 h-4 w-4" />} 10 Years
                </Button>
            </CardContent>
            </Card>
        </>
        )}
      </div>
      <div className={showStats ? "md:col-span-2" : "md:col-span-3"}>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <BookText className="mr-2" /> Narrative Log
            </CardTitle>
            <CardDescription>The unfolding history of your world.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6">
                {[...world.narrativeLog].reverse().map((entry, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="font-bold text-primary">{entry.year}</div>
                      <div className="flex-grow w-px bg-border my-1"></div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{entry.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
