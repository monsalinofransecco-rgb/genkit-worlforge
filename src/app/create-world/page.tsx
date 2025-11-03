'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Header from '@/components/Header';
import { Sparkles } from 'lucide-react';
import { createPreliminaryWorld } from '@/lib/world-store';

const formSchema = z.object({
  worldName: z.string().min(3, 'World name must be at least 3 characters.'),
  raceCount: z.string().refine((val) => ['1', '2', '3', '4'].includes(val), {
    message: 'Please select a number of races.',
  }),
});

export default function CreateWorldPage() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      worldName: '',
      raceCount: '1',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const raceCount = parseInt(values.raceCount, 10);
    const newWorld = createPreliminaryWorld(values.worldName, raceCount);
    router.push(`/create-world/${newWorld.id}/races`);
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">
              Forge a New World
            </CardTitle>
            <CardDescription>
              Define the first echoes of creation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="worldName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>World Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Ael, Nemathor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="raceCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Races</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select the number of initial races" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Next Step
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
