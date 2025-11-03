'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { World, NarrativeEntry } from '@/types/world';
import {
  BookText,
} from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

type TabProps = {
  world: World;
};

export function OverviewTab({ world }: TabProps) {

  return (
    <div className="pt-6">
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
  );
}

    