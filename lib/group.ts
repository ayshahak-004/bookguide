import { normalizeArabic } from "./arabic";
import type { Listing } from "./types";

export interface Book {
  key: string;
  title: string;
  author?: string;
  isbn?: string;
  image_url?: string;
  listings: Listing[];
}

// Groups listings into one Book per real-world book: listings sharing an
// ISBN are the same book; otherwise listings are matched by normalized
// title (catches the same title typed slightly differently across stores).
export function groupListings(listings: Listing[]): Book[] {
  const books = new Map<string, Book>();

  for (const listing of listings) {
    const key = listing.isbn
      ? `isbn:${listing.isbn}`
      : `title:${normalizeArabic(listing.title)}`;

    let book = books.get(key);
    if (!book) {
      book = {
        key,
        title: listing.title,
        author: listing.author,
        isbn: listing.isbn,
        image_url: listing.image_url,
        listings: [],
      };
      books.set(key, book);
    }

    book.listings.push(listing);
    if (!book.author && listing.author) book.author = listing.author;
    if (!book.image_url && listing.image_url) book.image_url = listing.image_url;
  }

  return [...books.values()];
}
