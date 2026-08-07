import { redirect } from "next/navigation";

export default function OpportunitySignupPage() {
  redirect("/register?role=volunteer");
}
