'use client'
import Projects from "@/components/projects";
import { fetchProjects } from "@/lib/utils";
import { useAuth } from "@/components/authContext";
import { Project } from "@/types/firestore";

async function getProjects(): Promise<Project[]> {
  const { user, uid } = useAuth();
  const projects = await fetchProjects(user!);
  return projects.map((project) => ({
    pid: project.pid,
    uid: uid || null,
    pName: project.pName,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    collaboratorIds: project.collaboratorIds,
    coverImage: project.coverImage,
    isPublic: project.isPublic,
  }));
}

export default async function Page() {
  const projects = await getProjects();
  return <Projects initialProjects={projects} />;
}
