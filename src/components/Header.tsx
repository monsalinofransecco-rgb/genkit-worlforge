import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Swords, UserCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export default function Header() {
  const headerImage = PlaceHolderImages.find((img) => img.id === 'header-banner');

  return (
    <header className="relative w-full h-40 md:h-48 border-b-4 border-primary/50">
      {headerImage && (
        <Image
          src={headerImage.imageUrl}
          alt={headerImage.description}
          fill
          className="object-cover"
          priority
          data-ai-hint={headerImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      <div className="relative z-10 container mx-auto flex items-end h-full p-4 md:p-6">
        <div className="flex items-center justify-between w-full">
            <Link href="/" className="flex items-center gap-4">
            <div className="bg-primary/10 border-2 border-primary/50 p-3 rounded-lg">
                <Swords className="h-8 w-8 text-primary" />
            </div>
            <div>
                <h1 className="text-2xl md:text-4xl font-headline font-bold text-white shadow-lg">
                WorldForge Chronicles
                </h1>
                <p className="text-sm md:text-base text-primary-foreground/80">
                Your own procedural world history generator.
                </p>
            </div>
            </Link>
            <div className="flex items-center gap-4">
                <Avatar>
                    <AvatarImage src="https://picsum.photos/seed/user-avatar/100/100" data-ai-hint="fantasy character" />
                    <AvatarFallback>
                        <UserCircle />
                    </AvatarFallback>
                </Avatar>
            </div>
        </div>
      </div>
    </header>
  );
}
