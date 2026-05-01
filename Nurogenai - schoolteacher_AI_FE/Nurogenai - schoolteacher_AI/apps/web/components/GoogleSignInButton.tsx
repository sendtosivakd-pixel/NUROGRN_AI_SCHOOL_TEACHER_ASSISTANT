"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, string | number>,
          ) => void;
        };
      };
    };
  }
}

export function GoogleSignInButton({
  onCredential,
}: {
  onCredential: (credential: string) => Promise<void>;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

  useEffect(() => {
    const resolvedClientId = clientId;
    if (!resolvedClientId || !containerRef.current) return;

    function renderButton() {
      if (!window.google || !containerRef.current) return;
      containerRef.current.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: resolvedClientId,
        callback: (response) => {
          if (response.credential) {
            void onCredential(response.credential);
          }
        },
      });
      window.google.accounts.id.renderButton(containerRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "pill",
        width: 372,
        text: "continue_with",
        logo_alignment: "left",
      });
    }

    const existingScript = document.getElementById("google-identity-script");
    if (existingScript) {
      renderButton();
      return;
    }

    const script = document.createElement("script");
    script.id = "google-identity-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderButton;
    document.head.appendChild(script);
  }, [clientId, onCredential]);

  if (!clientId) {
    return (
      <div className="notice info">
        Add <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> to enable Google sign-in.
      </div>
    );
  }

  return <div className="google-button" ref={containerRef} />;
}
