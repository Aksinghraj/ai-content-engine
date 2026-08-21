import { useState } from "react";
import { BriefcaseBusiness, CheckCircle2, Mail, MessageCircleMore, Plus, ShieldCheck, Unplug } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

type BusinessChannel = "email" | "whatsapp";

function ContactManagement() {
  const utils = trpc.useUtils();
  const contacts = trpc.businessMessaging.contacts.list.useQuery();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailConsent, setEmailConsent] = useState(false);
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  const create = trpc.businessMessaging.contacts.create.useMutation({
    onSuccess: async () => {
      await utils.businessMessaging.contacts.list.invalidate();
      setName(""); setEmail(""); setPhone(""); setEmailConsent(false); setWhatsappConsent(false);
      toast.success("Consent-first contact added. Sending remains disabled.");
    },
    onError: (error) => toast.error(error.message),
  });
  const withdraw = trpc.businessMessaging.contacts.withdrawConsent.useMutation({
    onSuccess: async () => {
      await utils.businessMessaging.contacts.list.invalidate();
      toast.success("Channel consent withdrawn.");
    },
    onError: (error) => toast.error(error.message),
  });
  const canSave = Boolean((email && emailConsent) || (phone && whatsappConsent));

  return <div className="space-y-5">
    <div className="flex items-center gap-2 rounded-xl border border-[#f59e0b]/30 bg-[#f59e0b]/10 px-4 py-3 text-sm text-[#f59e0b]"><Mail className="h-4 w-4" />Email delivery is coming soon. You can safely prepare consented contacts now; no email can be sent yet.</div>
    <Card className="border-border bg-card p-6">
      <div className="flex gap-3"><Plus className="mt-0.5 h-5 w-5 text-primary" /><div><h2 className="font-semibold text-card-foreground">Add a consented contact</h2><p className="mt-1 text-sm text-muted-foreground">Record only contacts who have explicitly agreed to the channel you select. No message is sent when a contact is added.</p></div></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium text-card-foreground">Name<input value={name} onChange={(event) => setName(event.target.value)} maxLength={160} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary" placeholder="Customer name" /></label><label className="text-sm font-medium text-card-foreground">Email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary" placeholder="name@example.com" /></label><label className="text-sm font-medium text-card-foreground sm:col-span-2">WhatsApp phone number<input value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary" placeholder="Include country code, e.g. +91…" /></label></div>
      <div className="mt-4 space-y-3 rounded-xl border border-border bg-muted/25 p-4"><label className="flex items-start gap-2 text-sm text-card-foreground"><input type="checkbox" checked={emailConsent} onChange={(event) => setEmailConsent(event.target.checked)} disabled={!email} className="mt-0.5 accent-primary" />I have explicit permission to contact this person by email.</label><label className="flex items-start gap-2 text-sm text-card-foreground"><input type="checkbox" checked={whatsappConsent} onChange={(event) => setWhatsappConsent(event.target.checked)} disabled={!phone} className="mt-0.5 accent-primary" />I have explicit permission to contact this person on WhatsApp.</label><p className="text-xs text-muted-foreground">Consent choices are stored with an audit event. Channel consent can be withdrawn below at any time.</p></div>
      <Button className="mt-4 lumae-gradient-cta" disabled={!canSave || create.isPending} onClick={() => create.mutate({ name: name || undefined, email: email || undefined, phone: phone || undefined, emailConsent, whatsappConsent })}>Add consented contact</Button>
    </Card>
    <Card className="border-border bg-card p-6"><h2 className="font-semibold text-card-foreground">Your consented contacts</h2><p className="mt-1 text-sm text-muted-foreground">These contacts are private to your Business workspace. Outbound sending is disabled until provider onboarding is complete.</p>{contacts.isLoading ? <p className="mt-4 text-sm text-muted-foreground">Loading contacts…</p> : contacts.data?.length ? <div className="mt-4 space-y-2">{contacts.data.map((contact) => <div key={contact.id} className="flex flex-col gap-3 rounded-xl border border-border bg-muted/25 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium text-card-foreground">{contact.name || contact.email || contact.phone}</p><p className="mt-1 text-xs text-muted-foreground">{contact.email || "No email"}{contact.phone ? ` · ${contact.phone}` : ""}</p><p className="mt-2 text-xs text-muted-foreground">Email: {contact.emailConsent ? "consented" : "not consented"} · WhatsApp: {contact.whatsappConsent ? "consented" : "not consented"}</p></div><div className="flex flex-wrap gap-2">{contact.emailConsent && <Button size="sm" variant="outline" className="border-border" disabled={withdraw.isPending} onClick={() => withdraw.mutate({ contactId: contact.id, channel: "email" })}>Withdraw email</Button>}{contact.whatsappConsent && <Button size="sm" variant="outline" className="border-border" disabled={withdraw.isPending} onClick={() => withdraw.mutate({ contactId: contact.id, channel: "whatsapp" })}>Withdraw WhatsApp</Button>}</div></div>)}</div> : <p className="mt-4 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">No consented contacts yet.</p>}</Card>
  </div>;
}

