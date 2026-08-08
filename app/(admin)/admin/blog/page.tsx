import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BlogManagementView } from "@/components/admin/blog-management-view";

export const metadata: Metadata = {
  title: "Blog & CMS Management | EvoSport Admin",
  description: "Create, edit, publish, and delete blog articles.",
};

export default async function AdminBlogPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/admin-login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    redirect("/admin-login");
  }

  const postsRaw = await prisma.blog.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true, email: true } },
    },
  });

  const formattedPosts = postsRaw.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    content: p.content,
    excerpt: p.excerpt,
    coverImageUrl: p.coverImageUrl,
    status: p.status,
    authorName: p.author?.name || "Admin",
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
  }));

  return <BlogManagementView initialPosts={formattedPosts} />;
}
