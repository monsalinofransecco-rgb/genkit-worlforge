
'use client';

import { useState, useEffect } from 'react';
import { getWorldById, saveWorld } from '@/lib/world-store';
import type { World, HistoryEntry, NotableCharacter, Race, DeathDetails, CultureLogEntry, DetailObject, PoliticalLogEntry, BoonDirective } from '@/types/world';
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
import { History, Users, Skull, FileText, Swords, Sparkles, Landmark, Store, Download } from 'lucide-react';
import { GraveyardTab } from './GraveyardTab';
import { CharactersTab } from './CharactersTab';
import { CultureTab } from './CultureTab';
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
import { BoonModal } from '../BoonModal';
import { Boon, creatorStoreBoons } from '@/data/boons';
import { worldMap, getAdjacentTileIds } from '@/data/worldMap';
import type { MapTile } from '@/data/worldMap';


export default function Dashboard({ worldId }: { worldId: string }) {
  const [world, setWorld] = useState<World | null>(null);
  const [activeRaceId, setActiveRaceId] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [map, setMap] = useState(worldMap);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalBoon, setModalBoon] = useState<Boon | null>(null);


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
  
  const handleBoonPurchase = (boon: Boon) => {
    const race = world?.races.find(r => r.id === activeRaceId);
    if (!race || race.racePoints < boon.cost) {
      toast({
        variant: 'destructive',
        title: 'Cannot Purchase Boon',
        description: 'You do not have enough Race Points.',
      });
      return;
    }
    setModalBoon(boon);
    setIsModalOpen(true);
  };

  const handleDirectiveSubmit = (targets: string[], content: string) => {
    if (!modalBoon || !world) return;
  
    const race = world.races.find(r => r.id === activeRaceId);
    if (!race || race.racePoints < modalBoon.cost) {
      toast({
        variant: 'destructive',
        title: 'Activation Failed',
        description: 'You no longer have enough Race Points.',
      });
      setIsModalOpen(false);
      return;
    }
  
    const newDirective: BoonDirective = {
      id: `${modalBoon.id}_${Date.now()}`,
      boonId: modalBoon.id,
      raceId: activeRaceId,
      targets,
      content,
    };
  
    const newBoonDirectives = [...(world.boonDirectives || []), newDirective];
    const updatedRaces = world.races.map(r => 
      r.id === activeRaceId 
        ? { ...r, racePoints: r.racePoints - (modalBoon?.cost || 0) } 
        : r
    );
  
    updateWorld({ ...world, races: updatedRaces, boonDirectives: newBoonDirectives });
  
    toast({
      title: 'Boon Activated!',
      description: `${modalBoon.name} is now pending for the next era.`,
    });
  
    setIsModalOpen(false);
    setModalBoon(null);
  };
  

  const handleTimeAdvance = async (years: 1 | 10) => {
    if (!world) return;
    setIsLoading(true);

    const allRaceLocations = new Map<string, string>(); // Map<tileId, raceId>
    for (const r of world.races) {
      for (const tileId of r.occupiedTiles) {
        allRaceLocations.set(tileId, r.id);
      }
    }

    const raceInputs = world.races.map(race => {
        const boons: Record<string, boolean> = {};
        (race.activeBoons || []).forEach(boonId => {
            boons[boonId] = true;
        });

        const existingNames = race.notableCharacters.map(c => c.name);

        const raceDirectives = (world.boonDirectives || []).filter(d => d.raceId === race.id);

        const hydratedKnownTiles = race.knownTiles.map(tileId => {
          const tileData = map.find(t => t.id === tileId);
          if (!tileData) return null;

          const occupantId = allRaceLocations.get(tileId);
          const occupant = (occupantId && occupantId !== race.id) ? world.races.find(r => r.id === occupantId)?.name : undefined;

          return { ...tileData, occupant };
        }).filter(Boolean) as (MapTile & { occupant?: string })[];

        return {
            id: race.id,
            name: race.name,
            population: race.population,
            traits: race.traits || "",
            culture: race.culture,
            government: race.government,
            religion: race.religion,
            livingCharacters: race.notableCharacters.filter(c => c.status === 'alive'),
            problems: race.problems || [],
            boons: boons,
            namingProfile: race.namingProfile,
            occupiedTiles: race.occupiedTiles,
            knownTiles: hydratedKnownTiles,
            technologies: race.technologies || [],
            existingNames,
            boonDirectives: raceDirectives,
        }
    });

    const result = await runAdvanceTime({
      years,
      worldName: world.name,
      era: world.era,
      currentYear: world.currentYear,
      races: raceInputs,
      chronicleEntry: world.significantEvents[world.significantEvents.length-1],
    });
    setIsLoading(false);

    if (result.success && result.data) {
      const { data } = result;
      const { newYear, raceResults } = data;

      let updatedWorld = { ...world };

      let updatedRaces = updatedWorld.races.map(originalRace => {
          const raceResult = raceResults.find(res => res.raceId === originalRace.id);
          if (!raceResult) return originalRace;

          const { narrative, populationChange, emergenceReason, updatedProblems, newCharacter, characterLogEntries, fallenNotableCharacters, namedCommonerDeaths, newCulture, newCultureLogEntry, newGovernment, newReligion, newPoliticLogEntry, newAchievements, updatedOccupiedTiles, updatedKnownTiles, newTechnologies, newSettlement } = raceResult;

          const newHistoryEntry: HistoryEntry = {
              year: newYear,
              narrative,
              populationChange,
              emergenceReason,
          };

          let updatedCharacters = [...originalRace.notableCharacters];

          (fallenNotableCharacters || []).forEach(fallen => {
              const charIndex = updatedCharacters.findIndex(c => c.id === fallen.characterId);
              if (charIndex !== -1) {
                  updatedCharacters[charIndex].status = 'dead';
                  updatedCharacters[charIndex].deathDetails = fallen.deathDetails;
                  updatedCharacters[charIndex].deathYear = newYear;
              }
          });

          (namedCommonerDeaths || []).forEach(commoner => {
              const newDeadCharacter: NotableCharacter = {
                  id: crypto.randomUUID(),
                  name: commoner.name,
                  raceId: originalRace.id,
                  status: 'dead',
                  deathYear: newYear,
                  deathDetails: commoner.deathDetails,
                  title: commoner.title,
                  age: commoner.ageAtDeath,
                  class: 'Commoner',
                  ambition: 'Survival',
                  traits: [],
                  skills: [],
                  specialTraits: [],
                  personalLog: [],
                  namingProfile: originalRace.namingProfile,
              };
              updatedCharacters.push(newDeadCharacter);
          });
          
          if (newCharacter) {
              const fullNewCharacter: NotableCharacter = {
                  ...newCharacter,
                  raceId: originalRace.id,
                  status: 'alive',
                  personalLog: [{ year: newYear, entry: newCharacter.firstLogEntry }]
              };
              updatedCharacters.push(fullNewCharacter);
          }

          characterLogEntries.forEach(log => {
              const charIndex = updatedCharacters.findIndex(c => c.id === log.characterId && c.status === 'alive');
              if (charIndex > -1) {
                  updatedCharacters[charIndex].personalLog.push({ year: newYear, entry: log.logEntry });
              }
          });

          updatedCharacters.forEach(char => {
              if (char.status === 'alive') {
                  char.age += years;
              }
          });
          
          let updatedCultureLog = originalRace.cultureLog || [];
          if (newCultureLogEntry) {
              updatedCultureLog.push({ ...newCultureLogEntry, year: newYear });
          }
          
          let updatedPoliticalLog = originalRace.politicalLog || [];
          if (newPoliticLogEntry) {
              updatedPoliticalLog.push({ ...newPoliticLogEntry, year: newYear });
          }
            
          let updatedRacePoints = originalRace.racePoints;
          (newAchievements || []).forEach(ach => {
              updatedRacePoints += ach.rpAward;
              toast({
                  title: "Achievement Unlocked!",
                  description: `The ${originalRace.name} earned '${ach.title}' (+${ach.rpAward} RP)`
              })
          });

          const knownTilesSet = new Set(originalRace.knownTiles);
          (updatedOccupiedTiles || []).forEach(tileId => {
              if (!originalRace.occupiedTiles.includes(tileId)) {
                  originalRace.occupiedTiles.push(tileId);
              }
              knownTilesSet.add(tileId);
              getAdjacentTileIds(tileId).forEach(id => knownTilesSet.add(id));
          });
          (updatedKnownTiles || []).forEach(id => knownTilesSet.add(id));

          return {
              ...originalRace,
              population: populationChange.newPopulation,
              problems: updatedProblems || originalRace.problems,
              notableCharacters: updatedCharacters,
              history: [...originalRace.history, newHistoryEntry],
              culture: newCulture || originalRace.culture,
              cultureLog: updatedCultureLog,
              government: newGovernment || originalRace.government,
              religion: newReligion || originalRace.religion,
              politicalLog: updatedPoliticalLog,
              racePoints: updatedRacePoints,
              occupiedTiles: updatedOccupiedTiles,
              knownTiles: Array.from(knownTilesSet),
              technologies: newTechnologies ? [...(originalRace.technologies || []), ...newTechnologies] : originalRace.technologies,
              settlement: newSettlement || originalRace.settlement,
          };
      });

      const totalPopulation = updatedRaces.reduce((sum, r) => sum + r.population, 0);

       updatedRaces = updatedRaces.map(race => {
        const permanentBoons = (race.activeBoons || []).filter(boonId => {
          const boonDetails = creatorStoreBoons.find(b => b.id === boonId);
          return boonDetails?.duration === 'Permanent';
        });
        return { ...race, activeBoons: permanentBoons };
      });


      updateWorld({
        ...world,
        currentYear: newYear,
        races: updatedRaces,
        population: totalPopulation,
        boonDirectives: [], 
        narrativeLog: [...world.narrativeLog, ...raceResults.map(r => ({year: newYear, type: 'narrative', content: r.narrative}))], 
      });

      toast({
        title: `Time advanced by ${years} year(s).`,
        description: `The year is now ${newYear}.`,
      });

    } else {
      toast({
        variant: 'destructive',
        title: 'Error Advancing Time',
        description: result.error,
      });
    }
  };

  const handleSaveWorld = () => {
    if (!world) return;
    try {
      const worldJson = JSON.stringify(world, null, 2);
      const blob = new Blob([worldJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `World-${world.name.replace(/\s+/g, '_')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: 'World Saved',
        description: 'Your world has been downloaded as a JSON file.',
      });
    } catch (error) {
      console.error('Failed to save world:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save the world to a file.',
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
                <div className='flex-none'>
                    <Button variant="ghost" size="icon" aria-label="Save World" onClick={handleSaveWorld}>
                        <Download className="h-6 w-6 text-primary" />
                    </Button>
                </div>
                <div className='text-center flex-grow'>
                    <CardTitle className="font-headline text-4xl md:text-5xl text-primary">
                        {world.name}
                    </CardTitle>
                    <CardDescription>Current Year: {world.currentYear} - {world.era}</CardDescription>
                </div>
                <div className='flex-none'>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Open Creator's Store">
                                <Store className="h-6 w-6 text-primary" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                           <DialogHeader>
                                <DialogTitle className="font-headline flex items-center gap-2">
                                    <Sparkles className="text-primary" />
                                    Creator's Toolkit: {activeRace.name}
                                </DialogTitle>
                                <DialogDescription>
                                    Use your divine influence or spend Race Points (RP) to guide your people.
                                </DialogDescription>
                            </DialogHeader>
                           <InfluenceTab world={world} setWorld={updateWorld} isLoading={isLoading} activeRaceId={activeRaceId} onBoonPurchase={handleBoonPurchase} />
                        </DialogContent>
                    </Dialog>
                </div>
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
                    <TabsContent value="overview" className="pt-6">
                        <OverviewTab race={race} world={world} />
                    </TabsContent>
                    <TabsContent value="characters" className="pt-6">
                        <CharactersTab race={race} setWorld={updateWorld} isLoading={isLoading} setIsLoading={setIsLoading} />
                    </TabsContent>
                     <TabsContent value="history" className="pt-6">
                        <HistoryTab race={race} />
                    </TabsContent>
                     <TabsContent value="culture" className="pt-6">
                        <CultureTab race={race} />
                    </TabsContent>
                     <TabsContent value="politics" className="pt-6">
                        <PoliticsTab race={race} />
                    </TabsContent>
                    <TabsContent value="graveyard" className="pt-6">
                        <GraveyardTab race={race} />
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
      <BoonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        boon={modalBoon}
        race={activeRace}
        onSubmit={handleDirectiveSubmit}
      />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className='items-center'>
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-4 w-1/quarter" />
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

    