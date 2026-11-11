"use client";

import Image from "next/image";
import type { Badges, Row } from "@/lib/rows";
import type { Book } from "@/lib/group";
import { StoreRow } from "./StoreRow";

export function BookCard({ book, rows, badges }: { book: Book; rows: Row[]; badges: Badges }) {
  return (
    <section className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm">
      {book.image_url && (
        <div className="relative w-20 flex-shrink-0 self-stretch overflow-hidden rounded-lg sm:w-28">
          <Image
            src={book.image_url}
            alt={book.title}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-bold text-navy">{book.title}</h2>
        {book.author && <p className="text-sm text-neutral-600">{book.author}</p>}

        <div className="mt-2 divide-y divide-navy/10">
          {rows.map((row) => (
            <StoreRow key={`${row.listing.store}:${row.listing.url}`} row={row} badges={badges} />
          ))}
        </div>
      </div>
    </section>
  );
}
