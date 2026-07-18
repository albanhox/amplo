import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { BRAND } from "@/lib/brand";

export const metadata = { title: `Privacy — ${BRAND.name}` };

export default function Privacy() {
  return (
    <>
      <SiteNav />
      <main className="wrap" style={{ maxWidth: 760, padding: "48px 22px 80px" }}>
        <h1 style={{ fontSize: 38, letterSpacing: "-.03em", fontWeight: 800 }}>Privacy Policy</h1>
        <p style={{ color: "var(--faint)", fontWeight: 600, marginTop: 6 }}>Last updated: {new Date().getFullYear()}</p>
        <Section title="What we collect">
          Account details (name, email), the business profile you create, the social and Google accounts you choose to
          connect, and the content {BRAND.name} generates and publishes on your behalf.
        </Section>
        <Section title="How we use it">
          To generate and schedule your content, publish to the accounts you connect, pull your Google reviews, and show
          you performance. We use Anthropic’s Claude to generate content; your prompts and business context are sent to
          that provider solely to produce your posts.
        </Section>
        <Section title="Connected accounts">
          When you connect Google Business or Meta, we store access tokens to act on your behalf. You can disconnect at
          any time from Connect &amp; Billing, which revokes our access. We never post without the permissions you grant.
        </Section>
        <Section title="Your data is yours">
          Export or delete your content and business data anytime. Cancel and we stop processing your data; request full
          deletion and we remove it.
        </Section>
        <Section title="Contact">
          Questions? Email <a style={{ color: "var(--brand)", fontWeight: 700 }} href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a>.
        </Section>
        <p style={{ marginTop: 40 }}><Link href="/" style={{ color: "var(--brand)", fontWeight: 700 }}>← Back to {BRAND.name}</Link></p>
      </main>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 28 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-.02em" }}>{title}</h2>
      <p style={{ color: "var(--muted)", fontSize: 15.5, marginTop: 8, fontWeight: 500, lineHeight: 1.6 }}>{children}</p>
    </div>
  );
}
