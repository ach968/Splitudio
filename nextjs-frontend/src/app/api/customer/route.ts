import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { type NextRequest, NextResponse } from "next/server";

// Setting up Customer record when a user is created
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
        subscriptionStatus: "none",
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