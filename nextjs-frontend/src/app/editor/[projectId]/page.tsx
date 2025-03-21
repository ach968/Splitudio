import Editor from "@/components/editor";
async function getProjects() {
    // Simulate a delay (e.g. network request)
    await new Promise((resolve) => setTimeout(resolve, 5000));
}

export default async function Page() {
    
    const projects = await getProjects();
    return <Editor />;
}