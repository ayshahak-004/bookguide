"use client";

import Image from "next/image";
import type { Badges, Row } from "@/lib/rows";
import type { Book } from "@/lib/group";
import { StoreRow } from "./StoreRow";

export function BookCard({ book, rows, badges }: { book: Book; rows: Row[]; badges: Badges }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
        {book.image_url && (
          <Image
            src={book.image_url}
            alt={book.title}
            width={64}
            height={96}
            unoptimized
            className="h-24 w-16 flex-shrink-0 rounded object-cover"
          />
        )}
        <div>
          <h2 className="text-lg font-bold text-navy">{book.title}</h2>
          {book.author && <p className="text-sm text-neutral-600">{book.author}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <StoreRow key={`${row.listing.store}:${row.listing.url}`} row={row} badges={badges} />
        ))}
      </div>
    </section>
  );
}
