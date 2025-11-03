'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BookOpen, Clock, Landmark } from 'lucide-react';
import type { Race } from '@/types/world';
import { ScrollArea } from '../ui/scroll-area';

type TabProps = {
  race: Race;
};

export function PoliticsTab({ race }: TabProps) {
  const politicalLog = [...(race.politicalLog || [])].reverse();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Landmark />
              {race.government.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {race.government.description}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <BookOpen />
              {race.religion.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {race.religion.description}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Clock />
            Political History
          </CardTitle>
          <CardDescription>
            The story of how the {race.name}'s society has been organized.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96 pr-4">
            <div className="relative pl-6">
              <div className="absolute left-0 top-0 h-full w-0.5 bg-border" />
              <div className="space-y-8">
                {politicalLog.length > 0 ? (
                  politicalLog.map((entry, index) => (
                    <div key={index} className="relative">
                      <div className="absolute -left-9 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                        <Landmark className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-headline text-lg text-primary mb-1">
                          Year {entry.year}: {entry.eventName}
                        </h4>
                        <p className="italic text-sm text-muted-foreground">
                          "{entry.summary}"
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-16">
                    <p>No major political or religious shifts have been recorded.</p>
                    <p className="text-sm">
                      Time and trials will forge their systems of power and belief.
                    </p>
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
