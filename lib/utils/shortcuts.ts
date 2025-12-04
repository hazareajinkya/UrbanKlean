import { isMac } from "../utils";

export const getModifierKey = () => {
  return isMac() ? "⌘" : "Ctrl";
};

export const sidebarCollapseShortcut = (() => {
  const modifier = getModifierKey();
  return `${modifier}+B`;
})();

export const navDashboardShortcut = "G1";
export const navKnowledgeShortcut = "G2";
export const navAgentsShortcut = "G3";
export const navChannelsShortcut = "G4";
export const navActionsShortcut = "G5";
export const navMembersShortcut = "G6";
export const navSettingsShortcut = "G7";
