import type { Metadata } from "next";
import { pageContentService } from "@/server/modules/page-content/service";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy — Glideinbir",
  description: "Glideinbir's cancellation windows and refund process for paragliding, courses, hotels, adventures, and travel bookings.",
  alternates: { canonical: "/cancellation-policy" },
};

export default async function CancellationPolicyPage() {
  const page = await pageContentService.getByKey("cancellation-policy");
  return (
    <LegalPage
      title={page?.title ?? "Cancellation & Refund Policy"}
      body={page?.body ?? "This page is being updated. Please check back shortly, or call +91 98053 38877."}
    />
  );
}
