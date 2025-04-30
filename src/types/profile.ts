export interface ProfileSettings {
  fullName: string;
  username: string;
  birthday?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  location?: string;
  showViewCount: boolean;
  showLatestPosts: boolean;
  containsSensitiveContent: boolean;
  themeColor: string;
  backgroundColor?: string;
}

export const THEME_COLORS = [
  { id: 'gray', color: '#6B7280' },
  { id: 'red', color: '#EF4444' },
  { id: 'orange', color: '#F97316' },
  { id: 'yellow', color: '#EAB308' },
  { id: 'green', color: '#22C55E' },
  { id: 'blue', color: '#3B82F6' },
  { id: 'purple', color: '#A855F7' },
  { id: 'pink', color: '#EC4899' },
];