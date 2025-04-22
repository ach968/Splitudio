import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { Project } from "@/types/firestore";

export async function POST(req: NextRequest) {
  
  const { pid } = await req.json();

  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.json({ error: "Missing session" }, { status: 400 });
  }

  let decoded;
  try {
    decoded = await adminAuth.verifySessionCookie(token);
  } catch (e) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // If no pid, fetch all projects from the user
  if( !pid ) {
    try {
      const snapshot = await adminDb.collection("projects").where("uid", "==", decoded.uid).get();
    
      const projects = snapshot.docs.map(doc=>({
        pid: doc.id,
        ...doc.data()
      }))
    
        return NextResponse.json({ projects: projects });
      } catch (err: any) {
        console.error("Error fetching projects:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
  }
  // Else, get the project, validate ownership, and return
  else {
    try{
      const snap = await adminDb.doc(`/projects/${pid}`).get();
      const project: Project = await snap.data() as Project;

      if(decoded.uid != project.uid)
        return NextResponse.json({error: "Unauthorized"}, { status: 401 })

      return NextResponse.json({ project: project })     
    }
    catch(err: any) {
      console.error("Error fetching project:", err);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
}
