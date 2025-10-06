
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Heart } from 'lucide-react';
import { Logo } from './logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SiteFooter() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground">
              GSVM Medical College Student Committee
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-accent"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-accent"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-accent"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-accent"><Linkedin className="h-5 w-5" /></a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Contact</h3>
            <ul className="mt-4 space-y-3">
              <li><p className="flex items-center text-sm text-muted-foreground"><MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-accent" />Swaroop Nagar, Kanpur</p></li>
              <li><a href="tel:+1234567890" className="flex items-center text-sm text-muted-foreground hover:text-accent"><Phone className="h-4 w-4 mr-2 flex-shrink-0 text-accent" />+1 234 567 890</a></li>
              <li><a href="mailto:info@utsarg.com" className="flex items-center text-sm text-muted-foreground hover:text-accent"><Mail className="h-4 w-4 mr-2 flex-shrink-0 text-accent" />info@utsarg.com</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Quick Links</h3>
            <ul className="mt-4 space-y-3 text-sm">
                <li><Link href="/about" className="text-muted-foreground hover:text-accent">About Us</Link></li>
                <li><Link href="/clubs" className="text-muted-foreground hover:text-accent">Clubs</Link></li>
                <li><Link href="/events" className="text-muted-foreground hover:text-accent">Events</Link></li>
                <li><Link href="/blog" className="text-muted-foreground hover:text-accent">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Newsletter</h3>
            <p className="mt-4 text-sm text-muted-foreground">Subscribe to our newsletter to get the latest updates.</p>
            <form className="mt-4 flex flex-col sm:flex-row gap-2">
              <Input type="email" placeholder="Enter your email" className="flex-grow" />
              <Button type="submit" variant="accent">Subscribe</Button>
            </form>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center space-y-2">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} UTSARG Student Committee. All rights reserved.</p>
          <p className="text-xs text-muted-foreground/80 flex items-center justify-center gap-1.5">
            Crafted with <Heart className="h-3 w-3 text-red-500" /> by <a href="https://www.linkedin.com/in/raghuvanshmani" target="_blank" rel="noopener noreferrer" className="hover:text-accent underline">Raghuvansh Mani (S2)</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
