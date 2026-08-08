import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MediaLibraryView } from "@/components/admin/media-library-view";

export const metadata: Metadata = {
  title: "Media Library | EvoSport Admin",
  description: "View and upload Cloudinary image assets across products and blog posts.",
};

export default async function AdminMediaPage() {
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

  const [productImages, blogPosts] = await Promise.all([
    prisma.productImage.findMany({
      orderBy: { id: "desc" },
      include: {
        product: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.blog.findMany({
      where: { coverImageUrl: { not: null } },
      select: { id: true, title: true, slug: true, coverImageUrl: true },
    }),
  ]);

  const mediaList = [
    ...productImages.map((img) => ({
      id: img.id,
      url: img.url,
      altText: img.altText || img.product.name,
      source: "PRODUCT",
      referenceName: `Product: ${img.product.name}`,
      referenceLink: `/admin/products`,
    })),
    ...blogPosts.map((post) => ({
      id: post.id,
      url: post.coverImageUrl!,
      altText: post.title,
      source: "BLOG",
      referenceName: `Blog: ${post.title}`,
      referenceLink: `/admin/blog`,
    })),
  ];

  return <MediaLibraryView initialMedia={mediaList} />;
}
