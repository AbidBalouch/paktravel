import { redirect } from "next/navigation";
import { getLoginStatus } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
    const { loggedIn } = await getLoginStatus();
    if (loggedIn) redirect("/");

    return <LoginForm />;
}