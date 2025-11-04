'use client';

import { Boon, creatorStoreBoons } from '@/data/boons';
import type { Race } from '@/types/world'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CreatorToolkitProps {
  race: Race | undefined; // Allow it to be undefined
  isLoading: boolean;
  onBoonToggle: (boonId: string, isActive: boolean) => void;
  onBoonPurchase: (boon: Boon) => void; // For modals
}

export function CreatorToolkit({
  race,
  isLoading,
  onBoonToggle,
  onBoonPurchase,
}: CreatorToolkitProps) {
  if (!race) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Creator's Toolkit</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Select a race to view its boons.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Creator's Toolkit</span>
          <Badge variant="secondary" className="text-lg">
            {race.racePoints} RP
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-[400px] pr-4"> {/* Added a fixed height for scroll */}
          <div className="space-y-4">
            {creatorStoreBoons.map((boon) => {
              const isAcquired = race.activeBoons.includes(boon.id);
              const canAfford = race.racePoints >= boon.cost;
              const isDisabled = isLoading || (!isAcquired && !canAfford);

              // Simple "Switch" boons
              if (boon.targetType === 'Self' && boon.duration !== 'Single Event') {
                return (
                  <div
                    key={boon.id}
                    className="flex items-center justify-between space-x-2 p-2 rounded-lg border"
                  >
                    <div className="flex-grow">
                      <label
                        htmlFor={boon.id}
                        className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {boon.name} ({boon.cost} RP)
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {boon.description}
                      </p>
                    </div>
                    <Switch
                      id={boon.id}
                      checked={isAcquired}
                      onCheckedChange={(isChecked) => onBoonToggle(boon.id, isChecked)}
                      disabled={isDisabled}
                    />
                  </div>
                );
              }

              // "Purchase" button boons (that trigger a modal)
              if (boon.targetType === 'Character' || boon.targetType === 'Self') {
                return (
                  <div
                    key={boon.id}
                    className="flex items-center justify-between space-x-2 p-2 rounded-lg border"
                  >
                    <div className="flex-grow">
                      <span className="font-medium">
                        {boon.name} ({boon.cost} RP)
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {boon.description}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onBoonPurchase(boon)}
                      disabled={isDisabled || (isAcquired && boon.duration === 'Single Event')} // Disable if a single-event boon is already active
                    >
                      {isAcquired && boon.duration === 'Single Event' ? 'Active' : 'Purchase'}
                    </Button>
                  </div>
                );
              }

              return null;
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