function WhatsAppConnection() {
  const status = trpc.businessMessaging.whatsapp.status.useQuery();
  const beginLink = trpc.businessMessaging.whatsapp.beginOfficialLink.useMutation({
    onSuccess: () => toast.success("Official WhatsApp linking is ready to start."),
    onError: (error) => toast.error(error.message),
  });
  const current = status.data?.status ?? "not_configured";
  const statusCopy: Record<string, string> = {
    not_configured: "WhatsApp connection coming soon",
    ready_to_link: "Ready to open official Meta Embedded Signup",
    linking: "Waiting for Meta account linking to finish",
    connected: "WhatsApp Business account connected",
    needs_reconnect: "Reconnect your WhatsApp Business account",
    error: "Connection needs attention",
  };
  return <div className="space-y-5"><Card className="border-border bg-card p-6"><div className="flex gap-3"><MessageCircleMore className="mt-0.5 h-5 w-5 text-primary" /><div><h2 className="font-semibold text-card-foreground">Official WhatsApp Business connection</h2><p className="mt-1 text-sm text-muted-foreground">Lumae will use Meta’s official Embedded Signup flow—never WhatsApp Web scraping or unofficial device automation.</p></div></div><div className="mt-5 rounded-xl border border-border bg-muted/25 p-4"><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${current === "connected" ? "bg-[#10b981]" : "bg-[#f59e0b]"}`} /><p className="font-medium text-card-foreground">{statusCopy[current]}</p></div><p className="mt-2 text-sm text-muted-foreground">{status.data?.configured ? "Your Meta configuration is available. Complete the official popup flow to choose or create a WhatsApp Business account and verify its phone number." : "The official connection flow will be enabled after Meta Business app, Embedded Signup, and webhook configuration are complete. No account or token is collected from this page."}</p>{status.data?.displayPhoneNumber && <p className="mt-2 text-sm text-muted-foreground">Connected number: {status.data.displayPhoneNumber}</p>}</div><div className="mt-5 grid gap-3 sm:grid-cols-3">{["Meta Business authentication", "WhatsApp account and number selection", "Secure server-side token exchange"].map((step, index) => <div key={step} className="rounded-xl border border-border bg-muted/25 p-3 text-sm text-muted-foreground"><span className="mr-2 font-semibold text-primary">{index + 1}</span>{step}</div>)}</div><Button className="mt-5 lumae-gradient-cta" disabled onClick={() => beginLink.mutate()}>{beginLink.isPending ? "Preparing…" : "WhatsApp connection coming soon"}</Button><p className="mt-3 text-xs text-muted-foreground">Complete the Meta Business app, Embedded Signup configuration, webhook verification, and credentials before enabling this action.</p></Card><Card className="border-border bg-card p-6"><div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 text-[#10b981]" /><div><h2 className="font-semibold text-card-foreground">Messaging remains disabled</h2><p className="mt-1 text-sm text-muted-foreground">No WhatsApp messages can be sent from Lumae until official onboarding, template approval, customer consent, and provider configuration are complete.</p></div></div></Card></div>;
}

export default function BusinessAutomation({ channel }: { channel: BusinessChannel }) {
  const isEmail = channel === "email";
  const Icon = isEmail ? Mail : MessageCircleMore;
  return <div className="space-y-6"><div className="flex items-start gap-3"><div className="rounded-xl bg-primary/15 p-2.5 text-primary"><BriefcaseBusiness className="h-5 w-5" /></div><div><h1 className="text-3xl font-semibold text-foreground">{isEmail ? "Email Automation" : "WhatsApp Automation"}</h1><p className="mt-1 text-muted-foreground">Build a compliant customer-messaging foundation before any outreach is activated.</p></div></div><div className="flex items-center gap-2 rounded-xl border border-[#10b981]/30 bg-[#10b981]/10 px-4 py-3 text-sm text-[#10b981]"><CheckCircle2 className="h-4 w-4" />Consent-first controls are active. Outbound messaging is off.</div>{isEmail ? <ContactManagement /> : <WhatsAppConnection />}</div>;
}
