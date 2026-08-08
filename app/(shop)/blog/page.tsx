import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FileText, ArrowRight, Calendar, User } from "lucide-react";

export const metadata: Metadata = {
  title: "EvoSport Journal | Training Tips & Gear Guides",
  description: "Read the latest athletic performance guides, marathon recovery tips, and equipment reviews.",
};

export default async function PublicBlogListPage() {
  const posts = await prisma.blog.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    include: {
      author: { select: { name: true } },
    },
  });

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-950/60 border border-rose-900/60 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            <FileText className="h-3 w-3" />
            EVOSPORT JOURNAL
          </span>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white">
            STORIES & GEAR GUIDES
          </h1>
          <p className="text-sm text-neutral-400">
            Insights on elite training, marathon preparation, cutting-edge footwear technology, and recovery strategies.
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.length === 0 ? (
            <div className="col-span-full py-16 text-center text-sm text-neutral-500 italic bg-neutral-950 border border-neutral-800 rounded-2xl">
              No blog articles published yet. Check back soon!
            </div>
          ) : (
            posts.map((p) => {
              const formattedDate = new Date(p.publishedAt || p.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 flex flex-col justify-between space-y-4 hover:border-neutral-700 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-rose-500" />
                        {formattedDate}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3 text-neutral-500" />
                        {p.author?.name || "EvoSport Team"}
                      </span>
                    </div>

                    <h2 className="text-lg font-black text-white hover:text-rose-400 transition-colors line-clamp-2">
                      <Link href={`/blog/${p.slug}`}>{p.title}</Link>
                    </h2>

                    <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                      {p.excerpt || p.content.slice(0, 140) + "..."}
                    </p>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/blog/${p.slug}`}
                      className="inline-flex items-center text-xs font-bold text-rose-500 hover:text-rose-400 transition-colors"
                    >
                      Read Article <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
