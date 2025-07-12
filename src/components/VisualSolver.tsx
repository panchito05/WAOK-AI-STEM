'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, Sparkles, Loader2, Lightbulb } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { solveVisuallyAction } from '@/app/actions';
import { cn } from '@/lib/utils';

export default function VisualSolver() {
  const [isLoading, setIsLoading] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setSolution(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      toast({
        variant: 'destructive',
        title: 'No image selected',
        description: 'Please upload an image of a math problem first.',
      });
      return;
    }

    setIsLoading(true);
    setSolution(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = async () => {
        const photoDataUri = reader.result as string;
        const result = await solveVisuallyAction(photoDataUri);

        if (result.error) {
          toast({
            variant: 'destructive',
            title: 'Oh no! Something went wrong.',
            description: result.error,
          });
        } else if (result.data) {
          setSolution(result.data);
        }
        setIsLoading(false);
      };
      reader.onerror = () => {
        throw new Error("Couldn't read file");
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Oh no! Something went wrong.',
        description: 'Could not process the image. Please try again.',
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2 text-xl">
          <Camera className="h-6 w-6 text-primary" />
          Photo Math Solver
        </CardTitle>
        <CardDescription>
          Snap a picture of a math problem, and our AI will solve it for you!
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div
          className={cn(
            'relative flex h-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-card',
            { 'border-primary': !imagePreview }
          )}
          onClick={handleUploadClick}
        >
          {imagePreview ? (
            <Image
              src={imagePreview}
              alt="Math problem preview"
              layout="fill"
              objectFit="contain"
              className="rounded-lg"
            />
          ) : (
            <>
              <Camera className="h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Click to upload a photo
              </p>
            </>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </div>

        <div className="flex flex-col justify-between">
          <div className="flex-grow">
            {isLoading && (
              <div className="flex h-full flex-col items-center justify-center rounded-lg bg-card p-4 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 font-semibold">Our AI is thinking...</p>
                <p className="text-sm text-muted-foreground">Solving your problem now!</p>
              </div>
            )}
            {solution && (
              <div className="rounded-lg border bg-background p-4">
                <h3 className="font-headline flex items-center gap-2 text-lg font-semibold text-primary">
                  <Lightbulb className="h-5 w-5" />
                  Solution
                </h3>
                <p className="mt-2 text-xl font-bold text-foreground">{solution}</p>
              </div>
            )}
            {!isLoading && !solution && (
              <div className="flex h-full flex-col items-center justify-center rounded-lg bg-card p-4 text-center">
                 <p className="text-muted-foreground">The solution will appear here.</p>
              </div>
            )}
          </div>
          <Button onClick={handleSubmit} disabled={isLoading || !imageFile} className="mt-4 w-full bg-accent hover:bg-accent/90">
            <Sparkles className="mr-2 h-4 w-4" />
            Solve with AI
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
