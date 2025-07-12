'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BrainCircuit, Loader2, BookOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { generateExercisesAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Skeleton } from './ui/skeleton';

const formSchema = z.object({
  level: z.string().min(1, 'Please select a level.'),
  topic: z.string().min(2, 'Topic must be at least 2 characters.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function PracticeExercises() {
  const [isLoading, setIsLoading] = useState(false);
  const [exercises, setExercises] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      level: 'beginner',
      topic: 'Addition',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setExercises([]);
    const formData = new FormData();
    formData.append('level', values.level);
    formData.append('topic', values.topic);

    const result = await generateExercisesAction(formData);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Oh no! Something went wrong.',
        description: result.error,
      });
    } else if (result.data) {
      setExercises(result.data);
    }
    setIsLoading(false);
  }

  return (
    <Card className="h-full shadow-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2 text-xl">
              <BookOpen className="h-6 w-6 text-primary" />
              Practice Makes Perfect!
            </CardTitle>
            <CardDescription>
              Choose a level and topic to generate custom math exercises.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Subtraction, Fractions" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {isLoading && (
              <div className="space-y-4">
                 <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/> Generating your problems...</p>
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            )}
            {exercises.length > 0 && (
                 <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                 <AccordionItem value="item-1">
                   <AccordionTrigger className="text-base font-semibold">Your Exercises</AccordionTrigger>
                   <AccordionContent>
                     <ul className="space-y-3 pl-4 list-decimal list-inside text-base">
                       {exercises.map((ex, index) => (
                         <li key={index} className="rounded-md bg-background p-2">{ex}</li>
                       ))}
                     </ul>
                   </AccordionContent>
                 </AccordionItem>
               </Accordion>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-accent hover:bg-accent/90">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BrainCircuit className="mr-2 h-4 w-4" />
                  Generate Exercises
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
