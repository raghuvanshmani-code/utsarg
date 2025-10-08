
'use client';
import { PageHeader } from '@/components/page-header';
import { useCollection } from '@/firebase';
import type { FundTransaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight, FileImage } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function FinanceSkeleton() {
    return (
        <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
        </div>
    );
}

export default function FinancePage() {
    const { data: transactions, loading } = useCollection<FundTransaction>('funds/accounting/transactions');

    return (
        <div>
            <PageHeader
                title="Financial Records"
                subtitle="A transparent look at our society's financial transactions."
            />
            <div className="container mx-auto px-4 py-12 md:py-16">
                <Card>
                    <CardHeader>
                        <CardTitle>Transaction History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <FinanceSkeleton />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Purpose</TableHead>
                                        <TableHead>Source</TableHead>
                                        <TableHead>Receipt</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((tx) => (
                                        <TableRow key={tx.id}>
                                            <TableCell>{format(new Date(tx.date), 'MMM dd, yyyy')}</TableCell>
                                            <TableCell className="font-medium">{tx.purpose}</TableCell>
                                            <TableCell className="text-muted-foreground">{tx.source}</TableCell>
                                            <TableCell>
                                                {tx.imageUrl ? (
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link href={tx.imageUrl} target="_blank" rel="noopener noreferrer">
                                                           <FileImage className="h-4 w-4 mr-2" /> View
                                                        </Link>
                                                    </Button>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">N/A</span>
                                                )}
                                            </TableCell>
                                            <TableCell className={`text-right font-semibold ${tx.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                <div className="flex items-center justify-end">
                                                    {tx.amount >= 0 ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownLeft className="h-4 w-4 mr-1" />}
                                                    ₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
