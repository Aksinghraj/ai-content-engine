import { BriefcaseBusiness, Mail, MessageCircleMore, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

type BusinessChannel = "email" | "whatsapp";

export default function BusinessAutomation({ channel }: { channel: BusinessChannel }) {
  const isEmail = channel === "email";
  const Icon = isEmail ? Mail : MessageCircleMore;
  const title = isEmail ? "Email Automation" : "WhatsApp Automation";
  const description = isEmail
    ? "Plan compliant customer email workflows from one dedicated business workspace."
    : "Prepare official WhatsApp Business workflows without relying on unofficial account automation.";

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-primary/15 p-2.5 text-primary"><BriefcaseBusiness className="h-5 w-5" /></div>
        <div><h1 className="text-3xl font-semibold text-foreground">{title}</h1><p className="mt-1 text-muted-foreground">{description}</p></div>
      </div>
      <Card className="border-border bg-card p-6">
        <div className="flex gap-3"><Icon className="mt-0.5 h-5 w-5 text-primary" /><div><h2 className="font-semibold text-card-foreground">Business workspace</h2><p className="mt-1 text-sm text-muted-foreground">This navigation area is ready for your business messaging workflows. Sending integrations are intentionally not activated until a compliant provider, consent policy, and credit model are configured.</p></div></div>
        <div className="mt-5 rounded-xl border border-border bg-muted/25 p-4"><div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 text-[#10b981]" /><div><p className="font-medium text-card-foreground">Safe by default</p><p className="mt-1 text-sm text-muted-foreground">No messages are sent, no contacts are imported, and no external account is connected from this page.</p></div></div></div>
      </Card>
    </div>
  );
}
