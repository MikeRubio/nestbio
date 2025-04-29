import { motion } from 'framer-motion';
import { useUserStore } from '../../stores/userStore';
import Button from '../../components/common/Button';

export default function AppearancePage() {
  const { profile, isLoading } = useUserStore();
  
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Customize Your Page</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Personalize your profile page appearance
        </p>
      </header>
      
      <div className="card">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium">Profile Settings</h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Page Title
              </label>
              <input
                type="text"
                className="input"
                placeholder="Your page title"
                defaultValue={profile?.title}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                className="input min-h-[100px]"
                placeholder="Tell your visitors about yourself"
                defaultValue={profile?.bio}
              />
            </div>
            
            <div className="flex justify-end">
              <Button variant="primary" isLoading={isLoading}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}