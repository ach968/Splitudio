"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "./authContext";
import { twMerge } from "tailwind-merge";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, navigationMenuTriggerStyle } from "./ui/navigation-menu";
import { NavigationMenuList } from "@radix-ui/react-navigation-menu";
import Logo from "@/components/logo";
import { ClassNames } from "@emotion/react";

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
          <Link href="/about">
            <p
              className={twMerge(
                pathname === "/projects" && "text-white",
                "hover:cursor-pointer hover:text-white hover:underline"
              )}
            >
              About
            </p>
          </Link>
        </div>
        

        <NavigationMenu>
            {user==null ?
            <NavigationMenuList className="flex flex-row gap-1">
              <NavigationMenuItem>
                <Link href="/signup" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={navigationMenuTriggerStyle()}
                  >
                    <p className="text-sm">Signup</p>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
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
            :
            <NavigationMenuList className="flex flex-row gap-1">
              <NavigationMenuItem>
                <Link href="/projects" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={twMerge(
                      navigationMenuTriggerStyle(),
                      "bg-black text-white border border-white hover:bg-white hover:scale-[1.03] transition-all"
                    )}
                  >
                    <p className="text-sm">Enter Studio</p>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
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
