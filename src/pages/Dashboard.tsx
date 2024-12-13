import { useState } from "react";
import { PostCard } from "@/components/dashboard/PostCard";
import { MediaPreviewDialog } from "@/components/dashboard/MediaPreviewDialog";
import { useSession } from '@supabase/auth-helpers-react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Image, Video, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface PostWithProfile {
  id: string;
  content: string;
  created_at: string;
  media_urls: string[];
  user_id: string;
  likes: number;
  reposts: number;
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  post_likes: { id: string }[];
  bookmarks: { id: string }[];
  comments: { id: string }[];
}

const Dashboard = () => {
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const session = useSession();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      console.log('Fetching all posts...');
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            id,
            username,
            avatar_url
          ),
          post_likes (
            id
          ),
          bookmarks (
            id
          ),
          comments (
            id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        toast.error('Failed to load posts');
        throw error;
      }

      console.log('Posts fetched:', data);
      return data as PostWithProfile[];
    }
  });

  const handlePostAction = async (postId: string, action: 'like' | 'bookmark' | 'delete' | 'repost') => {
    try {
      if (action === 'delete') {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', postId);

        if (error) throw error;
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        toast.success('Post deleted successfully');
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(`Failed to ${action} post`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MediaPreviewDialog
        selectedMedia={selectedMedia}
        onClose={() => setSelectedMedia(null)}
      />

      <div className="flex justify-center">
        <main className="w-full max-w-3xl px-4 py-6 md:py-8 md:pl-24 animate-fade-in">
          <h1 className="text-3xl font-bold mb-8 text-foreground">Home</h1>
          
          {isMobile && (
            <div className="fixed bottom-20 right-4 z-50 space-y-3">
              <Button
                size="icon"
                className="w-12 h-12 rounded-lg bg-accent hover:bg-accent/90 shadow-lg"
                onClick={() => toast.info('Create post coming soon')}
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
          
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 rounded-lg border border-muted bg-card/50 backdrop-blur-sm space-y-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-24 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={{
                    ...post,
                    author: {
                      id: post.profiles.id,
                      username: post.profiles.username,
                      avatar_url: post.profiles.avatar_url,
                      name: post.profiles.username
                    },
                    timestamp: new Date(post.created_at),
                    comments: post.comments?.length || 0,
                    isLiked: post.post_likes?.some(like => like.id) || false,
                    isBookmarked: post.bookmarks?.some(bookmark => bookmark.id) || false
                  }}
                  currentUserId={session?.user?.id || ''}
                  onPostAction={handlePostAction}
                  onMediaClick={setSelectedMedia}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card/50 backdrop-blur-sm rounded-lg border border-muted">
              <h3 className="text-lg font-medium text-foreground mb-2">No posts yet</h3>
              <p className="text-muted-foreground">
                Be the first to share something with your network!
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;