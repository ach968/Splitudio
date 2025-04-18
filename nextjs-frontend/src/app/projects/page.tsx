'use client'
import Projects from "@/components/projects";
import { fetchProjects } from "@/lib/utils";
import { useAuth } from "@/components/authContext";
import { Project } from "@/types/firestore";
import { useEffect, useState } from "react";
import Loading from "./loading";
export default function Page() {

  const { user } = useAuth();

  const [projects, setProjects] = useState<Project[] | null>(null);

  useEffect(() => {
    if (!user) return;

    fetchProjects(user).then((res)=>{
      setProjects(res);
    })
  }, [user]);

  if(projects == null) return <Loading></Loading>

  return <Projects initialProjects={projects} />;
}
