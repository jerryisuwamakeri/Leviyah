"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send } from "lucide-react";
import type { Conversation, Message } from "@/types";

export default function AdminChatPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [reply, setReply]       = useState("");

  const { data } = useQuery<{ data: Conversation[] }>({
    queryKey: ["admin", "conversations"],
    queryFn:  () => adminApi.conversations().then((r) => r.data),
    refetchInterval: 10_000,
  });

  const { data: detail, refetch: refetchDetail } = useQuery({
    queryKey: ["admin", "conversation", selected?.id],
    queryFn:  () => selected ? adminApi.conversation(selected.id).then((r) => r.data) : null,
    enabled:  !!selected,
    refetchInterval: 5_000,
  });

  const { mutate: sendReply, isPending: sending } = useMutation({
    mutationFn: () => adminApi.replyChat(selected!.id, reply).then((r) => r.data),
    onSuccess:  () => { setReply(""); refetchDetail(); qc.invalidateQueries({ queryKey: ["admin", "conversations"] }); },
  });

  const { mutate: closeConv } = useMutation({
    mutationFn: (id: number) => adminApi.closeChat(id).then((r) => r.data),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ["admin", "conversations"] }); setSelected(null); },
  });

  const conversations: Conversation[] = Array.isArray(data)
    ? (data as unknown as Conversation[])
    : (data as { data: Conversation[] })?.data ?? [];

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">

      {/* Conversation list */}
      <div className="w-72 shrink-0 bg-[#111111] border border-[#2A2520] rounded-none overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-[#2A2520]">
          <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-white flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-[#C9A880]" /> Support Chats
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && (
            <p className="text-[#3A3530] text-xs text-center py-8">No conversations.</p>
          )}
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelected(conv)}
              className={`w-full text-left px-4 py-3.5 border-b border-[#1E1A17] transition-colors ${
                selected?.id === conv.id
                  ? "bg-[#C9A880]/10 border-l-2 border-l-[#C9A880]"
                  : "hover:bg-[#1E1A17]"
              }`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-white truncate">{conv.user?.name ?? "Customer"}</p>
                {(conv.unread_messages_count ?? 0) > 0 && (
                  <span className="w-4 h-4 bg-[#C9A880] text-[#111111] text-[8px] font-black flex items-center justify-center shrink-0">
                    {conv.unread_messages_count}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#7A6050] truncate">
                {conv.last_message?.body ?? conv.subject ?? "New chat"}
              </p>
              <div className="mt-1.5">
                <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 ${
                  conv.status === "open"
                    ? "bg-[#C9A880]/15 text-[#C9A880]"
                    : "bg-[#2A2520] text-[#7A6050]"
                }`}>
                  {conv.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 bg-[#111111] border border-[#2A2520] rounded-none flex flex-col overflow-hidden">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 text-[#2A2520]" />
              <p className="text-[#3A3530] text-xs">Select a conversation to begin</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2A2520]">
              <div>
                <p className="font-bold text-white text-sm">{selected.user?.name ?? "Customer"}</p>
                <p className="text-[10px] text-[#7A6050]">{selected.user?.email} — {selected.subject}</p>
              </div>
              <button
                onClick={() => closeConv(selected.id)}
                className="text-[9px] font-black tracking-widest uppercase text-[#7A6050] hover:text-[#C9A880] border border-[#2A2520] hover:border-[#C9A880]/30 px-3 py-1.5 transition-colors">
                Close Chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {(detail as Conversation)?.messages?.map((msg: Message) => {
                const isStaff = msg.sender_type?.includes("Staff");
                return (
                  <div key={msg.id} className={`flex ${isStaff ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2.5 text-sm ${
                      isStaff
                        ? "bg-[#C9A880] text-[#111111]"
                        : "bg-[#1E1A17] text-white/80 border border-[#2A2520]"
                    }`}>
                      {msg.body}
                      <p className={`text-[9px] mt-1.5 ${isStaff ? "text-[#111111]/50" : "text-[#7A6050]"}`}>
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-[#2A2520] flex gap-2">
              <Input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && reply.trim() && sendReply()}
                placeholder="Type a reply…"
                className="bg-[#0E0C0A] border-[#2A2520] text-white placeholder:text-[#3A3530] rounded-none flex-1 focus-visible:ring-[#C9A880]/30"
              />
              <button
                onClick={() => sendReply()}
                disabled={!reply.trim() || sending}
                className="px-4 bg-[#C9A880] text-[#111111] hover:bg-white disabled:opacity-40 transition-colors flex items-center gap-2">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
