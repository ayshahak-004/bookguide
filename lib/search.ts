import Fuse from "fuse.js";
import { normalizeArabic } from "./arabic";
import type { Book } from "./group";

export interface SearchableBook extends Book {
  search_title: string;
  search_author: string;
}

export function createSearchIndex(books: Book[]) {
  const searchable: SearchableBook[] = books.map((book) => ({
    ...book,
    search_title: normalizeArabic(book.title),
    search_author: book.author ? normalizeArabic(book.author) : "",
  }));

  return new Fuse(searchable, {
    keys: [
      { name: "search_title", weight: 2 },
      { name: "search_author", weight: 1 },
      { name: "isbn", weight: 1.5 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
  });
}

export function searchBooks(fuse: Fuse<SearchableBook>, query: string): Book[] {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const normalized = normalizeArabic(trimmed);
  return fuse.search(normalized).map((result) => result.item);
}
