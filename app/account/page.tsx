import { AppShell } from "@/components/shared/app-shell"
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Account",
};

const AccountPage = () => {
    return (
        <AppShell>
            <section className="w-full">
                {/* <AccountsPage /> */}
            </section>
        </AppShell>
    )
}

export default AccountPage