"use client";

import { useEffect, useRef } from "react";
import { CONFIG } from "@/lib/config";
import { initInvite } from "@/lib/invite";

export default function Invite({ markup }: { markup: string }) {
  const started = useRef(false);

  useEffect(() => {
    // initInvite renders into the static markup and binds global listeners, so it must only run once.
    if (started.current) return;
    started.current = true;
    // On the old workers.dev address, show /invite so copied links skip the stale WhatsApp preview cached for its root
    if (location.hostname.endsWith(".workers.dev") && (location.pathname === "/" || location.pathname === "/index.html")) {
      history.replaceState(history.state, "", `/invite${location.search}${location.hash}`);
    }
    initInvite(CONFIG);
  }, []);

  return <div style={{ display: "contents" }} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: markup }} />;
}
