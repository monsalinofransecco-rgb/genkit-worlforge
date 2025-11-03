'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { World } from '@/types/world';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  runGenerateRaceNamingProfile,
} from '@/app/actions';
import { Loader2, Users, Wand2 } from 'lucide-react';

type TabProps = {
  world: World;
  setWorld: (world: World) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

export function RacesTab({ world, setWorld, isLoading, setIsLoading }: TabProps) {

  const { toast } = useToast();

  const handleGenerateNamingProfile = async (raceId: string) => {
    const race = world.races.find((r) => r.id === raceId);
    if (!race) return;

    setIsLoading(true);
    const result = await runGenerateRaceNamingProfile({ raceName: race.name });
    setIsLoading(false);

    if (result.success && result.data) {
      const updatedRaces = world.races.map((r) =>
        r.id === raceId ? { ...r, namingProfile: result.data } : r
      );
      setWorld({ ...world, races: updatedRaces });
      toast({ title: 'Naming Profile Generated!' });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error Generating Profile',
        description: result.error,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
          <Users className="mr-2" /> Race Culture
        </CardTitle>
        <CardDescription>
          Explore the unique cultural and linguistic details of each race.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full" defaultValue={world.races[0]?.id}>
          {world.races.map((race) => (
            <AccordionItem key={race.id} value={race.id}>
              <AccordionTrigger className='font-headline'>{race.name}</AccordionTrigger>
              <AccordionContent className="space-y-6 p-2">
                <p className='text-sm text-muted-foreground'>{race.traits}</p>
                <Card>
                    <CardHeader>
                        <CardTitle className='text-lg flex items-center gap-2'><Wand2 size={20}/> Naming Profile</CardTitle>
                        {!race.namingProfile && <CardDescription>Generate a linguistic profile for this race.</CardDescription>}
                    </CardHeader>
                    <CardContent>
                        {race.namingProfile ? (
                        <div className="space-y-2 text-sm">
                            <p><strong className="text-muted-foreground">Inspiration:</strong> {race.namingProfile.inspiration}</p>
                            <p><strong className="text-muted-foreground">Structure:</strong> {race.namingProfile.languageStructure}</p>
                            <p><strong className="text-muted-foreground">Phonemes:</strong> {race.namingProfile.phonemes}</p>
                        </div>
                        ) : (
                        <Button onClick={() => handleGenerateNamingProfile(race.id)} disabled={isLoading} size="sm">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Generate Profile
                        </Button>
                        )}
                    </CardContent>
                </Card>

              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
