import { redirect } from "next/navigation";

/** Legacy URL — learning hub is at /learning (Fedora / LF style). */
export default function LearnPage() {
  redirect("/learning");
}
