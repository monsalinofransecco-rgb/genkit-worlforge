'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Race } from '@/types/world';
import { Clock, Palette, Sparkles } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

type TabProps = {
  race: Race;
};

export function CultureTab({ race }: TabProps) {
  const cultureLog = [...(race.cultureLog || [])].reverse();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Sparkles />
            Current Culture: {race.culture.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">{race.culture.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Clock />
            Cultural History
          </CardTitle>
          <CardDescription>The story of how the {race.name}'s culture has changed over time.</CardDescription>
        </CardHeader>
        <CardContent>
            <ScrollArea className="h-96 pr-4">
                <div className="relative pl-6">
                    <div className="absolute left-0 top-0 h-full w-0.5 bg-border" />
                    <div className="space-y-8">
                        {cultureLog.length > 0 ? cultureLog.map((entry, index) => (
                            <div key={index} className="relative">
                                <div className="absolute -left-9 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                                    <Palette className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-headline text-lg text-primary mb-1">Year {entry.year}: {entry.eventName}</h4>
                                    <p className="italic text-sm text-muted-foreground">"{entry.summary}"</p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center text-muted-foreground py-16">
                                <p>This culture is still in its nascent stage.</p>
                                <p className="text-sm">Time and trials will forge its identity.</p>
                            </div>
                        )}
                    </div>
                </div>
            </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
