import { isMac } from "../utils";

export const getModifierKey = () => {
  return isMac() ? "⌘" : "Ctrl";
};

export const sidebarCollapseShortcut = (() => {
  const modifier = getModifierKey();
  return `${modifier}+B`;
})();
