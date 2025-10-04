'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, List } from 'lucide-react';
import { format } from 'date-fns';

import { events } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { EventCard } from '@/components/event-card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

type ViewMode = 'calendar' | 'list';

export function EventsView() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const eventsByDate = events.reduce((acc, event) => {
    const eventDate = format(new Date(event.date), 'yyyy-MM-dd');
    if (!acc[eventDate]) {
      acc[eventDate] = [];
    }
    acc[eventDate].push(event);
    return acc;
  }, {} as Record<string, typeof events>);

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="flex justify-center mb-8">
        <div className="p-1 bg-muted rounded-lg">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            onClick={() => setViewMode('list')}
            className="w-32"
          >
            <List className="mr-2 h-4 w-4" />
            List
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'ghost'}
            onClick={() => setViewMode('calendar')}
            className="w-32"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            Calendar
          </Button>
        </div>
      </div>

      {viewMode === 'list' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {viewMode === 'calendar' && (
        <Card>
            <CardContent className="p-2 md:p-6 flex justify-center">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md"
                    components={{
                    DayContent: ({ date }) => {
                        const dateStr = format(date, 'yyyy-MM-dd');
                        const dayEvents = eventsByDate[dateStr];
                        
                        if (dayEvents && dayEvents.length > 0) {
                        return (
                            <Popover>
                            <PopoverTrigger asChild>
                                <div className="relative w-full h-full">
                                    {date.getDate()}
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 bg-primary rounded-full" />
                                </div>
                            </PopoverTrigger>
                            <PopoverContent>
                                <h4 className="font-semibold mb-2">Events on {format(date, 'MMM do')}</h4>
                                <ul className="space-y-2">
                                {dayEvents.map(event => (
                                    <li key={event.id} className="text-sm text-muted-foreground">{event.title}</li>
                                ))}
                                </ul>
                            </PopoverContent>
                            </Popover>
                        );
                        }
                        return <div>{date.getDate()}</div>;
                    },
                    }}
                />
            </CardContent>
        </Card>
      )}
    </div>
  );
}
