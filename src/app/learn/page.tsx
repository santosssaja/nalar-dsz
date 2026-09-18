import { redirect } from "next/navigation";

export default function LearnIndexPage() {
  // Gracefully redirect to the primary foundation module
  redirect("/modules/fondasi-matematika");
}
