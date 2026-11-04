import { Check, Lock } from "lucide-react";

import type { WidgetAction } from "../engine/types";
import { WixMark } from "../WixMark";
import { Button, Frame } from "./primitives";

/** First-use consent step ChatGPT shows before an app can act. */
export function ConnectCard({ reason, onAct }: { reason: string; onAct: (a: WidgetAction) => void }) {
  const connected = reason === "connected";
  const declined = reason === "declined";
  return (
    <Frame className="max-w-[460px]">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <WixMark size={40} className="rounded-xl" />
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold">{connected ? "Wix is connected" : declined ? "Wix not connected" : "Connect Wix to ChatGPT"}</h3>
            <p className="mt-0.5 text-sm text-secondary">
              {connected ? "ChatGPT can now search businesses on Wix and book or buy on your confirmation." : declined ? "You can connect it later from Settings → Apps." : `ChatGPT wants to use Wix ${reason}.`}
            </p>
          </div>
          {connected ? (
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-success-soft text-success">
              <Check className="size-4" />
            </span>
          ) : null}
        </div>

        {!connected && !declined && (
          <>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                "Search businesses, services and events listed on Wix",
                "See live availability and prices",
                "Book, reserve or buy only when you confirm in the chat",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-secondary" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-tertiary">
              <Lock className="size-3.5" />
              Wix receives only what's needed for the request. You can disconnect any time in Settings → Apps.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button color="secondary" variant="outline" onClick={() => onAct({ type: "connect", allow: false })}>
                Cancel
              </Button>
              <Button color="primary" onClick={() => onAct({ type: "connect", allow: true })}>
                Allow
              </Button>
            </div>
          </>
        )}
      </div>
    </Frame>
  );
}
