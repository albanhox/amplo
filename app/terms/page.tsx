import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { BRAND } from "@/lib/brand";

export const metadata = { title: `Terms — ${BRAND.name}` };

export default function Terms() {
  return (
    <>
      <SiteNav />
      <main className="wrap" style={{ maxWidth: 760, padding: "48px 22px 80px" }}>
        <h1 style={{ fontSize: 38, letterSpacing: "-.03em", fontWeight: 800 }}>Terms of Service</h1>
        <p style={{ color: "var(--faint)", fontWeight: 600, marginTop: 6 }}>Last updated: {new Date().getFullYear()}</p>
        <Section title="The service">
          {BRAND.name} generates, schedules, and publishes marketing content for your business across the channels you
          connect. You’re responsible for the accuracy of your business information and for any claims in content you
          approve or allow autopilot to publish.
        </Section>
        <Section title="Plans & billing">
          Paid plans are billed monthly or yearly and are month-to-month unless stated otherwise. You can upgrade,
          downgrade, or cancel anytime; cancellation stops future billing and pauses autopilot at the end of the period.
        </Section>
        <Section title="Acceptable use">
          Don’t use {BRAND.name} to publish unlawful, deceptive, or infringing content, or to violate the terms of any
          connected platform (Google, Meta, TikTok, LinkedIn). We may suspend accounts that do.
        </Section>
        <Section title="Content ownership">
          You own the content {BRAND.name} produces for you. You grant us the permissions needed to generate and publish
          it on your behalf while your account is active.
        </Section>
        <Section title="Contact">
          Questions about these terms? Email <a style={{ color: "var(--brand)", fontWeight: 700 }} href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a>.
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
