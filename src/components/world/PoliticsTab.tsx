'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Landmark } from 'lucide-react';


export function PoliticsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
          <Landmark className="mr-2" /> Politics
        </CardTitle>
        <CardDescription>
          The governing systems and laws of the race.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center py-16 text-muted-foreground">
            <Landmark className="w-16 h-16 mb-4" />
            <p>The political landscape is yet to be defined.</p>
            <p className='text-sm'>As your world evolves, so too will its governance.</p>
        </div>
      </CardContent>
    </Card>
  );
}
