"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import SearchSVG from "@/assets/search";
import PlaySVG from "@/assets/play";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import Footer from "@/components/footer";
import { motion } from "motion/react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import Share from "./share-dialog-header";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import EnterSVG from "@/assets/enter";
import { Button } from "./ui/button";
import EditorNav from "./editor-nav";
import { Project } from "@/types/firestore";
import { FieldValue, Timestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { storeProject } from "@/lib/utils";

export default function Projects({
  initialProjects,
}: {
  initialProjects: Project[];
}) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");

  const [alphabeticalDown, setAlphabeticalDown] = useState<boolean | null>(null);
  const [dateDown, setDateDown] = useState<boolean | null>(true);

  const [renaming, setRenaming] = useState<string | null>(null); // set to project-id while renaming
  const [newName, setNewName] = useState<string>(""); // holds new name for project

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Only plays framer animations once
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const filteredProjects = projects.filter((project: Project) => {
    const lowerQuery = searchQuery.toLowerCase();
    
    if(project.pName == undefined) return true;

    return (
      project.pName.toLowerCase().includes(lowerQuery) ||
      project.fileName.toLowerCase().includes(lowerQuery)
    );
  });

  // used to autofocus rename Input field because react DOM is stupid
  const inputElement = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (renaming && inputElement.current != null) {
      setTimeout(() => {
        inputElement.current?.focus();
      }, 300);
    }
  }, [renaming]);

  const toMillis = (d?: Timestamp | Date | FieldValue) => {
    if (!d || d instanceof FieldValue) return 0;                       // handle null / undefined
    return d instanceof Date ? d.getTime()  // plain Date
                             : d.toMillis(); // Firestore Timestamp
  };
  
  // Create a sorted copy based on the active sort:
  // If dateDown is not null, sort by updatedAt.
  // Else if alphabeticalDown is not null, sort by pName.
  const sortedProjects = [...filteredProjects];
  if (dateDown !== null) {
    sortedProjects.sort((a, b) => {
      const dateA = new Date(toMillis(a.updatedAt));
      const dateB = new Date(toMillis(a.updatedAt));
      // If dateDown is true, sort descending (newest first), yes it's counter intuitive but that's how UI works.
      return dateDown
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });
  } else if (alphabeticalDown !== null) {
    sortedProjects.sort((a, b) => {
      return alphabeticalDown
        ? a.pName.localeCompare(b.pName)
        : b.pName.localeCompare(a.pName);
    });
  }

  const handleRenameSubmit = (projectId: string) => {
    try {

      if (newName.trim() == "") {
        throw new Error();
      }

      // update dummy list
      setProjects((prevProjects) =>
        prevProjects!.map((project) =>
          project.pid === projectId ? { ...project, pName: newName } : project
        )
      );

      projects.forEach((p)=>{
        if(p.pid === projectId) {
          const toUpdate: Project = {...p};
          toUpdate.pName = newName
          storeProject(toUpdate)
        }
          
      })

    } catch (error) {
      toast({title: "Error", description: "Could not rename project"})
    } finally {
      setRenaming(null);
      setNewName("");
    }
  };

  function handleDeleteProject(p: Project) {
    setProjects((prev)=>prev.filter((proj) => proj.pid !== p.pid))

    fetch("/api/delete_project", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pid: p.pid }),
    }).catch((err)=>{
      setProjects((prev)=>[...prev, p])
      toast({
        title: "ERROR: Could not delete project.",
        description: err
      });
    })
  }

  return (
    <section>
      <EditorNav />
      
      <div className="flex flex-col w-full min-h-screen bg-black">
        <div className="flex flex-col h-full">
          <div className="flex justify-center w-full mt-20">
            <div className="container lg:px-5 px-3">
              <div className="w-full flex md:justify-end justify-between pb-3 gap-3">
                <motion.div
                  initial={hasMounted ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 2 }}
                  className="relative flex items-center"
                >
                  <Button className="w-[120px] text-sm" variant="secondary">
                    <Link href={"/editor"}>+ New Project</Link>
                  </Button>
                </motion.div>

                <motion.div
                  initial={hasMounted ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 2 }}
                  className="relative w-[200px] flex flex-row items-center"
                >
                  <SearchSVG className="h-5 w-5 absolute left-2"></SearchSVG>
                  <Input
                    className="pl-9 border-neutral-500 text-white focus-visible:border-white"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </motion.div>
              </div>


              <Table className="text-base">
                <TableCaption>
                  <p className="text-neutral-500">
                    {projects.length > 0
                      ? "A list of your projects."
                      : "You don't have any projects, click 'Editor' to get started!"}
                  </p>
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <div className="flex flex-row gap-2 items-center justify-between pt-3 pb-3">
                        <motion.span
                          initial={hasMounted ? false : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 2 }}
                          onClick={() => {
                            setDateDown(null);
                            setAlphabeticalDown((prev) =>
                              prev === null ? true : !prev
                            );
                          }}
                          className="flex flex-row gap-2 items-center select-none hover:cursor-pointer"
                        >
                          <p className="text-white">Name</p>
                          <PlaySVG
                            className={twMerge(
                              "w-3 h-3 transition-all opacity-50",
                              alphabeticalDown === null
                                ? "opacity-0"
                                : alphabeticalDown
                                ? "rotate-90"
                                : "rotate-[270deg]"
                            )}
                          />
                        </motion.span>
                        <motion.span
                          initial={hasMounted ? false : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 2 }}
                          onClick={() => {
                            setAlphabeticalDown(null);
                            setDateDown((prev) =>
                              prev === null ? true : !prev
                            );
                          }}
                          className="flex flex-row gap-2 items-center select-none hover:cursor-pointer"
                        >
                          <p className="text-white">Last Modified</p>
                          <PlaySVG
                            className={twMerge(
                              "w-3 h-3 transition-all opacity-50",
                              dateDown === null
                                ? "opacity-0"
                                : dateDown
                                ? "rotate-90"
                                : "rotate-[270deg]"
                            )}
                          />
                        </motion.span>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProjects.map((project, idx) => (
                    <TableRow
                      onClick={(e) => {
                        // Cancel out when user clicks off
                        if (
                          !(e.target instanceof HTMLInputElement) &&
                          !(e.target instanceof HTMLButtonElement) &&
                          renaming != null
                        ) {
                          setRenaming(null);
                          setNewName("");
                        }
                      }}
                      key={project.pid}
                      className="hover:bg-white/15 select-none"
                    >
                      <ContextMenu >
                        <ContextMenuTrigger>
                          {renaming !== project.pid ? (
                            <Link
                              className="flex justify-between pt-3 pb-3"
                              href={
                                renaming == null
                                  ? `/editor/${project.pid}`
                                  : "/projects"
                              } // clicking only redirects if not editing name
                              onClick={() => {
                                setRenaming(null);
                                setNewName("");
                              }}
                            >
                              <TableCell>
                                <motion.span
                                  initial={hasMounted ? false : { opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{
                                    duration: 1,
                                    delay: (1 / sortedProjects.length) * idx,
                                  }}
                                  className="flex gap-3 items-baseline"
                                >
                                  <p className="line-clamp-1">
                                    {project.pName}
                                  </p>
                                  <p className="text-neutral-400 text-sm line-clamp-1">
                                    / {project.fileName}
                                  </p>
                                </motion.span>
                              </TableCell>
                              <TableCell>
                                <motion.p
                                  initial={hasMounted ? false : { opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{
                                    duration: 1,
                                    delay: (1 / sortedProjects.length) * idx,
                                  }}
                                  className="text-neutral-400 text-sm line-clamp-1"
                                >
                                  {new Date(
                                    toMillis(project.updatedAt)
                                  ).toDateString()}
                                </motion.p>
                              </TableCell>
                            </Link>
                          ) : (
                            <div className="flex justify-between pt-3 pb-3">
                              <TableCell>
                                <span className="flex gap-3 items-baseline">
                                  <div className="relative flex items-center">
                                    <Input
                                      ref={inputElement}
                                      className="border border-white w-[200px] text-white pr-10"
                                      autoFocus
                                      value={newName}
                                      onChange={(e) =>
                                        setNewName(e.target.value)
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          handleRenameSubmit(project.pid);
                                        }
                                      }}
                                    />
                                    <Button
                                      className=" absolute right-1 w-7 h-7 group"
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) =>
                                        handleRenameSubmit(project.pid)
                                      }
                                    >
                                      <EnterSVG className="group-hover:invert"></EnterSVG>
                                    </Button>
                                  </div>

                                  <p className="text-neutral-400 text-sm line-clamp-1">
                                    / {project.fileName}
                                  </p>
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center h-full">
                                  <p className="text-neutral-400 text-sm line-clamp-1">
                                    {new Date(
                                      toMillis(project.updatedAt)
                                    ).toDateString()}
                                  </p>
                                </div>
                              </TableCell>
                            </div>
                          )}
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem
                            onClick={() => {
                              setRenaming(project.pid);
                              setNewName(project.pName);
                            }}
                          >
                            <p className="flex w-full h-full hover:cursor-pointer">
                              Rename
                            </p>
                          </ContextMenuItem>

                          <Dialog>
                            <ContextMenuItem>
                              <DialogTrigger
                                className="w-full h-full text-start"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <p className="w-full h-full hover:cursor-pointer text-black">
                                  Share
                                </p>
                              </DialogTrigger>
                            </ContextMenuItem>
                            <DialogContent>
                              <Share
                                projectId={project.pid}
                                projectName={project.pName}
                              />
                            </DialogContent>
                          </Dialog>

                          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                            <ContextMenuItem>
                              <DialogTrigger
                              className="w-full h-full text-start"
                              onClick={(e) => e.stopPropagation()}>
                                <p className="flex w-full h-full hover:cursor-pointer">
                                  Delete
                                </p>
                              </DialogTrigger>
                                
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete "{project.pName}"</DialogTitle>
                                  <DialogDescription>
                                    <div className="flex flex-col gap-5">
                                      This action cannot be undone. This will permanently delete your account
                                      and remove your data from our servers.
                                      <Button
                                      className="w-[100px]"
                                      variant="destructive"
                                      onClick={()=>{
                                        handleDeleteProject(project)
                                        setDeleteDialogOpen(false);
                                      }}>
                                        DELETE
                                      </Button>
                                    </div>
                                    
                                  </DialogDescription>
                                </DialogHeader>
                              </DialogContent>                           
                          </ContextMenuItem>
                          </Dialog>
                        </ContextMenuContent>
                      </ContextMenu>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
      <Footer></Footer>
    </section>
  );
}
