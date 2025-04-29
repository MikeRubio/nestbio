import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { UserProfile } from '../stores/userStore';
import { Link as LinkType } from '../stores/linkStore';
import Logo from '../components/common/Logo';
import Button from '../components/common/Button';

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!username) {
          setError('Username not provided');
          return;
        }
        
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();
        
        if (profileError) throw profileError;
        
        if (!profileData) {
          setError('Profile not found');
          return;
        }
        
        setProfile(profileData);
        
        // Fetch links
        const { data: linksData, error: linksError } = await supabase
          .from('links')
          .select('*')
          .eq('user_id', profileData.id)
          .eq('is_active', true)
          .order('order', { ascending: true });
        
        if (linksError) throw linksError;
        
        setLinks(linksData || []);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [username]);
  
  const trackClick = async (linkId: string) => {
    try {
      await supabase.from('link_clicks').insert([
        {
          link_id: linkId,
          user_agent: navigator.userAgent,
          referrer: document.referrer,
        },
      ]);
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading profile...</div>
      </div>
    );
  }
  
  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 text-center">
        <Logo size="lg" />
        <h1 className="text-2xl font-bold mt-8 mb-2">Profile Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The profile you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/">
          <Button variant="primary" rightIcon={<ArrowRight size={16} />}>
            Create Your Own Linko
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="p-4 flex justify-between items-center">
        <Logo />
        <Link to="/">
          <Button variant="outline" size="sm">
            Create Your Own
          </Button>
        </Link>
      </header>
      
      <main className="flex-1 flex flex-col items-center max-w-md mx-auto w-full px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto">
            {profile.username.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold mb-2">{profile.title}</h1>
          {profile.bio && (
            <p className="text-gray-600 dark:text-gray-400">{profile.bio}</p>
          )}
        </motion.div>
        
        <div className="w-full space-y-4">
          {links.length > 0 ? (
            links.map((link, index) => (
              <motion.a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick(link.id)}
                className="block w-full p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                <div className="flex items-center justify-center">
                  <span className="font-medium">{link.title}</span>
                  <ExternalLink size={16} className="ml-2 opacity-50" />
                </div>
              </motion.a>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No links available yet.</p>
            </div>
          )}
        </div>
      </main>
      
      <footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Powered by <span className="font-medium">Linko</span>
      </footer>
    </div>
  );
}