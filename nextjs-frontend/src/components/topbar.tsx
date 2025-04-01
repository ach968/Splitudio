"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "./authContext";
import { twMerge } from "tailwind-merge";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, navigationMenuTriggerStyle } from "./ui/navigation-menu";
import { NavigationMenuList } from "@radix-ui/react-navigation-menu";

export default function Topbar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const privateNavigation = [
    { name: "Projects", href: "/projects" },
    { name: "Editor", href: "/editor" },
  ];

  return (
    <nav className="bg-black/50 backdrop-blur-md h-[70px] z-[999] justify-center items-center w-screen flex fixed top-0">
      <div className="flex flex-row w-full container items-baseline justify-between px-6 text-sm">
        <div className="flex gap-5 text-neutral-400 underline-offset-4">
          
          
          <Link href="/projects">
            <p
              className={twMerge(
                pathname === "/projects" && "text-white",
                "hover:cursor-pointer hover:text-white hover:underline"
              )}
            >
              Projects
            </p>
          </Link>
          <Link href="/editor">
            <p
              className={twMerge(
                pathname.startsWith("/editor") && "text-white",
                "hover:cursor-pointer hover:text-white hover:underline"
              )}
            >
              Editor
            </p>
          </Link>
        </div>


        <NavigationMenu>
          
            {user==null ?
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/login" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={navigationMenuTriggerStyle()}
                  >
                    <p className="text-sm">Login</p>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
            :<NavigationMenuList className="flex flex-row">
              <NavigationMenuItem>
                <Link href="/profile" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={twMerge(
                      navigationMenuTriggerStyle(),
                      pathname.startsWith("/profile") &&
                        "bg-white text-black hover:bg-white/80"
                    )}
                  >
                    <p className="text-sm">Profile</p>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/logout" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={navigationMenuTriggerStyle()}
                  >
                    <p className="text-sm">Logout</p>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
            }
        </NavigationMenu>
      </div>
    </nav>
  );
}
