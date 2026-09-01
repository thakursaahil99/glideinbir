import type { Metadata } from "next";
import { pageContentService } from "@/server/modules/page-content/service";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy — Glideinbir",
  description: "How Glideinbir collects, uses, and protects your information when you book or browse the site.",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const page = await pageContentService.getByKey("privacy");
  return (
    <LegalPage
      title={page?.title ?? "Privacy Policy"}
      body={page?.body ?? "This page is being updated. Please check back shortly, or call +91 98053 38877."}
    />
  );
}
