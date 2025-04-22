import Projects from "@/components/projects";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { Project } from "@/types/firestore";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


export default async function Page() {


  const token = ((await cookies()).get("session")?.value);
  if (!token) {
    return redirect("/login");
  }

  let decoded: { uid: string };
  try {
    decoded = await adminAuth.verifySessionCookie(token);
  } catch (e) {
    return redirect("/login");
  }

  const snapshot = await adminDb.collection("projects").where("uid", "==", decoded.uid).get();

  const projects = snapshot.docs.map((doc)=>{
    const data = doc.data();
    return {
      pid: doc.id,
      ...data,
      createdAt: data!.createdAt?.toDate?.() ?? null,
      updatedAt: data!.updatedAt?.toDate?.() ?? null,
    } as Project;
  });

  return <Projects initialProjects={projects} />;
}
