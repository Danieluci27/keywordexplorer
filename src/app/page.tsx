// src/app/page.tsx
"use client";

import { redirect } from "next/navigation";
import Explorer from "./explorer/page";
 
export default function Page() {
  redirect("/auth/login");
  return <Explorer />;
}