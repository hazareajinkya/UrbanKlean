"use client";
import { redirect, useParams } from "next/navigation";

export default function WorkspacePage() {
  const { wid } = useParams() as { wid: string };
  redirect(`/workspaces/${wid}/dashboard`);
  return null;
}
