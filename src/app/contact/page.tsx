import Image from 'next/image';
import { PageHeader } from '@/components/page-header';
import { ContactForm } from '@/components/contact-form';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function ContactPage() {
  const mapImage = PlaceHolderImages.find(p => p.id === 'contact-map');
  
  return (
    <div>
      <PageHeader
        title="Contact Us"
        subtitle="Have questions or suggestions? We'd love to hear from you. Reach out to us through any of the channels below."
      />
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          
          <div className="bg-card p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold font-headline text-primary mb-6">Send us a Message</h2>
            <ContactForm />
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 font-headline">Contact Information</h3>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 mt-1 text-primary flex-shrink-0" />
                  <span>GSVM Medical College, Swaroop Nagar, Kanpur, Uttar Pradesh, 208002</span>
                </li>
                <li className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-primary" />
                  <span>+91-123-456-7890</span>
                </li>
                <li className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-primary" />
                  <span>contact@utsarg-gsvm.com</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4 font-headline">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" aria-label="Facebook"><Button variant="outline" size="icon"><Facebook className="h-5 w-5" /></Button></a>
                <a href="#" aria-label="Twitter"><Button variant="outline" size="icon"><Twitter className="h-5 w-5" /></Button></a>
                <a href="#" aria-label="Instagram"><Button variant="outline" size="icon"><Instagram className="h-5 w-5" /></Button></a>
                <a href="#" aria-label="LinkedIn"><Button variant="outline" size="icon"><Linkedin className="h-5 w-5" /></Button></a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {mapImage && (
        <div className="w-full h-80 mt-8">
          <Image
            src={mapImage.imageUrl}
            alt="College Location Map"
            width={1600}
            height={400}
            className="w-full h-full object-cover"
            data-ai-hint={mapImage.imageHint}
          />
        </div>
      )}
    </div>
  );
}
