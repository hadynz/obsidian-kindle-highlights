import moment from 'moment';
import path from 'path';
import { get } from 'svelte/store';

import type { Book, KindleFrontmatter } from '~/models';
import { getRenderers } from '~/rendering';
import { settingsStore } from '~/store';
import { hash, hash_short } from "~/utils"

/**
 * Returns a file path for a given book relative to the current Obsidian
 * vault directory.
 */
export const bookFilePath = (book: Book): string => {
  const fileName = getRenderers().fileNameRenderer.render(book);
  return path.join(get(settingsStore).highlightsFolder, fileName);
};

export const bookToFrontMatter = (book: Book, highlightsCount: number): KindleFrontmatter => {
  return {
    bookId: book.id,
    title: book.title,
    author: book.author,
    asin: book.asin,
    lastAnnotatedDate: book.lastAnnotatedDate
      ? moment(book.lastAnnotatedDate).format('YYYY-MM-DD')
      : null,
    bookImageUrl: book.imageUrl,
    highlightsCount,
  };
};

export const frontMatterToBook = (frontmatter: KindleFrontmatter): Book => {
  const formats = ['MMM DD, YYYY', 'YYYY-MM-DD'];
  let book_id: string = frontmatter.bookId
  // If this note is still using a fletcher ID or an md5 without marker, convert it to MD5 for comparison
  if (frontmatter.bookId == hash_short(frontmatter.title)) {
    book_id = "md5:" + hash(frontmatter.title)
  } else if (frontmatter.bookId == hash(frontmatter.title)) {
    book_id = "md5:" + hash(frontmatter.title)
  }
  return {
    id: book_id,
    title: frontmatter.title,
    author: frontmatter.author,
    asin: frontmatter.asin,
    lastAnnotatedDate: frontmatter.lastAnnotatedDate
      ? moment(frontmatter.lastAnnotatedDate, formats).toDate()
      : null,
    imageUrl: frontmatter.bookImageUrl,
  };
};
