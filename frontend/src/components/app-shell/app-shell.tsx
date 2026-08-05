"use client";

import { useState } from "react";

import { ChatScreen } from "@/components/chat-screen";
import { FitScreen } from "@/components/fit-screen";
import { GateBar } from "@/components/gate-bar";
import { SetupScreen } from "@/components/setup-screen";
import { TopBar } from "@/components/top-bar";
import { DocumentsProvider } from "@/hooks/use-documents";
import type { ChatState, Screen } from "@/lib/types";

export function AppShell() {
  const [screen, setScreen] = useState<Screen>("setup");
  const [chatState, setChatState] = useState<ChatState>("empty");

  return (
    <DocumentsProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        <TopBar
          screen={screen}
          onScreenChange={setScreen}
          chatState={chatState}
          onChatStateChange={setChatState}
        />

        {screen === "setup" && (
          <>
            <SetupScreen />
            <GateBar onContinue={() => setScreen("chat")} />
          </>
        )}

        {screen === "chat" && (
          <ChatScreen
            onNavigate={setScreen}
            chatState={chatState}
            onChatStateChange={setChatState}
          />
        )}

        {screen === "fit" && <FitScreen />}
      </div>
    </DocumentsProvider>
  );
}
