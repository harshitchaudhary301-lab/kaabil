import { redirect } from "next/navigation";

export default function StudentRoadmapRedirect() {
  redirect("/student/dashboard#roadmap");
}
