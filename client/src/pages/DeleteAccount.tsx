import { Button } from "@/components/ui/button";
import { ShieldCheck, Trash2 } from "lucide-react";
import { useLocation } from "wouter";

export default function DeleteAccount() {
  const [, navigate] = useLocation();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen max-w-2xl items-center px-4 py-12">
        <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-10">
          <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <Trash2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">Lumae account privacy</p>
          <h1 className="text-3xl font-semibold tracking-tight">Delete your Lumae account</h1>
          <p className="mt-4 leading-7 text-muted-foreground">
            You can permanently delete your Lumae account and associated account data from the web. This removes your saved content, connected social accounts, security authenticators, trusted devices, and business contacts. Any data we must retain for legal obligations is handled as described in our Privacy Policy.
          </p>
          <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
            <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-500" aria-hidden="true" />
              Protecting your account
            </div>
            Sign in first. Then open <strong>Account → Settings</strong>, select the <strong>Account</strong> tab, and choose <strong>Delete account</strong>. You will be asked to confirm the irreversible action.
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => navigate("/login")}>Sign in to delete your account</Button>
            <Button variant="outline" onClick={() => navigate("/privacy")}>Read Privacy Policy</Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Cannot sign in? Contact <a className="underline underline-offset-4" href="mailto:imankitsingh.in@gmail.com?subject=Lumae%20account%20deletion%20request">imankitsingh.in@gmail.com</a> from the email address associated with your account.
          </p>
        </div>
      </section>
    </main>
  );
}
