import { useState } from "react";
import { useSession } from '@supabase/auth-helpers-react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Image, Video, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { CreatePostDialog } from "@/components/dashboard/CreatePostDialog";
import { PostList } from "@/components/dashboard/PostList";
import { Author } from "@/utils/postUtils";

const Dashboard = () => {
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const session = useSession();
  const isMobile = useIsMobile();

  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', session.user.id)
        .single();

      if (error) {
        toast.error('Error loading profile');
        return null;
      }

      return data;
    },
    enabled: !!session?.user?.id
  });

  const currentUser: Author = {
    id: session?.user?.id || '',
    username: profile?.username || '',
    avatar_url: profile?.avatar_url || '',
    name: profile?.username || ''
  };

  const handlePostCreated = () => {
    setIsCreatingPost(false);
    toast.success('Post created successfully!');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex justify-center">
        <main className="w-full max-w-3xl px-4 py-6 md:py-8 md:pl-24 animate-fade-in">
          <h1 className="text-3xl font-bold mb-8 text-foreground">Home</h1>
          
          {isMobile && (
            <div className="fixed bottom-20 right-4 z-50 space-y-3">
              <Button
                size="icon"
                className="w-12 h-12 rounded-lg bg-accent hover:bg-accent/90 shadow-lg"
                onClick={() => setIsCreatingPost(true)}
              >
                <Plus className="h-6 w-6 text-white" />
              </Button>
              <Button
                size="icon"
                className="w-12 h-12 rounded-lg bg-accent hover:bg-accent/90 shadow-lg"
                onClick={() => toast.info('Upload video coming soon')}
              >
                <Video className="h-6 w-6 text-white" />
              </Button>
              <Button
                size="icon"
                className="w-12 h-12 rounded-lg bg-accent hover:bg-accent/90 shadow-lg"
                onClick={() => toast.info('Upload image coming soon')}
              >
                <Image className="h-6 w-6 text-white" />
              </Button>
            </div>
          )}
          
          <PostList />
        </main>
      </div>

      <CreatePostDialog
        isOpen={isCreatingPost}
        onOpenChange={setIsCreatingPost}
        currentUser={currentUser}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default Dashboard;