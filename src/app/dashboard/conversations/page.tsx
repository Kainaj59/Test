import { Phone, Share2, MessageCircle, Mail, Smartphone } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { Badge } from "@/components/Badge";
import { conversations } from "@/lib/data";
import type { Conversation } from "@/lib/types";

const channelIcon = {
  Téléphone: Phone,
  "Réseaux sociaux": Share2,
  Chat: MessageCircle,
  Email: Mail,
  SMS: Smartphone,
} as const;

const sentimentTone: Record<Conversation["sentiment"], string> = {
  positif: "success",
  neutre: "neutral",
  négatif: "danger",
};

export default function ConversationsPage() {
  const unread = conversations.filter((c) => c.unread).length;

  return (
    <>
      <Topbar
        title="Conversations"
        subtitle={`${unread} non lues · gérées par vos agents en temps réel`}
      />

      <div className="p-5 lg:p-8">
        <div className="card divide-y divide-border overflow-hidden">
          {conversations.map((c) => {
            const Icon = channelIcon[c.channel];
            return (
              <button
                key={c.id}
                className="flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-2"
              >
                <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                  <Icon size={18} />
                  {c.unread && (
                    <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-surface bg-danger" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`truncate ${c.unread ? "font-semibold" : "font-medium"}`}>
                      {c.contact}
                    </p>
                    <span className="text-xs text-muted">· {c.agent}</span>
                    <Badge tone={sentimentTone[c.sentiment]}>{c.sentiment}</Badge>
                    <span className="ml-auto whitespace-nowrap text-xs text-muted">
                      {c.time}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{c.preview}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
