import type { Boon, BoonId } from '@/types/world';
import {
  BrainCircuit,
  HeartPulse,
  Shield,
  Sprout,
} from 'lucide-react';

export const creatorStoreBoons: Boon[] = [
  {
    id: 'fertility',
    name: 'Boon of Fertility',
    description: 'Greatly increases population growth.',
    cost: 50,
    icon: <Sprout className="h-6 w-6 text-green-400" />,
  },
  {
    id: 'strength',
    name: 'Boon of Strength',
    description: 'Improves outcomes in conflicts and physical challenges.',
    cost: 75,
    icon: <Shield className="h-6 w-6 text-red-400" />,
  },
  {
    id: 'wisdom',
    name: 'Boon of Wisdom',
    description: 'Accelerates technological and societal advancements.',
    cost: 100,
    icon: <BrainCircuit className="h-6 w-6 text-blue-400" />,
  },
  {
    id: 'resilience',
    name: 'Boon of Resilience',
    description: 'Helps mitigate the negative effects of cataclysms.',
    cost: 120,
    icon: <HeartPulse className="h-6 w-6 text-yellow-400" />,
  },
];
