'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import type { GalleryImage as GalleryImageType } from '@/lib/types';
import { useCollection } from '@/firebase';
import { Skeleton } from './ui/skeleton';

export function GalleryGrid() {
  const { data: images, loading } = useCollection<GalleryImageType>('gallery');
  const [selectedImage, setSelectedImage] = useState<GalleryImageType | null>(null);

  if (loading) {
      return (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
          </div>
      )
  }
  
  const validImages = images.filter(image => image.url && (image.url.startsWith('http://') || image.url.startsWith('https://')));

  return (
    <>
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {validImages.map((image) => (
            <div
              key={image.id}
              className="group relative break-inside-avoid cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <Image
                src={image.url}
                alt={image.caption || 'Gallery Image'}
                width={500}
                height={500}
                className="w-full h-auto rounded-lg shadow-md transition-transform duration-300 transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                <p className="text-white text-center p-4">{image.caption}</p>
              </div>
            </div>
          ))}
      </div>
      
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 border-0 bg-transparent">
          {selectedImage && (
            <>
              <DialogTitle className="sr-only">{selectedImage.caption}</DialogTitle>
              <DialogDescription className="sr-only">Enlarged view of the gallery image: {selectedImage.caption}</DialogDescription>
              <Image
                src={selectedImage.url!}
                alt={selectedImage.caption || ''}
                width={1200}
                height={800}
                className="w-full h-auto rounded-lg object-contain"
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
