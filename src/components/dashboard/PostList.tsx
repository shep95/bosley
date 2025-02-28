import { useState } from "react";
import { PostCard } from "./PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { usePosts } from "@/hooks/usePosts";
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MediaPreviewDialog } from "./MediaPreviewDialog";

export const PostList = () => {
  const session = useSession();
  const queryClient = useQueryClient();
  const { posts, isLoading } = usePosts();
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

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

  if (isLoading) {
    return (
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
    );
  }

  return (
    <>
      <MediaPreviewDialog
        selectedMedia={selectedMedia}
        onClose={() => setSelectedMedia(null)}
      />

      <div className="space-y-6">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
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
          ))
        ) : (
          <div className="text-center py-12 bg-card/50 backdrop-blur-sm rounded-lg border border-muted">
            <h3 className="text-lg font-medium text-foreground mb-2">No posts yet</h3>
            <p className="text-muted-foreground">
              Be the first to share something with your network!
            </p>
          </div>
        )}
      </div>
    </>
  );
};