import Editor from "@/components/editor";
import { redirect } from "next/navigation";
async function getProject() {
  // Simulate a delay (e.g. network request)
  await new Promise((resolve) => setTimeout(resolve, 5000));
}

export default async function Page() {
  const project = await getProject();

  // redirect("/projects")

  return <Editor />;
}
