import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useParams } from "react-router-dom";
import { PostsTab } from "./tabs/PostsTab";
import { RepliesTab } from "./tabs/RepliesTab";
import { MediaTab } from "./tabs/MediaTab";
import { VideosTab } from "./tabs/VideosTab";
import { LikesTab } from "./tabs/LikesTab";
import { AnalyticsTab } from "./tabs/AnalyticsTab";
import { useSession } from "@supabase/auth-helpers-react";

export const ProfileTabs = () => {
  const { userId } = useParams();
  const session = useSession();
  const isCurrentUser = session?.user?.id === userId;

  if (!userId) {
    return null;
  }

  const tabs = [
    { value: "posts", label: "Posts" },
    { value: "replies", label: "Replies" },
    { value: "media", label: "Media" },
    { value: "videos", label: "Videos" },
    { value: "likes", label: "Likes" },
  ];

  // Only show analytics tab for the current user's profile
  if (isCurrentUser) {
    tabs.push({ value: "analytics", label: "Analytics" });
  }

  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="w-full justify-start rounded-none border-b bg-transparent">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-accent hover:text-accent transition-colors duration-300 capitalize"
            )}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="posts" className="min-h-[400px]">
        <PostsTab userId={userId} />
      </TabsContent>

      <TabsContent value="replies" className="min-h-[400px]">
        <RepliesTab userId={userId} />
      </TabsContent>

      <TabsContent value="media" className="min-h-[400px]">
        <MediaTab userId={userId} />
      </TabsContent>

      <TabsContent value="videos" className="min-h-[400px]">
        <VideosTab userId={userId} />
      </TabsContent>

      <TabsContent value="likes" className="min-h-[400px]">
        <LikesTab userId={userId} />
      </TabsContent>

      {isCurrentUser && (
        <TabsContent value="analytics" className="min-h-[400px]">
          <AnalyticsTab userId={userId} />
        </TabsContent>
      )}
    </Tabs>
  );
};