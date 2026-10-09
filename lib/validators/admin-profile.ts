import { z } from "zod";

/**
 * Username validator:
 * 3-32 characters, lowercase letters, digits, and the characters . _ @ -
 * Stored lowercase.
 */
export const usernameSchema = z
  .string({ invalid_type_error: "Username must be a string" })
  .trim()
  .transform((val) => val.toLowerCase())
  .pipe(
    z
      .string()
      .min(3, "Username must be between 3 and 32 characters")
      .max(32, "Username must be between 3 and 32 characters")
      .regex(
        /^[a-z0-9._@-]{3,32}$/,
        "Username may only contain lowercase letters, numbers, and the characters . _ @ -"
      )
  );

export function isValidCloudinaryImageUrl(url: string | null | undefined): boolean {
  if (url === null || url === undefined) return true;
  try {
    const parsed = new URL(url);
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "vgnpcqyo";
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "res.cloudinary.com" &&
      parsed.pathname.startsWith(`/${cloudName}/`)
    );
  } catch {
    return false;
  }
}

export const adminProfileUpdateSchema = z.object({
  name: z
    .string({ invalid_type_error: "Name must be a string" })
    .trim()
    .min(1, "Name must be between 1 and 60 characters")
    .max(60, "Name must be between 1 and 60 characters")
    .optional(),
  username: usernameSchema.optional(),
  image: z
    .union([
      z.null(),
      z.string().url("Image must be a valid URL").refine(
        (val) => isValidCloudinaryImageUrl(val),
        "Image must be an HTTPS URL on our Cloudinary cloud"
      ),
    ])
    .optional(),
});

export const adminPasswordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(10, "New password must be at least 10 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });
