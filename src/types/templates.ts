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
    cardBg?: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  styles?: {
    buttonRadius?: string;
    buttonShadow?: string;
    imageFilter?: string;
  };
}

export const templates: Template[] = [
  {
    id: 'tropical-breeze',
    name: 'Tropical Breeze',
    description: 'A vibrant, beach-inspired theme with turquoise and coral accents',
    thumbnail: 'https://images.pexels.com/photos/1938032/pexels-photo-1938032.jpeg',
    colors: {
      background: 'bg-[url("https://images.pexels.com/photos/1938032/pexels-photo-1938032.jpeg")] bg-cover bg-center bg-fixed before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary-400/90 before:to-secondary-400/90 before:-z-10 relative',
      text: 'text-white',
      buttonBg: 'bg-white/20 hover:bg-white/30 backdrop-blur-sm',
      buttonText: 'text-white',
      cardBg: 'bg-white/10 backdrop-blur-md',
    },
    fonts: {
      heading: 'font-display',
      body: 'font-sans',
    },
    styles: {
      buttonRadius: 'rounded-2xl',
      buttonShadow: 'shadow-lg shadow-black/5',
      imageFilter: 'brightness-110 contrast-110',
    },
  },
  {
    id: 'neon-nights',
    name: 'Neon Nights',
    description: 'Bold and vibrant with neon accents',
    thumbnail: 'https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg',
    colors: {
      background: 'bg-gray-900 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-accent-600/20 via-gray-900 to-gray-900',
      text: 'text-white',
      buttonBg: 'bg-accent-500/20 hover:bg-accent-500/30 border border-accent-500/30',
      buttonText: 'text-accent-400',
      cardBg: 'bg-gray-800/50',
    },
    fonts: {
      heading: 'font-display',
      body: 'font-sans',
    },
    styles: {
      buttonRadius: 'rounded-lg',
      buttonShadow: 'shadow-lg shadow-accent-500/10',
      imageFilter: 'brightness-110 contrast-110',
    },
  },
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    description: 'Clean and minimal with subtle shadows',
    thumbnail: 'https://images.pexels.com/photos/7130560/pexels-photo-7130560.jpeg',
    colors: {
      background: 'bg-gray-50',
      text: 'text-gray-900',
      buttonBg: 'bg-white hover:bg-gray-50 border border-gray-200',
      buttonText: 'text-gray-900',
      cardBg: 'bg-white',
    },
    fonts: {
      heading: 'font-sans font-bold',
      body: 'font-sans',
    },
    styles: {
      buttonRadius: 'rounded-xl',
      buttonShadow: 'shadow-sm',
    },
  },
  {
    id: 'gradient-pop',
    name: 'Gradient Pop',
    description: 'Colorful gradients with modern style',
    thumbnail: 'https://images.pexels.com/photos/3109807/pexels-photo-3109807.jpeg',
    colors: {
      background: 'bg-gradient-to-br from-primary-400 via-accent-400 to-secondary-400',
      text: 'text-white',
      buttonBg: 'bg-white/20 hover:bg-white/30 backdrop-blur-sm',
      buttonText: 'text-white',
      cardBg: 'bg-white/10 backdrop-blur-sm',
    },
    fonts: {
      heading: 'font-display',
      body: 'font-sans',
    },
    styles: {
      buttonRadius: 'rounded-full',
      buttonShadow: 'shadow-xl shadow-black/10',
      imageFilter: 'brightness-105 contrast-105',
    },
  },
  {
    id: 'dark-elegance',
    name: 'Dark Elegance',
    description: 'Sophisticated dark theme with gold accents',
    thumbnail: 'https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg',
    colors: {
      background: 'bg-gray-900',
      text: 'text-gray-100',
      buttonBg: 'bg-secondary-500/20 hover:bg-secondary-500/30 border border-secondary-500/30',
      buttonText: 'text-secondary-400',
      cardBg: 'bg-gray-800',
    },
    fonts: {
      heading: 'font-display',
      body: 'font-sans',
    },
    styles: {
      buttonRadius: 'rounded-lg',
      buttonShadow: 'shadow-lg shadow-secondary-500/10',
    },
  },
];