'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { NavItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from './logo';

const navItems: NavItem[] = [
  { title: 'Home', href: '/' },
  { title: 'About', href: '/about' },
  { title: 'Clubs', href: '/clubs' },
  { title: 'Events', href: '/events' },
  { title: 'Gallery', href: '/gallery' },
  { title: 'Blog', href: '/blog' },
  { title: 'Contact', href: '/contact' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between">
        <Logo />
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex">
          <ul className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <li key={item.title}>
                <Link
                  href={item.href}
                  className={cn(
                    'transition-colors hover:text-primary',
                    pathname === item.href ? 'text-primary' : 'text-foreground/60'
                  )}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                   <Logo />
                   <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-6 w-6" />
                         <span className="sr-only">Close Menu</span>
                      </Button>
                    </SheetTrigger>
                </div>
                <nav className="flex-grow p-4">
                  <ul className="space-y-4">
                    {navItems.map((item) => (
                      <li key={item.title}>
                        <Link
                          href={item.href}
                          className={cn(
                            'text-lg font-medium transition-colors hover:text-primary',
                            pathname === item.href ? 'text-primary' : 'text-foreground'
                          )}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
