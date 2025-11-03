
'use client';

import { useState, useEffect, use } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import { getWorldById, saveWorld } from '@/lib/world-store';
import { runGenerateRaceNamingProfile } from '@/app/actions';
import type { World, Race } from '@/types/world';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const raceSchema = z.object({
  name: z.string().min(3, 'Race name must be at least 3 characters.'),
  description: z.string().min(10, 'Describe the race.'),
  racialTraits: z
    .string()
    .min(3, 'List at least one common trait.')
    .refine(
      (value) => value.split(',').filter((t) => t.trim()).length <= 5,
      'You can enter a maximum of 5 racial traits.'
    ),
  specialTraits: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value || value.split(',').filter((t) => t.trim()).length <= 3,
      'You can enter a maximum of 3 special traits.'
    ),
  location: z.string().min(5, 'Describe their starting location.'),
  population: z.number().int().min(100).max(5000).default(1000),
});

const formSchema = z.object({
  races: z.array(raceSchema),
});

type FormValues = z.infer<typeof formSchema>;

type PageParams = {
  id: string;
};

export default function PopulateRacesPage({
  params: paramsProp,
}: {
  params: Promise<PageParams>;
}) {
  const params = use(paramsProp);
  const router = useRouter();
  const { toast } = useToast();
  const [world, setWorld] = useState<World | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [raceCount, setRaceCount] = useState(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      races: [],
    },
  });

  const { fields, append } = useFieldArray({
    control: form.control,
    name: 'races',
  });

  useEffect(() => {
    setIsMounted(true);
    const loadedWorld = getWorldById(params.id);
    if (loadedWorld) {
      setWorld(loadedWorld);
      
      const worldRaceCount = loadedWorld.races.length > 0 ? loadedWorld.races.length : 0;
      
      const currentRaces = form.getValues('races');
      if (fields.length === 0 && worldRaceCount > 0) {
        for (let i = 0; i < worldRaceCount; i++) {
          append({ name: '', description: '', racialTraits: '', specialTraits: '', location: '', population: 1000 });
        }
      }
       setRaceCount(worldRaceCount);
    }
  }, [params.id, append, form, fields.length]);

  async function onSubmit(data: FormValues) {
    if (!world) return;
    setIsLoading(true);

    try {
      const finalRaces: Race[] = [];
      let totalPopulation = 0;

      for (const raceData of data.races) {
        const namingProfileResult = await runGenerateRaceNamingProfile({
          raceName: raceData.name,
        });

        if (!namingProfileResult.success || !namingProfileResult.data) {
          throw new Error(
            `Failed to generate naming profile for ${raceData.name}`
          );
        }
        
        const population = raceData.population;
        totalPopulation += population;

        finalRaces.push({
          id: crypto.randomUUID(),
          name: raceData.name,
          traits: `${raceData.description} Common traits: ${raceData.racialTraits}. Special traits: ${raceData.specialTraits || 'None'}.`,
          location: raceData.location,
          population: population,
          racePoints: 100,
          activeBoons: [],
          namingProfile: namingProfileResult.data,
        });
      }

      const finalWorld: World = {
        ...world,
        races: finalRaces,
        population: totalPopulation,
        narrativeLog: [
            ...world.narrativeLog,
            { year: 1, type: 'narrative', content: `The races of ${world.name} have been forged.`}
        ]
      };

      saveWorld(finalWorld);
      toast({
        title: 'World Forged!',
        description: 'Your world and its races have been created.',
      });
      router.push(`/world/${world.id}`);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Failed to Forge World',
        description:
          error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      setIsLoading(false);
    }
  }

  if (!isMounted) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-950">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!world || raceCount === 0) {
    if (isMounted && !world) return notFound();
    return (
      <div className="flex flex-col min-h-screen bg-zinc-950">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">
              Populate Your World: {world.name}
            </CardTitle>
            <CardDescription>
              Breathe life into the primal races that will shape history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <Tabs defaultValue="race-0" className="w-full">
                  <TabsList className={`grid w-full grid-cols-${raceCount}`}>
                    {Array.from({ length: raceCount }).map((_, i) => (
                      <TabsTrigger key={i} value={`race-${i}`}>
                        Race {i + 1}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {fields.map((field, index) => (
                    <TabsContent
                      key={field.id}
                      value={`race-${index}`}
                      className="mt-6"
                    >
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name={`races.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Race Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., The Sunstone Dwarves"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`races.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe their culture, appearance, and core philosophies. Are they stoic builders, nomadic mystics, or fierce warriors?"
                                  {...field}
                                  rows={3}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                            control={form.control}
                            name={`races.${index}.racialTraits`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Racial Traits (Max 5, comma-separated)</FormLabel>
                                <FormControl>
                                    <Input
                                    placeholder="e.g., Hardy, Industrious, Stubborn"
                                    {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                             <FormField
                            control={form.control}
                            name={`races.${index}.specialTraits`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Special Traits (Max 3, comma-separated)</FormLabel>
                                <FormControl>
                                    <Input
                                    placeholder="e.g., Fire Resistance, Night Vision"
                                    {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <FormField
                            control={form.control}
                            name={`races.${index}.location`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Starting Location</FormLabel>
                                <FormControl>
                                    <Input
                                    placeholder="e.g., The Crystal Mountains"
                                    {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                                control={form.control}
                                name={`races.${index}.population`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Starting Population</FormLabel>
                                    <FormControl>
                                        <Input
                                        type="number"
                                        placeholder="e.g., 1000"
                                        {...field}
                                        onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
                <Button
                  type="submit"
                  className="w-full mt-8"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Forge World
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
