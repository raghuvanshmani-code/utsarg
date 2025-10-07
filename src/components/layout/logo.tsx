import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Stethoscope } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2" title="UTSARG">
      <Stethoscope className="h-8 w-8 text-accent" />
      <span className={cn("text-2xl font-bold text-white")}>
        UTSARG
      </span>
    </Link>
  );
}
