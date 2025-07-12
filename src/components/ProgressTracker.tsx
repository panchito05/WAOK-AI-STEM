'use client';

import { Award, BarChart, Flame, Star, Target } from 'lucide-react';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const chartData = [
  { day: 'Mon', problems: 5 },
  { day: 'Tue', problems: 8 },
  { day: 'Wed', problems: 6 },
  { day: 'Thu', problems: 10 },
  { day: 'Fri', problems: 7 },
  { day: 'Sat', problems: 12 },
  { day: 'Sun', problems: 4 },
];

const chartConfig = {
  problems: {
    label: 'Problems Solved',
    color: 'hsl(var(--accent))',
  },
};

export default function ProgressTracker() {
  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2 text-xl">
          <Award className="h-6 w-6 text-primary" />
          Your Awesome Progress!
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between gap-6">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="rounded-lg border bg-card p-3">
            <p className="text-2xl font-bold text-primary">78</p>
            <p className="text-xs text-muted-foreground">Problems Solved</p>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <p className="text-2xl font-bold text-primary">5</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
          <div className="rounded-lg border bg-card p-3 col-span-2">
            <p className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
              <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" /> 240
            </p>
            <p className="text-xs text-muted-foreground">Points Earned</p>
          </div>
        </div>
        <div className="flex-grow">
          <h3 className="mb-2 text-sm font-semibold text-center">Weekly Activity</h3>
          <ChartContainer config={chartConfig} className="h-[120px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} stroke="#888888" fontSize={12} />
                <YAxis hide={true} />
                <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="problems" fill="var(--color-problems)" radius={4} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
