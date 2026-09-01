import { Container } from "@/components/ui/card";

export function LegalPage({ title, body }: { title: string; body: string }) {
  const paragraphs = body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <Container className="max-w-3xl py-16">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
      <div className="prose-legal mt-8 space-y-4 text-sm leading-relaxed text-ink/90">
        {paragraphs.map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {p}
          </p>
        ))}
      </div>
    </Container>
  );
}
