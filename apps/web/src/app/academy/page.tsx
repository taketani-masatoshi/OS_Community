import { redirect } from "next/navigation";

/** Academy catalog is merged into the Learning hub. */
export default function AcademyHomePage() {
  redirect("/learning#curriculum");
}
