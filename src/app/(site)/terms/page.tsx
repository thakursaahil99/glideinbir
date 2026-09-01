import type { Metadata } from "next";
import { pageContentService } from "@/server/modules/page-content/service";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service — Glideinbir",
  description: "The terms that apply when you book paragliding, courses, hotels, adventures, or travel through Glideinbir.",
  alternates: { canonical: "/terms" },
};

export default async function TermsPage() {
  const page = await pageContentService.getByKey("terms");
  return (
    <LegalPage
      title={page?.title ?? "Terms of Service"}
      body={page?.body ?? "This page is being updated. Please check back shortly, or call +91 98053 38877."}
    />
  );
}
