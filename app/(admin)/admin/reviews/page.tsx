import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReviewsManagementView } from "@/components/admin/reviews-management-view";

export const metadata: Metadata = {
  title: "Reviews Moderation | EvoSport Admin",
  description: "Moderate customer product reviews, verify ratings, and approve content.",
};

export default async function AdminReviewsPage() {
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

  const reviewsRaw = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      product: { select: { id: true, name: true, slug: true } },
    },
  });

  const formattedReviews = reviewsRaw.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    status: r.status,
    isVerifiedPurchase: r.isVerifiedPurchase,
    createdAt: r.createdAt.toISOString(),
    user: r.user,
    product: r.product,
  }));

  return <ReviewsManagementView initialReviews={formattedReviews} />;
}
