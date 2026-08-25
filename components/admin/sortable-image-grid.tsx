"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Star, Trash2, GripVertical, Loader2 } from "lucide-react";

export interface SortableImageItem {
  id: string;
  url: string;
  altText?: string | null;
  isUploading?: boolean;
  fileName?: string;
}

interface SortableImageCardProps {
  item: SortableImageItem;
  index: number;
  onDelete: (id: string) => void;
  onSetMain: (id: string) => void;
}

function SortableImageCard({ item, index, onDelete, onSetMain }: SortableImageCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  const isMain = index === 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-2xl overflow-hidden bg-white dark:bg-neutral-950 aspect-square p-2 transition-all shadow-md ${
        isMain
          ? "border-2 border-rose-600 dark:border-rose-500 ring-4 ring-rose-600/15"
          : "border border-gray-200 dark:border-neutral-800 hover:border-gray-400"
      } ${isDragging ? "ring-4 ring-rose-500 shadow-2xl scale-[1.02]" : ""}`}
    >
      {item.isUploading ? (
        <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-neutral-900 text-neutral-400 p-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-rose-600 dark:text-rose-500 mb-2" />
          <span className="text-xs font-bold truncate max-w-full">
            {item.fileName || "Uploading..."}
          </span>
        </div>
      ) : (
        <>
          <Image
            src={item.url || "/placeholder.png"}
            alt={item.altText || "Product Image"}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            className="object-contain p-2 select-none pointer-events-none"
          />

          {/* Drag Handle Button */}
          <div
            {...attributes}
            {...listeners}
            className="absolute left-2.5 top-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-lg bg-black/75 hover:bg-black text-white cursor-grab active:cursor-grabbing backdrop-blur-sm transition-opacity opacity-80 group-hover:opacity-100 shadow-md"
            title="Drag to reorder"
          >
            <GripVertical className="h-4.5 w-4.5" />
          </div>

          {/* Main Badge or Set Main Button */}
          {isMain ? (
            <div className="absolute left-12 top-2.5 z-10">
              <span className="flex items-center gap-1.5 bg-rose-600 text-white font-black text-[10px] uppercase px-2.5 py-1.5 rounded-md shadow-md tracking-wider">
                <Star className="h-3 w-3 fill-current text-white" />
                CARD PRIMARY
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onSetMain(item.id)}
              className="absolute left-12 top-2.5 z-10 hidden group-hover:flex items-center gap-1.5 bg-neutral-900/90 hover:bg-rose-600 text-white text-[10px] font-bold uppercase px-2.5 py-1.5 rounded-md backdrop-blur-sm transition-colors shadow-md"
              title="Set as Card Primary Image (Position 0)"
            >
              <Star className="h-3 w-3" />
              Set Main
            </button>
          )}

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="absolute right-2.5 top-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-lg bg-black/75 hover:bg-rose-600 text-white transition-all shadow-md opacity-80 group-hover:opacity-100"
            title="Delete Image"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          {/* Index Pill */}
          <div className="absolute right-2.5 bottom-2.5 z-10 bg-black/75 text-white text-[10px] font-black px-2 py-1 rounded-md backdrop-blur-sm shadow-md">
            #{index + 1}
          </div>
        </>
      )}
    </div>
  );
}

interface SortableImageGridProps {
  images: SortableImageItem[];
  onReorder: (newImages: SortableImageItem[]) => void;
  onDelete: (id: string) => void;
  onSetMain: (id: string) => void;
}

export function SortableImageGrid({
  images,
  onReorder,
  onDelete,
  onSetMain,
}: SortableImageGridProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const validImages = useMemo(() => {
    return (images || []).filter(
      (img): img is SortableImageItem => Boolean(img && typeof img === "object" && img.id)
    );
  }, [images]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = validImages.findIndex((img) => img.id === active.id);
      const newIndex = validImages.findIndex((img) => img.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(validImages, oldIndex, newIndex);
        onReorder(reordered);
      }
    }
  };

  if (!isMounted || validImages.length === 0) return null;

  const itemIds = validImages.map((img) => img.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={itemIds} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
          {validImages.map((item, index) => (
            <SortableImageCard
              key={item.id}
              item={item}
              index={index}
              onDelete={onDelete}
              onSetMain={onSetMain}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
