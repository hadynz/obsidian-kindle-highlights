export type Book = {
  id: string;
  title: string;
  author: string;
  asin?: string;
  url?: string;
  imageUrl?: string;
  lastAnnotatedDate?: Date;
};

export type Highlight = {
  id: string;
  text: string;
  location?: string;
  page?: string;
  note?: string;
  color?: 'pink' | 'blue' | 'yellow' | 'orange';
};

export type BookHighlight = {
  book: Book;
  highlights: Highlight[];
  metadata?: BookMetadata;
};

export type BookMetadata = {
  isbn?: string;
  pages: string;
  publication: string;
  publisher: string;
  authorUrl: string;
};

export type RenderTemplate = Book &
  BookMetadata & {
    fullTitle: string;
    appLink?: string;
    highlights: string;
  };

export type SyncMode = 'amazon' | 'my-clippings';

export type AmazonAccountRegion = 'global' | 'india' | 'japan' | 'spain';

export type AmazonAccount = {
  name: string;
  hostname: string;
  kindleReaderUrl: string;
  notebookUrl: string;
};
