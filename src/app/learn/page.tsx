import { redirect } from "next/navigation";

export default function LearnIndexPage() {
  // Gracefully redirect to personal learning dashboard
  redirect("/dashboard");
}
