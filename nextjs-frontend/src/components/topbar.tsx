"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./authContext";
import { twMerge } from "tailwind-merge";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, navigationMenuTriggerStyle } from "./ui/navigation-menu";
import { NavigationMenuList } from "@radix-ui/react-navigation-menu";
import Logo from "@/components/logo";
import ProfileSVG from "@/assets/profile-svg";
import { Button } from "./ui/button";
import LogoutSVG from "@/assets/logout-svg";

export default function Topbar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const privateNavigation = [
    { name: "Projects", href: "/projects" },
    { name: "Editor", href: "/editor" },
  ];

  return (
    <nav className="bg-black/50 backdrop-blur-md h-[80px] z-[999] justify-center items-center w-screen flex fixed top-0">
      <div className="flex flex-row w-full container items-center justify-between px-6 text-sm">
        <div className="flex flex-row items-center gap-5 text-neutral-400 underline-offset-4">
          <Link 
          href="/"
          className="relative flex items-center justify-center w-[50px] h-[50px]">
            <div className="scale-[0.2]">
              <Logo />
            </div>
          </Link>
          <Link href="/pricing">
            <p
              className={twMerge(
                pathname === "/projects" && "text-white",
                "hover:cursor-pointer hover:text-white hover:underline"
              )}
            >
              Pricing
            </p>
          </Link>
        </div>
        

        
            {user==null ?
            <NavigationMenu>
            <NavigationMenuList className="flex flex-row gap-1">
              <NavigationMenuItem>
                <Link href="/signup" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={twMerge(navigationMenuTriggerStyle(), "px-2 sm:px-3")}
                  >
                    <p className="text-sm">Signup</p>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/login" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={twMerge(navigationMenuTriggerStyle(), "px-2 sm:px-3")}
                  >
                    <p className="text-sm">Login</p>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
            </NavigationMenu>
            :
            <div className="flex gap-1">
              <Link href="/projects" legacyBehavior passHref>
                <Button
                variant={pathname.endsWith("/profile") ? "secondary" : "ghost"}
                className="bg-black text-white border border-white hover:bg-white">
                  <p className="text-sm">
                    <span className="hidden sm:inline">Enter&nbsp;</span>
                    Studio
                  </p>
                </Button>
              </Link>
                
              <Link href="/profile" legacyBehavior passHref>
                <Button 
                variant={pathname.endsWith("/profile") ? "secondary" : "ghost"} className="group p-2">
                  <p className="hidden sm:block">Profile</p>
                  {
                    user?.photoURL ?
                    <img className="w-6 h-6 rounded-full object-cover group-hover:brightness-90 transition-all" src={user.photoURL} alt="user photo"></img> 
                    :
                    <ProfileSVG className={twMerge("group-hover:invert", pathname.endsWith("/profile") && "invert", "h-6 w-6")}></ProfileSVG>
                  }
                </Button>
              </Link>

              <Link href="/logout" legacyBehavior passHref>
                <Button variant="ghost" className="group p-2">
                  <LogoutSVG className="group-hover:invert"></LogoutSVG>
                </Button>
              </Link>
            </div>
          }
      </div>
    </nav>
  );
}
