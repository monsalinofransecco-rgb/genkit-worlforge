'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import type { Race } from '@/types/world';
import {
  Users,
  BookOpen,
  Gem,
  Landmark,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { ProblemsTab } from './ProblemsTab';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';

function StatCard({
  title,
  value,
  icon,
  popoverContent,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  popoverContent?: React.ReactNode;
}) {

  const cardContent = (
     <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )

  if (popoverContent) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="w-full text-left">{cardContent}</button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              {popoverContent}
            </PopoverContent>
        </Popover>
    )
  }

  return cardContent;
}


type TabProps = {
  race: Race;
};

export function OverviewTab({ race }: TabProps) {

  const populationPopover = (
    <div className='grid gap-4'>
        <div className="space-y-2">
            <h4 className="font-medium leading-none">Population Breakdown</h4>
            <p className="text-sm text-muted-foreground">
                An estimate of the race's demographics.
            </p>
        </div>
        <div className="grid gap-2 text-sm">
            <div className="grid grid-cols-2 items-center">
                <span className='text-muted-foreground'>Infant/Child:</span>
                <span className='font-bold'>~{(race.population * 0.25).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
            </div>
            <div className="grid grid-cols-2 items-center">
                <span className='text-muted-foreground'>Adolescent:</span>
                <span className='font-bold'>~{(race.population * 0.15).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
            </div>
            <div className="grid grid-cols-2 items-center">
                <span className='text-muted-foreground'>Adult:</span>
                <span className='font-bold'>~{(race.population * 0.50).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
            </div>
            <div className="grid grid-cols-2 items-center">
                <span className='text-muted-foreground'>Elderly:</span>
                <span className='font-bold'>~{(race.population * 0.10).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
            </div>
        </div>
    </div>
  )

  return (
    <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
            <StatCard title="Population" value={race.population.toLocaleString()} icon={<Users className="text-muted-foreground" />} popoverContent={populationPopover} />
            <StatCard title="Status" value={race.status} icon={<BookOpen className="text-muted-foreground" />} />
            <StatCard title="Race Points" value={race.racePoints} icon={<Gem className="text-muted-foreground" />} />
            <StatCard title="Religion" value={race.religion.name} icon={<Sparkles className="text-muted-foreground" />} />
            <StatCard title="Government" value={race.government.name} icon={<Landmark className="text-muted-foreground" />} />
            <StatCard title="Location" value={race.location || "Not Set"} icon={<MapPin className="text-muted-foreground" />} />
        </div>
        <ProblemsTab problems={race.problems || []} />
    </div>
  );
}
