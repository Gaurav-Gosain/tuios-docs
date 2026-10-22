import type { Metadata } from "next";
import { Landing } from "@/components/home/landing";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  description: site.description,
  path: "/",
});

export default function HomePage() {
  return <Landing />;
}
