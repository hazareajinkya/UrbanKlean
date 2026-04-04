import { useEffect, useState } from "react";
import agentService from "@/lib/services/agent-service";
import { IAgent } from "@/lib/types/agent";

const toError = (err: unknown): Error =>
  err instanceof Error ? err : new Error(String(err));

export const useAgentRealtime = (args: { agentId: string | null }) => {
  const { agentId } = args;
  const [agent, setAgent] = useState<IAgent | null>(null);
  /** True until the first snapshot for the current subscription (avoids treating initial null agent as "missing"). */
  const [isListening, setIsListening] = useState(() => Boolean(agentId));
  const [subscriptionError, setSubscriptionError] = useState<Error | null>(
    null,
  );
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(() => {
    if (!agentId) {
      setAgent(null);
      setIsListening(false);
      setSubscriptionError(null);
      return;
    }

    setAgent(null);
    setIsListening(true);
    setSubscriptionError(null);

    const unsubscribe = agentService.subscribeToAgentSnapshot({
      aid: agentId,
      onChange: (next) => {
        setSubscriptionError(null);
        setAgent(next);
        setIsListening(false);
        const shouldEndSubscription =
          next === null || next.trainingStatus !== "pending";
        if (shouldEndSubscription) {
          unsubscribe();
        }
      },
      onError: (err) => {
        setSubscriptionError(toError(err));
        setIsListening(false);
        unsubscribe();
      },
    });

    return () => {
      unsubscribe();
    };
  }, [agentId, retryNonce]);

  const retrySubscription = () => {
    setRetryNonce((n) => n + 1);
  };

  return {
    agent,
    isListening,
    subscriptionError,
    retrySubscription,
  };
};
