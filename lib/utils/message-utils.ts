import { UIMessage } from "ai";
import clsx from "clsx";

export const getMessageStyle = (
  message: UIMessage,
  role: "user" | "assistant"
) => {
  const hasText = message.parts.some((part) => part.type === "text");
  const isShort = message.parts.length <= 50;
  const baseStyle =
    "bg-secondary text-secondary-foreground px-3 md:px-4 leading-7";

  if (role === "user") {
    return clsx(
      baseStyle,
      "py-1 md:py-1.5",
      hasText && isShort ? "rounded-t-2xl rounded-bl-2xl" : "rounded-2xl"
    );
  }

  return clsx(
    baseStyle,
    "py-2 md:py-2",
    hasText && isShort ? "rounded-t-2xl rounded-br-2xl" : "rounded-2xl"
  );
};

export const heightClass = `min-h-[calc(100vh-19rem)] md:min-h-[calc(100vh-20rem)]`;
