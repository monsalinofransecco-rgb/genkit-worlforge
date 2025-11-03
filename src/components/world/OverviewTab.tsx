'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Race } from '@/types/world';
import {
  Users,
  BookOpen,
  Gem,
  Landmark,
  Sparkles,
  Hand,
} from 'lucide-react';

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}


type TabProps = {
  race: Race;
};

export function OverviewTab({ race }: TabProps) {

  return (
    <div className="grid md:grid-cols-3 gap-4">
        <StatCard title="Population" value={race.population.toLocaleString()} icon={<Users className="text-muted-foreground" />} />
        <StatCard title="General Status" value={race.traits ? 'Defined' : 'Nascent'} icon={<BookOpen className="text-muted-foreground" />} />
        <StatCard title="Race Points" value={race.racePoints} icon={<Gem className="text-muted-foreground" />} />
        <StatCard title="Politics" value="Tribal" icon={<Landmark className="text-muted-foreground" />} />
        <StatCard title="Culture" value="Nascent" icon={<Sparkles className="text-muted-foreground" />} />
        <StatCard title="Location" value={race.location || "Not Set"} icon={<Hand className="text-muted-foreground" />} />
    </div>
  );
}
