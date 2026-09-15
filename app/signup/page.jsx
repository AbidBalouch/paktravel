import { redirect } from "next/navigation";
import { getLoginStatus } from "@/lib/auth";
import SignupForm from "./SignupForm";

export default async function SignupPage() {
    const { loggedIn } = await getLoginStatus();
    if (loggedIn) redirect("/");

    return <SignupForm />;
}