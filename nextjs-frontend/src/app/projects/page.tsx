import Projects from "@/components/projects";

interface Project {
    id: string;
    title: string;
    file: string;
    lastModified: string;
}
async function getProjects(): Promise<Project[]> {
    // Simulate a delay (e.g. network request)
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return [
      {
        id: "projectID1",
        title: "Alpha Audio",
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
      },
      {
        id: "projectID9",
        title: "Untitled Project",
        file: "untitled.mp3",
        lastModified: "02/01/24",
      },
    ];
  }

export default async function ProjectsLoading() {
    
    const projects = await getProjects();
    return <Projects initialProjects={projects} />;
}