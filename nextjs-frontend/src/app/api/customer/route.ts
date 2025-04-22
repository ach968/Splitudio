import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { redirect } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";

// Setting up Customer record when a user is created
export async function GET(req: NextRequest) {
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

  if(!decoded) redirect("/login");

  try{
    const customerRef = await adminDb.doc(`customers/${decoded.uid}`);
    const customer = (await customerRef.get()).data();
    
    if(!customer) return NextResponse.json({ error: "No customer record found" }, { status: 401 });

    return NextResponse.json({ customer }, { status: 200 })
  }
  catch {
    return NextResponse.json({ error: "No customer record found" }, { status: 401 });
  }
  
  
}

export async function POST(req: NextRequest) {
  const { idToken } = await req.json();

  if (!idToken) {
    return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const customerRef = adminDb.doc(`customers/${uid}`);
    const customerSnap = await customerRef.get();

    if (!customerSnap.exists) {
      const newCustomer = {
        uid,
        stripeCustomerId: "",
        subscriptionStatus: "active",
        apiUsage: 0,
      };

      await customerRef.set(newCustomer);
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error creating customer record:", err);
    return NextResponse.json({ error: "Unauthorized or internal error" }, { status: 401 });
  }
}