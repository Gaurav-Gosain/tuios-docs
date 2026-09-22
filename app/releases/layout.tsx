import { SiteLayout } from "@/components/layout/site";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SiteLayout>{children}</SiteLayout>;
}
