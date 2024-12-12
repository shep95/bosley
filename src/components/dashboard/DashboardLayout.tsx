import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

const DashboardLayout = () => {
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar setIsCreatingPost={setIsCreatingPost} />
      <div className="md:pl-64 min-h-screen">
        <main className="min-h-screen pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
};

export default DashboardLayout;