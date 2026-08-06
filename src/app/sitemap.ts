import type { MetadataRoute } from "next";
import { getAllQuestionSlugs, getCircles, getPopularTags } from "@/lib/queries";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [questions, circles, tags] = await Promise.all([
    getAllQuestionSlugs(),
    getCircles(),
    getPopularTags(200),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/questions"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/circles"), changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/ask"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/guide"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/guide/shinro"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/tools"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/tools/shien"), changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/tools/soudan"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.3 },
  ];

  return [
    ...staticPages,
    ...questions.map((q) => ({
      url: absoluteUrl(`/questions/${q.slug}`),
      lastModified: q.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...circles.map((c) => ({
      url: absoluteUrl(`/circles/${c.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...tags.map((t) => ({
      url: absoluteUrl(`/tags/${t.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
