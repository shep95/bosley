import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Image, Send, AtSign, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from '@supabase/auth-helpers-react';
import type { Author } from "@/utils/postUtils";

interface CreatePostDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: Author;
  onPostCreated: (newPost: any) => void;
}

export const CreatePostDialog = ({
  isOpen,
  onOpenChange,
  currentUser,
  onPostCreated
}: CreatePostDialogProps) => {
  const [postContent, setPostContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mentionedUser, setMentionedUser] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([]);
  const session = useSession();

  console.log('CreatePostDialog rendered:', { isOpen, currentUser, mediaFiles });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setMediaFiles(prev => [...prev, ...fileArray]);
      
      // Create preview URLs for the new files
      fileArray.forEach(file => {
        const previewUrl = URL.createObjectURL(file);
        setMediaPreviewUrls(prev => [...prev, previewUrl]);
      });
      
      console.log("Files selected:", fileArray);
      toast.success(`${fileArray.length} media file(s) added to post`);
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(mediaPreviewUrls[index]);
    setMediaPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleMentionUser = () => {
    if (mentionedUser) {
      setPostContent((prev) => `${prev} @${mentionedUser} `);
      setMentionedUser("");
      console.log("Mentioned user:", mentionedUser);
    }
  };

  const handleCreatePost = async () => {
    if (!session) {
      toast.error("Please sign in to create a post");
      return;
    }

    if (!postContent.trim() && mediaFiles.length === 0) {
      toast.error("Please add some content or media to your post");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Starting post creation with:", { postContent, mediaFiles });

      const mediaUrls: string[] = [];

      // Upload each media file to Supabase storage
      for (const file of mediaFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${currentUser.id}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('posts')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('posts')
          .getPublicUrl(filePath);

        mediaUrls.push(publicUrl);
      }

      // Create the post in the database
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          content: postContent,
          user_id: currentUser.id,
          media_urls: mediaUrls
        })
        .select('*, profiles:user_id(*)')
        .single();

      if (postError) {
        throw postError;
      }

      console.log("Post created successfully:", post);
      onPostCreated(post);
      
      // Cleanup
      setPostContent("");
      mediaPreviewUrls.forEach(url => URL.revokeObjectURL(url));
      setMediaPreviewUrls([]);
      setMediaFiles([]);
      onOpenChange(false);
      
      toast.success("Post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] bg-card">
        <DialogHeader>
          <DialogTitle>Create a New Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            className="min-h-[120px] bg-background"
          />
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Mention a user"
              value={mentionedUser}
              onChange={(e) => setMentionedUser(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleMentionUser}
              className="shrink-0"
            >
              <AtSign className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2 items-center">
            <Input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="media-upload"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById("media-upload")?.click()}
              className="gap-2"
            >
              <Image className="h-4 w-4" />
              Add Media
            </Button>
            {mediaFiles.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {mediaFiles.length} file(s) selected
              </span>
            )}
          </div>
          
          {/* Media Previews */}
          {mediaPreviewUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {mediaPreviewUrls.map((url, index) => (
                <div key={url} className="relative">
                  {mediaFiles[index]?.type.startsWith('video/') ? (
                    <video 
                      src={url} 
                      className="w-full h-32 object-cover rounded-md"
                      controls
                    />
                  ) : (
                    <img 
                      src={url} 
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => removeMedia(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <Button 
            onClick={handleCreatePost} 
            className="w-full gap-2"
            disabled={isSubmitting}
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? 'Creating...' : 'Create Post'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};