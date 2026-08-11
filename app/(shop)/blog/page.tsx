import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FileText, ArrowRight, Calendar, User } from "lucide-react";

export const metadata: Metadata = {
  title: "EvoSport Journal | Training Tips & Gear Guides",
  description: "Read the latest athletic performance guides, marathon recovery tips, and equipment reviews.",
};

export const dynamic = "force-dynamic";

export default async function PublicBlogListPage() {
  const posts = await prisma.blog.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    include: {
      author: { select: { name: true } },
    },
  });

  return (
    <div className="min-h-screen bg-[#F4F8FC] text-[#0F1B2D] pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#5B8DEF] bg-[#5B8DEF]/10 border border-[#5B8DEF]/20 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            <FileText className="h-3 w-3" />
            EVOSPORT JOURNAL
          </span>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-[#0F1B2D]">
            STORIES & GEAR GUIDES
          </h1>
          <p className="text-sm text-[#0F1B2D]/50">
            Insights on elite training, marathon preparation, cutting-edge footwear technology, and recovery strategies.
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.length === 0 ? (
            <div className="col-span-full py-16 text-center text-sm text-[#0F1B2D]/40 italic bg-white border border-gray-200 rounded-2xl">
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
                  className="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col justify-between space-y-4 hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-[11px] text-[#0F1B2D]/40">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-[#5B8DEF]" />
                        {formattedDate}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3 text-[#0F1B2D]/30" />
                        {p.author?.name || "EvoSport Team"}
                      </span>
                    </div>

                    <h2 className="text-lg font-black text-[#0F1B2D] hover:text-[#5B8DEF] transition-colors line-clamp-2">
                      <Link href={`/blog/${p.slug}`}>{p.title}</Link>
                    </h2>

                    <p className="text-xs text-[#0F1B2D]/50 line-clamp-3 leading-relaxed">
                      {p.excerpt || p.content.slice(0, 140) + "..."}
                    </p>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/blog/${p.slug}`}
                      className="inline-flex items-center text-xs font-bold text-[#5B8DEF] hover:text-[#4A7AD4] transition-colors"
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
