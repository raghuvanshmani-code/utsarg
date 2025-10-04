import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
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
              <a href="#" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5" /></a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Contact</h3>
            <ul className="mt-4 space-y-3">
              <li><p className="flex items-center text-sm text-muted-foreground"><MapPin className="h-4 w-4 mr-2 flex-shrink-0" />Swaroop Nagar, Kanpur, Uttar Pradesh</p></li>
              <li><a href="tel:+1234567890" className="flex items-center text-sm text-muted-foreground hover:text-primary"><Phone className="h-4 w-4 mr-2 flex-shrink-0" />+1 234 567 890</a></li>
              <li><a href="mailto:info@utsarg.com" className="flex items-center text-sm text-muted-foreground hover:text-primary"><Mail className="h-4 w-4 mr-2 flex-shrink-0" />info@utsarg.com</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Quick Links</h3>
            <ul className="mt-4 space-y-3 text-sm">
                <li><a href="/about" className="text-muted-foreground hover:text-primary">About Us</a></li>
                <li><a href="/clubs" className="text-muted-foreground hover:text-primary">Clubs</a></li>
                <li><a href="/events" className="text-muted-foreground hover:text-primary">Events</a></li>
                <li><a href="/blog" className="text-muted-foreground hover:text-primary">Blog</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Newsletter</h3>
            <p className="mt-4 text-sm text-muted-foreground">Subscribe to our newsletter to get the latest updates.</p>
            <form className="mt-4 flex flex-col sm:flex-row gap-2">
              <Input type="email" placeholder="Enter your email" className="flex-grow" />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} UTSARG Student Committee. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
