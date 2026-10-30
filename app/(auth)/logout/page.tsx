import { Logout } from "@/components/auth/logout";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Logout",
};

export default function LogoutPage() {
    return <Logout />
}