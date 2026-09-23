import { SiteLayout } from "@/components/layout/site";
import { LearnTheme } from "@/components/learn/learn-theme";
import "./learn.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <LearnTheme>
      <SiteLayout>{children}</SiteLayout>
    </LearnTheme>
  );
}
