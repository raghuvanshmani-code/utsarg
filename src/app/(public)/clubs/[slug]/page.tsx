'use client';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Users, UserCheck, Paintbrush, Mic, Palette, Drama, BookOpen, IndianRupee, HandCoins } from 'lucide-react';

import { useDoc } from '@/firebase';
import type { Club } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const DetailCard = ({ title, icon: Icon, children }: { title: string, icon: React.ElementType, children: React.ReactNode }) => (
    <Card>
        <CardHeader className="flex flex-row items-center space-x-4 pb-2">
            <Icon className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
    </Card>
);

const getIconForActivity = (activity: string) => {
    const lowerActivity = activity.toLowerCase();
    if (lowerActivity.includes('paint') || lowerActivity.includes('sketch') || lowerActivity.includes('calligraphy')) return Palette;
    if (lowerActivity.includes('debate') || lowerActivity.includes('speech')) return Mic;
    if (lowerActivity.includes('theatre')) return Drama;
    if (lowerActivity.includes('writing') || lowerActivity.includes('book')) return BookOpen;
    return Paintbrush;
}

export default function ClubDetailsPage({ params: { slug } }: { params: { slug: string } }) {
  const { data: club, loading: clubLoading } = useDoc<Club>(`clubs/${slug}`);

  if (clubLoading) {
    return (
        <div>
            <Skeleton className="h-[40vh] w-full" />
             <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                    <div className="lg:col-span-1">
                        <Skeleton className="h-48 w-full" />
                    </div>
                </div>
            </div>
        </div>
    )
  }

  if (!club) {
    notFound();
  }
  
  return (
    <div>
      <section className="relative h-[40vh] w-full flex items-center justify-center text-center text-white">
        {club.bannerImage && (
          <Image
            src={club.bannerImage}
            alt={`${club.name} banner`}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 container mx-auto px-4 flex flex-col items-center">
            {club.logo && (
                 <Image src={club.logo} alt={`${club.name} logo`} width={100} height={100} className="rounded-full border-4 border-background bg-background mb-4" />
            )}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            {club.name}
          </h1>
          <Badge variant="secondary" className="mt-4 text-sm capitalize">{club.type.replace('_', ' & ')}</Badge>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-12">
            
            <Card>
                <CardHeader>
                    <CardTitle>About the Club</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-lg">{club.description}</p>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
                 <DetailCard title="Team & Members" icon={Users}>
                     <div className="space-y-4">
                        {club.membersCount && <p>Total Members: <span className="font-bold">{club.membersCount}</span></p>}
                        {club.volunteers && <p>Volunteers: <span className="font-bold">{club.volunteers}</span></p>}
                     </div>
                 </DetailCard>
                 <DetailCard title="Budget" icon={IndianRupee}>
                    <div className="space-y-4">
                        {club.budgetPerEventINR && <p>Avg. Per Event: <span className="font-bold">₹{club.budgetPerEventINR.toLocaleString('en-IN')}</span></p>}
                        {club.firstEventSetupBudgetINR && <p>First Event Setup: <span className="font-bold">₹{club.firstEventSetupBudgetINR.toLocaleString('en-IN')}</span></p>}
                        {club.refreshments3MonthsINR && <p>Quarterly Refreshments: <span className="font-bold">₹{club.refreshments3MonthsINR.toLocaleString('en-IN')}</span></p>}
                    </div>
                </DetailCard>
            </div>

            {club.coreVolunteers && club.coreVolunteers.length > 0 && (
                <DetailCard title="Core Volunteers" icon={UserCheck}>
                    <ul className="space-y-3">
                    {club.coreVolunteers.map((volunteer, index) => (
                        <li key={index} className="flex justify-between items-center">
                        <span className="font-medium">{volunteer.name}</span>
                        <Badge variant="outline">{volunteer.role}</Badge>
                        </li>
                    ))}
                    </ul>
                </DetailCard>
            )}

            {(club.genres || club.activities) && (
                <div className="grid md:grid-cols-2 gap-8">
                    {club.genres && club.genres.length > 0 && (
                        <DetailCard title="Genres" icon={Paintbrush}>
                            <div className="flex flex-wrap gap-2">
                                {club.genres.map((genre) => <Badge key={genre} variant="secondary">{genre}</Badge>)}
                            </div>
                        </DetailCard>
                    )}
                    {club.activities && club.activities.length > 0 && (
                        <DetailCard title="Activities" icon={Drama}>
                            <ul className="space-y-2">
                                {club.activities.map((activity) => {
                                    const ActivityIcon = getIconForActivity(activity);
                                    return (
                                        <li key={activity} className="flex items-center gap-2">
                                            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                                            <span>{activity}</span>
                                        </li>
                                    )
                                })}
                            </ul>
                        </DetailCard>
                    )}
                </div>
            )}
             
            {(club.requirements || club.performanceOrder) && <Separator />}

            {club.requirements && club.requirements.length > 0 && (
                <div>
                    <h3 className="text-2xl font-bold text-center mb-6">What We Need</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                        {club.requirements.map((req) => (
                            <div key={req} className="bg-card border rounded-lg px-4 py-2 flex items-center gap-2">
                                <HandCoins className="h-4 w-4 text-accent" />
                                <span className="font-medium capitalize">{req}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
