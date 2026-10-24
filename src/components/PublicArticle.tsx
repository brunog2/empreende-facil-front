import { useEffect } from "react";
import { MarketingChrome } from "@/components/MarketingChrome";

export interface ArticleSection {
  title: string;
  paragraphs: string[];
  items?: string[];
}

interface PublicArticleProps {
  title: string;
  intro: string;
  sections: ArticleSection[];
}

export function PublicArticle({ title, intro, sections }: PublicArticleProps) {
  useEffect(() => {
    document.title = `${title} — Gestão Pro`;
    return () => {
      document.title = "Empreende Fácil - Gestão Pro";
    };
  }, [title]);

  return (
    <MarketingChrome>
      <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm font-semibold text-primary-700">Gestão Pro</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">{intro}</p>
        <p className="mt-3 text-sm text-slate-500">Atualizado em 24 de outubro de 2026</p>
        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-xl font-bold text-ink">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                  {paragraph}
                </p>
              ))}
              {section.items && (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600 sm:text-base">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </article>
    </MarketingChrome>
  );
}
