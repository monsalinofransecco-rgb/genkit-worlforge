'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Problem } from '@/types/world';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type TabProps = {
  problems: Problem[];
};

const getSeverityStyles = (severity: Problem['severity']) => {
  switch (severity) {
    case 'High':
    case 'Critical':
      return 'border-red-500 bg-red-950/40';
    case 'Catastrophic':
      return 'border-purple-500 bg-purple-950/60';
    case 'Low':
    case 'Medium':
    default:
      return 'border-yellow-600 bg-yellow-950/40';
  }
};

const getIconColor = (problems: Problem[]) => {
    if (problems.some(p => ['High', 'Critical', 'Catastrophic'].includes(p.severity))) {
        return 'text-red-500';
    }
    if (problems.length > 0) {
        return 'text-yellow-500';
    }
    return 'text-muted-foreground';
}

export function ProblemsTab({ problems }: TabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className={cn('h-5 w-5', getIconColor(problems))} />
          Growing Problems
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {problems.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No pressing problems at this time.
          </p>
        ) : (
          problems.slice(0, 3).map((problem) => (
            <div
              key={problem.id}
              className={cn(
                'p-4 rounded-md border-l-4',
                getSeverityStyles(problem.severity)
              )}
            >
              <h4 className="font-semibold">{problem.title} <span className="text-sm font-normal text-muted-foreground">({problem.severity})</span></h4>
              <p className="text-sm text-muted-foreground mt-1">
                {problem.description}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
