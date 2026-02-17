import { redirect } from "next/navigation";

export default function TrainerRedirect() {
  redirect("/trainer/dashboard");
}
