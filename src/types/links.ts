export type LinkType = 'custom' | 'x' | 'instagram' | 'facebook' | 'youtube' | 'linkedin' | 'github' | 'tiktok';

export interface Link {
  id: string;
  user_id: string;
  title: string;
  url: string;
  icon: string;
  order: number;
  is_active: boolean;
  is_adult_content: boolean;
  link_type: LinkType;
  share_count: number;
  created_at: string;
  updated_at: string;
}

export const SOCIAL_MEDIA_LINKS: Record<Exclude<LinkType, 'custom'>, {
  name: string;
  baseUrl: string;
  placeholder: string;
}> = {
  x: {
    name: 'X (Twitter)',
    baseUrl: 'https://x.com/',
    placeholder: 'username',
  },
  instagram: {
    name: 'Instagram',
    baseUrl: 'https://instagram.com/',
    placeholder: 'username',
  },
  facebook: {
    name: 'Facebook',
    baseUrl: 'https://facebook.com/',
    placeholder: 'username or page',
  },
  youtube: {
    name: 'YouTube',
    baseUrl: 'https://youtube.com/',
    placeholder: '@handle',
  },
  linkedin: {
    name: 'LinkedIn',
    baseUrl: 'https://linkedin.com/in/',
    placeholder: 'username',
  },
  github: {
    name: 'GitHub',
    baseUrl: 'https://github.com/',
    placeholder: 'username',
  },
  tiktok: {
    name: 'TikTok',
    baseUrl: 'https://tiktok.com/@',
    placeholder: 'username',
  },
};