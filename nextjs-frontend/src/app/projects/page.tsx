"use client"

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import EditorNav from "@/components/editor-nav"
import SearchSVG from "@/assets/search"
import PlaySVG from "@/assets/play"
import { useState } from "react";
import { twMerge } from "tailwind-merge"

export default function Projects() {

    const projects = [
        {
            id: "projectID1",
            title: "Untitled Project Alpha",
            file: "alpha.mp3",
            lastModified: "01/15/24",
          },
          {
            id: "projectID2",
            title: "Beta Beats",
            file: "beta.mp3",
            lastModified: "02/01/24",
          },
          {
            id: "projectID3",
            title: "Gamma Grooves",
            file: "gamma.mp3",
            lastModified: "01/28/24",
          },
          {
            id: "projectID4",
            title: "Delta Dreams",
            file: "delta.mp3",
            lastModified: "02/05/24",
          },
          {
            id: "projectID5",
            title: "Epsilon Echoes",
            file: "epsilon.mp3",
            lastModified: "01/30/24",
          },
          {
            id: "projectID6",
            title: "Zeta Zone",
            file: "zeta.mp3",
            lastModified: "02/12/24",
          },
          {
            id: "projectID7",
            title: "Eta Energy",
            file: "eta.mp3",
            lastModified: "01/20/24",
          },
          {
            id: "projectID8",
            title: "Theta Tunes",
            file: "theta.mp3",
            lastModified: "02/08/24",
          }
    ]

    const [searchQuery, setSearchQuery] = useState("");

    const [alphabeticalDown, setAlphabeticalDown] = useState<boolean | null>(null);
    const [dateDown, setDateDown] = useState<boolean | null>(true);

    const filteredProjects = projects.filter((project) => {
        const lowerQuery = searchQuery.toLowerCase();
        return (
          project.title.toLowerCase().includes(lowerQuery) ||
          project.file.toLowerCase().includes(lowerQuery)
        );
      });
    
      // Create a sorted copy based on the active sort:
      // If dateDown is not null, sort by lastModified.
      // Else if alphabeticalDown is not null, sort by title.
      let sortedProjects = [...filteredProjects];
      if (dateDown !== null) {
        sortedProjects.sort((a, b) => {
          const dateA = new Date(a.lastModified);
          const dateB = new Date(b.lastModified);
          // If dateDown is true, sort descending (newest first), yes it's counter intuitive but that's how UI works.
          return dateDown ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime()
        });
      } else if (alphabeticalDown !== null) {
        sortedProjects.sort((a, b) => {
          return alphabeticalDown
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        });
      }

    return <section>
            <div className="w-screen flex min-h-screen bg-black">
                <div className="flex flex-col w-full h-full">
                    <EditorNav />
                    <div className="flex justify-center w-full mt-28">
                        <div className="container lg:px-5 px-3">
                            <div className="w-full flex justify-end pb-3">
                                <span className="relative w-[300px] flex flex-row items-center">
                                    <SearchSVG className="h-5 w-5 absolute left-2"></SearchSVG>
                                    <Input className="pl-9 border-neutral-500 text-white"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </span>
                            </div>
                            
                            <Table className="text-base">
                                <TableCaption>
                                    <p className="text-neutral-500">
                                        {projects.length > 0 ? "A list of your projects." : "You don't have any projects, click 'Editor' to get started!"}
                                    </p>
                                </TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <div className="flex flex-row gap-2 items-center justify-between pt-3 pb-3">
                                                <span onClick={() => {
                                                    setDateDown(null);
                                                    setAlphabeticalDown((prev) =>
                                                    prev === null ? true : !prev
                                                );}}
                                                className="flex flex-row gap-2 items-center select-none">
                                                    <p className="text-white">Name</p>
                                                    <PlaySVG
                                                    className={twMerge("w-3 h-3 transition-all opacity-50",
                                                        alphabeticalDown === null
                                                            ? "opacity-0"
                                                            : alphabeticalDown
                                                            ? "rotate-90"
                                                            : "rotate-[270deg]"
                                                        )}
                                                    />
                                                </span>
                                                <span onClick={() => {
                                                    setAlphabeticalDown(null);
                                                    setDateDown((prev) =>
                                                    prev === null ? true : !prev
                                                    );
                                                }}
                                                className="flex flex-row gap-2 items-center select-none">
                                                    <p className="text-white">Last Modified</p>
                                                    <PlaySVG
                                                    className={twMerge("w-3 h-3 transition-all opacity-50", 
                                                        dateDown === null
                                                            ? "opacity-0"
                                                            : dateDown
                                                            ? "rotate-90"
                                                            : "rotate-[270deg]"
                                                    )}
                                                    />
                                                </span>
                                            </div>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedProjects.map((project) => (
                                    <TableRow key={project.id} className="hover:bg-white/15">
                                        <Link className="flex justify-between pt-3 pb-3" href={`/editor/${project.id}`} >
                                            <TableCell>
                                                <span className="flex gap-3 items-baseline">
                                                    <p className="line-clamp-1">{project.title}</p>
                                                    <p className="text-neutral-400 text-sm line-clamp-1">
                                                        / {project.file}
                                                    </p>
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-neutral-400 text-sm line-clamp-1">
                                                    {new Date(project.lastModified).toDateString()}
                                                </p>
                                            </TableCell>
                                        </Link>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </section>
}