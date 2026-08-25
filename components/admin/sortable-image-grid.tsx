"use client";

import React from "react";
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
      className={`relative group rounded-xl overflow-hidden bg-white dark:bg-neutral-950 aspect-square p-1 transition-all shadow-sm ${
        isMain
          ? "border-2 border-rose-600 dark:border-rose-500 ring-2 ring-rose-600/20"
          : "border border-gray-200 dark:border-neutral-800 hover:border-gray-400"
      } ${isDragging ? "ring-2 ring-rose-500 shadow-xl" : ""}`}
    >
      {item.isUploading ? (
        <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-neutral-900 text-neutral-400 p-2 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-rose-600 dark:text-rose-500 mb-2" />
          <span className="text-[10px] font-bold truncate max-w-full">
            {item.fileName || "Uploading..."}
          </span>
        </div>
      ) : (
        <>
          <Image
            src={item.url}
            alt={item.altText || "Product Image"}
            fill
            sizes="200px"
            className="object-contain p-1 select-none pointer-events-none"
          />

          {/* Drag Handle Button */}
          <div
            {...attributes}
            {...listeners}
            className="absolute left-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 hover:bg-black/80 text-white cursor-grab active:cursor-grabbing backdrop-blur-sm transition-opacity opacity-70 group-hover:opacity-100"
            title="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Main Badge or Set Main Button */}
          {isMain ? (
            <div className="absolute left-10 top-2 z-10">
              <span className="flex items-center gap-1 bg-rose-600 text-white font-black text-[9px] uppercase px-2 py-1 rounded shadow-md tracking-wider">
                <Star className="h-2.5 w-2.5 fill-current text-white" />
                CARD PRIMARY
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onSetMain(item.id)}
              className="absolute left-10 top-2 z-10 hidden group-hover:flex items-center gap-1 bg-neutral-900/90 hover:bg-rose-600 text-white text-[9px] font-bold uppercase px-2 py-1 rounded backdrop-blur-sm transition-colors shadow-sm"
              title="Set as Card Primary Image (Position 0)"
            >
              <Star className="h-2.5 w-2.5" />
              Set Main
            </button>
          )}

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 hover:bg-rose-600 text-white transition-all shadow-sm opacity-70 group-hover:opacity-100"
            title="Delete Image"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>

          {/* Index Pill */}
          <div className="absolute right-2 bottom-2 z-10 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
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
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(images, oldIndex, newIndex);
        onReorder(reordered);
      }
    }
  };

  if (images.length === 0) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((item, index) => (
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
