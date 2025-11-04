'use client';

import { useState, useEffect } from 'react';
import { Boon } from '@/data/boons';
import type { Race } from '@/types/world'; 
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  boon: Boon | null;
  race: Race | undefined;
  onSubmit: (targets: string[], content: string) => void;
}

export function BoonModal({ isOpen, onClose, boon, race, onSubmit }: BoonModalProps) {
  const [target1, setTarget1] = useState<string>('');
  const [target2, setTarget2] = useState<string>('');
  const [content, setContent] = useState<string>('');

  // Reset form when boon changes
  useEffect(() => {
    setTarget1('');
    setTarget2('');
    setContent('');
  }, [boon]);

  if (!boon || !race) return null;

  const handleSubmit = () => {
    let targets: string[] = [];
    if (boon.targetType === 'Character') {
      if (boon.id === 'whisper_of_attraction') {
        targets = [target1, target2];
      } else {
        targets = [target1];
      }
    }
    onSubmit(targets, content);
  };

  const renderContent = () => {
    switch (boon.id) {
      case 'appear_in_dreams':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target1">Select Character</Label>
              <Select onValueChange={setTarget1} value={target1}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a character..." />
                </SelectTrigger>
                <SelectContent>
                  {(race.notableCharacters || []).filter(c => c.status === 'alive').map((char) => (
                    <SelectItem key={char.id} value={char.id}>
                      {char.name} ({char.title})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Message / Omen</Label>
              <Textarea
                id="content"
                placeholder="e.g., 'The mountain will bleed...'"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>
        );
      case 'possess_animal':
        return (
          <div className="space-y-2">
            <Label htmlFor="content">Guidance</Label>
            <Textarea
              id="content"
              placeholder="Describe how you will guide them... e.g., 'As a hawk, I will lead them to a hidden spring.'"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        );
      case 'whisper_of_attraction':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target1">Select First Character</Label>
              <Select onValueChange={setTarget1} value={target1}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a character..." />
                </SelectTrigger>
                <SelectContent>
                  {(race.notableCharacters || []).filter(c => c.status === 'alive').map((char) => (
                    <SelectItem key={char.id} value={char.id}>
                      {char.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target2">Select Second Character</Label>
              <Select onValueChange={setTarget2} value={target2}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a character..." />
                </SelectTrigger>
                <SelectContent>
                  {(race.notableCharacters || []).filter(c => c.status === 'alive').map((char) => (
                    <SelectItem key={char.id} value={char.id}>
                      {char.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Desired Bond</Label>
              <Textarea
                id="content"
                placeholder="e.g., 'A deep friendship', 'A bitter rivalry', 'A cautious romance'"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>
        );
      default:
        return <p>This boon has no special options.</p>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{boon.name}</DialogTitle>
          <DialogDescription>{boon.description}</DialogDescription>
        </DialogHeader>
        <div className="py-4">{renderContent()}</div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>
            Activate Boon ({boon.cost} RP)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
