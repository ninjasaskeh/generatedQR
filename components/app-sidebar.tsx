"use client";

import * as React from "react";
import {
  IconDashboard,
  IconQrcode,
  IconGift,
  IconUsers,
  IconScan,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { BrickWallFire, QrCode } from "lucide-react";
import { IconType } from "react-icons";

type NavItem = {
  title: string;
  url: string;
  icon?: IconType;
};

const data: {
  user: { name: string; email: string; avatar: string };
  navMain: NavItem[];
} = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
    { title: "QR Codes", url: "/dashboard/participants", icon: IconQrcode },
    {
      title: "Generate QR",
      url: "/dashboard/participants/add",
      icon: BrickWallFire,
    },
    { title: "Scan Hadir", url: "/dashboard/scan/hadir", icon: IconScan },
    { title: "Scan Souvenir", url: "/dashboard/scan/souvenir", icon: IconGift },
    { title: "User Management", url: "/dashboard/users", icon: IconUsers },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <div className="flex size-7 items-center justify-center rounded-sm border border-secondary-foreground/30">
                  <QrCode className="!size-5" />
                </div>
                <span className="text-base font-semibold">QR Attendance</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
