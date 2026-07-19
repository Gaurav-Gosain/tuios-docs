import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { blogSource, getBlogPageImage, getBlogPosts } from "@/lib/source";

export const revalidate = false;

/**
 * Post titles run to two lines and post descriptions are a full sentence, which
 * the shared docs template is not laid out for: it positions its description at
 * a fixed offset and a wrapped title collides with it. This lays the same
 * elements out as a flex column instead, and clips the description to a length
 * that fits underneath either a one or two line title.
 */
function clip(text: string, limit: number) {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : limit).trimEnd()}...`;
}

export async function GET(
  _req: Request,
  props: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await props.params;
  const page = blogSource.getPage(slug.slice(0, -1));
  if (!page) notFound();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        color: "#e6e6ef",
        backgroundColor: "#0f0f16",
        backgroundImage:
          "radial-gradient(circle at 88% 8%, #4a2a6b 0%, transparent 55%)",
      }}
    >
      <div style={{ display: "flex", color: "#bb9af7", fontSize: 30 }}>
        TUIOS Blog
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", fontSize: 62, lineHeight: 1.15 }}>
          {page.data.title}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            lineHeight: 1.4,
            color: "#a9a9bd",
          }}
        >
          {clip(page.data.description ?? "", 150)}
        </div>
      </div>

      <div style={{ display: "flex", fontSize: 24, color: "#7f7f95" }}>
        {page.data.author}
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}

export function generateStaticParams() {
  return getBlogPosts().map((page) => ({
    slug: getBlogPageImage(page).segments,
  }));
}
