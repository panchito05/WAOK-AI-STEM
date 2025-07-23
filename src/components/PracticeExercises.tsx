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
import { api } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Skeleton } from './ui/skeleton';

const formSchema = z.object({
  level: z.string().min(1, 'Please select a level.'),
  topic: z.string().min(2, 'Topic must be at least 2 characters.'),
});

type FormValues = z.infer<typeof formSchema>;

type Exercise = {
  problem: string;
  solution: string;
  explanation: string;
};

export default function PracticeExercises() {
  const [isLoading, setIsLoading] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      level: 'beginner',
      topic: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setExercises([]);
    const formData = new FormData();
    formData.append('level', values.level);
    formData.append('topic', values.topic);

    const result = await api.generateExercises({
      level: values.level,
      topic: values.topic
    });

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
                      <Input placeholder="e.g., Fracciones, Ecuaciones, Propiedades conmutativas" {...field} />
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
      
      {exercises.length > 0 && (
        <CardContent className="pt-0">
          <h3 className="font-semibold mb-3">Your Exercises:</h3>
          <Accordion type="single" collapsible className="w-full">
            {exercises.map((exercise, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>
                  <span className="text-left">
                    Exercise {index + 1}: {exercise.problem}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div className="bg-green-50 p-3 rounded-md">
                    <p className="font-semibold text-green-700">Solution:</p>
                    <p className="text-green-600">{exercise.solution}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="font-semibold text-blue-700">Explanation:</p>
                    <p className="text-blue-600">{exercise.explanation}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      )}
    </Card>
  );
}
