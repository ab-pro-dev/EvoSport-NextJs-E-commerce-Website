"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Image as ImageIcon, Upload, Copy, Check, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaItem {
  id: string;
  url: string;
  altText: string;
  source: string;
  referenceName: string;
  referenceLink: string;
}

interface MediaLibraryViewProps {
  initialMedia: MediaItem[];
}

export function MediaLibraryView({ initialMedia }: MediaLibraryViewProps) {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setErrorMsg(null);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to upload image.");
        setIsUploading(false);
        return;
      }

      const newMediaItem: MediaItem = {
        id: data.public_id || `media_${Date.now()}`,
        url: data.secure_url,
        altText: file.name,
        source: "GENERIC",
        referenceName: "Media Uploads",
        referenceLink: "/admin/media",
      };

      setMedia([newMediaItem, ...media]);
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMsg("Failed to upload image.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-rose-600 dark:text-rose-500" />
            MEDIA & ASSETS LIBRARY
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Cloudinary media assets aggregated across products, blog articles, and promotional banners.
          </p>
        </div>

        <div>
          <label className="cursor-pointer inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase text-xs tracking-wider rounded-lg h-10 px-5 transition-colors shadow-sm">
            <Upload className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Upload Asset"}
            <input
              type="file"
              accept="image/*"
              disabled={isUploading}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs text-rose-700 dark:text-rose-300 font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Media Grid */}
      {media.length === 0 ? (
        <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-12 text-center text-xs text-neutral-400 dark:text-neutral-500 italic shadow-sm">
          No uploaded media assets found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item) => {
            const isCopied = copiedUrl === item.url;

            return (
              <div
                key={item.id}
                className="group rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 overflow-hidden flex flex-col justify-between hover:border-gray-300 dark:hover:border-neutral-700 transition-colors shadow-sm"
              >
                {/* Image Container */}
                <div className="relative aspect-square w-full bg-gray-100 dark:bg-neutral-950 overflow-hidden border-b border-gray-100 dark:border-neutral-800">
                  <Image
                    src={item.url}
                    alt={item.altText}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 text-[9px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-white/90 dark:bg-black/80 backdrop-blur-sm border border-rose-200 dark:border-rose-900/60 px-2 py-0.5 rounded shadow-sm">
                    {item.source}
                  </span>
                </div>

                {/* Footer Info & Copy Button */}
                <div className="p-3.5 space-y-3">
                  <div>
                    <p className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1">{item.altText}</p>
                    <Link
                      href={item.referenceLink}
                      className="text-[10px] text-neutral-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 mt-0.5 line-clamp-1"
                    >
                      <span>{item.referenceName}</span>
                      <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                    </Link>
                  </div>

                  <Button
                    onClick={() => handleCopyUrl(item.url)}
                    variant="outline"
                    className="w-full h-8 text-[11px] font-bold border-gray-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-neutral-700"
                  >
                    {isCopied ? (
                      <>
                        <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Copied URL
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1.5 h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" /> Copy Image URL
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
