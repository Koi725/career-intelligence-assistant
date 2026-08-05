"use client";

import { useState } from "react";

import { ChatScreen } from "@/components/chat-screen";
import { GateBar } from "@/components/gate-bar";
import { SetupScreen } from "@/components/setup-screen";
import { TopBar } from "@/components/top-bar";
import { DocumentsProvider } from "@/hooks/use-documents";
import type { Screen } from "@/lib/types";

export function AppShell() {
  const [screen, setScreen] = useState<Screen>("setup");

  return (
    <DocumentsProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        <TopBar screen={screen} onScreenChange={setScreen} />

        {screen === "setup" && (
          <>
            <SetupScreen />
            <GateBar onContinue={() => setScreen("chat")} />
          </>
        )}

        {screen === "chat" && <ChatScreen onNavigate={setScreen} />}

        {screen === "fit" && (
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <span className="text-muted font-mono text-sm">Phase 5</span>
          </div>
        )}
      </div>
    </DocumentsProvider>
  );
}
