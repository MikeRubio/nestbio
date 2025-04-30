export interface Template {
    id: string;
    name: string;
    description: string;
    thumbnail: string;
    colors: {
      background: string;
      text: string;
      buttonBg: string;
      buttonText: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
  }
  
  export const templates: Template[] = [
    {
      id: 'tropical-breeze',
      name: 'Tropical Breeze',
      description: 'A vibrant, beach-inspired theme with turquoise and coral accents',
      thumbnail: 'https://images.pexels.com/photos/1938032/pexels-photo-1938032.jpeg',
      colors: {
        background: 'bg-gradient-to-br from-primary-400 to-secondary-400',
        text: 'text-white',
        buttonBg: 'bg-white/20 hover:bg-white/30',
        buttonText: 'text-white',
      },
      fonts: {
        heading: 'font-display',
        body: 'font-sans',
      },
    },
    {
      id: 'sunset-vibes',
      name: 'Sunset Vibes',
      description: 'Warm sunset colors with a gradient background',
      thumbnail: 'https://images.pexels.com/photos/1237119/pexels-photo-1237119.jpeg',
      colors: {
        background: 'bg-gradient-to-br from-secondary-400 to-accent-400',
        text: 'text-white',
        buttonBg: 'bg-white/20 hover:bg-white/30',
        buttonText: 'text-white',
      },
      fonts: {
        heading: 'font-display',
        body: 'font-sans',
      },
    },
    {
      id: 'ocean-depths',
      name: 'Ocean Depths',
      description: 'Deep blue tones inspired by the Caribbean sea',
      thumbnail: 'https://images.pexels.com/photos/1938031/pexels-photo-1938031.jpeg',
      colors: {
        background: 'bg-gradient-to-br from-blue-600 to-primary-400',
        text: 'text-white',
        buttonBg: 'bg-white/20 hover:bg-white/30',
        buttonText: 'text-white',
      },
      fonts: {
        heading: 'font-display',
        body: 'font-sans',
      },
    },
    {
      id: 'island-minimal',
      name: 'Island Minimal',
      description: 'Clean and minimal with subtle tropical touches',
      thumbnail: 'https://images.pexels.com/photos/1938033/pexels-photo-1938033.jpeg',
      colors: {
        background: 'bg-white',
        text: 'text-gray-900',
        buttonBg: 'bg-primary-500 hover:bg-primary-600',
        buttonText: 'text-white',
      },
      fonts: {
        heading: 'font-display',
        body: 'font-sans',
      },
    },
  ];