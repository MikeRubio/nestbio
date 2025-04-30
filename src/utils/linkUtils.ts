import { Link } from '../types/links';

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

export const groupLinksByCategory = (links: Link[]): Record<string, Link[]> => {
  return links.reduce((acc, link) => {
    const category = link.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(link);
    return acc;
  }, {} as Record<string, Link[]>);
};

export const getDefaultCategories = (): string[] => [
  'Social Media',
  'Content',
  'Other'
];