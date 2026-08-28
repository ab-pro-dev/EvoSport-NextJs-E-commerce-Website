import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReviewsView, UserReviewItem } from "@/components/dashboard/reviews-view";

export const metadata: Metadata = {
  title: "My Product Reviews | EvoSport Dashboard",
  description: "View and manage feedback and reviews you have written on EvoSport products.",
};

export default async function DashboardReviewsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const rawReviews = await prisma.review.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          basePrice: true,
          images: {
            take: 1,
            orderBy: { position: "asc" },
          },
        },
      },
    },
  });

  const reviews: UserReviewItem[] = rawReviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    verifiedPurchase: r.verifiedPurchase,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    product: {
      id: r.product.id,
      name: r.product.name,
      slug: r.product.slug,
      basePrice: Number(r.product.basePrice),
      images: r.product.images.map((img) => ({ url: img.url })),
    },
  }));

  return <ReviewsView initialReviews={reviews} />;
}
