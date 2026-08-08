import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Calendar, User, FileText } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blog.findUnique({
    where: { slug },
    select: { title: true, excerpt: true, status: true },
  });

  if (!post || post.status !== "PUBLISHED") {
    return { title: "Post Not Found | EvoSport Journal" };
  }

  return {
    title: `${post.title} | EvoSport Journal`,
    description: post.excerpt || "Read this article on the EvoSport Journal.",
  };
}

export default async function PublicBlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await prisma.blog.findUnique({
    where: { slug },
    include: {
      author: { select: { name: true } },
    },
  });

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  const formattedDate = new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center text-xs font-bold text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Journal
        </Link>

        {/* Post Header */}
        <div className="space-y-4 border-b border-neutral-800 pb-8">
          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-rose-500" />
              {formattedDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-neutral-500" />
              By {post.author?.name || "EvoSport Team"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-base text-neutral-300 italic border-l-2 border-rose-500 pl-4 py-1">
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Post Body Content */}
        <div className="prose prose-invert max-w-none text-sm text-neutral-300 leading-relaxed whitespace-pre-line space-y-4">
          {post.content}
        </div>
      </div>
    </div>
  );
}
