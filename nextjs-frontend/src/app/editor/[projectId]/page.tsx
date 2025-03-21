import Editor from "@/components/editor";
async function getProjects() {
    // Simulate a delay (e.g. network request)
    await new Promise((resolve) => setTimeout(resolve, 10000));
}

export default async function Page() {
    
    const projects = await getProjects();
    return <Editor />;
}