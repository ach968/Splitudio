import { redirect } from "next/navigation";

export default function Page() {
  // user should never be here
  redirect("/projects")
}