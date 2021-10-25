import { MetadataCache, TAbstractFile, TFile, TFolder, Vault } from 'obsidian';
import { get } from 'svelte/store';
import path from 'path';

import { settingsStore } from '~/store';
import { sanitizeTitle, frontMatter as frontMatterUtil } from '~/utils';
import type { Book } from '~/models';

/**
 * Returns a file path for a given book relative to the current Obsidian
 * vault directory. The method also trims leading slashes to help with
 * internal path matching with Obsidian's vault.getFiles method
 */
const bookFilePath = (book: Book): string => {
  const fileName = sanitizeTitle(book.title);
  return path
    .join(get(settingsStore).highlightsFolder, `${fileName}.md`)
    .replace(/\//, '');
};

const SyncingStateKey = 'kindle-sync';

type SyncingState = {
  bookId: string;
  title: string;
  author: string;
  asin: string;
  bookImageUrl: string;
};

export type KindleFile = {
  file: TFile;
  frontmatter: SyncingState;
  book?: Book;
};

export default class FileManager {
  constructor(private vault: Vault, private metadataCache: MetadataCache) {}

  public async readFile(file: KindleFile): Promise<string> {
    return await this.vault.cachedRead(file.file);
  }

  public fileExists(book: Book): [boolean, TFile | undefined] {
    const filePath = bookFilePath(book);
    const file = this.vault.getFiles().find((f) => f.path === filePath);
    return [file != null, file];
  }

  public async getKindleFile(book: Book): Promise<KindleFile | undefined> {
    const allSyncedFiles = await this.getKindleFiles();

    const kindleFile = allSyncedFiles.find(
      (file) => file.frontmatter.bookId === book.id
    );

    return kindleFile == null ? undefined : { ...kindleFile, book };
  }

  public mapToKindleFile(fileOrFolder: TAbstractFile): KindleFile | undefined {
    if (fileOrFolder instanceof TFolder) {
      return undefined;
    }

    const file = fileOrFolder as TFile;

    const fileCache = this.metadataCache.getFileCache(file);

    // File cache can be undefined if this file was just created and not yet cached by Obsidian
    const kindleFrontmatter: SyncingState =
      fileCache?.frontmatter?.[SyncingStateKey];

    if (kindleFrontmatter == null) {
      return undefined;
    }

    const book: Book = {
      id: kindleFrontmatter.bookId,
      title: kindleFrontmatter.title,
      author: kindleFrontmatter.author,
      asin: kindleFrontmatter.asin,
      imageUrl: kindleFrontmatter.bookImageUrl,
    };

    return { file, frontmatter: kindleFrontmatter, book };
  }

  public async getKindleFiles(): Promise<KindleFile[]> {
    return this.vault
      .getMarkdownFiles()
      .map((file) => this.mapToKindleFile(file))
      .filter((file) => file != null);
  }

  public async createFile(book: Book, content: string): Promise<void> {
    const filePath = bookFilePath(book);
    const frontMatterContent = this.generateFileFrontmatter(book, content);
    await this.vault.create(filePath, frontMatterContent);
  }

  public async overrideFile(
    file: TFile,
    book: Book,
    content: string
  ): Promise<void> {
    const frontMatterContent = this.generateFileFrontmatter(book, content);
    this.updateFile(file, frontMatterContent);
  }

  private generateFileFrontmatter(book: Book, content: string): string {
    const frontmatterState: SyncingState = {
      bookId: book.id,
      title: book.title,
      author: book.author,
      asin: book.asin,
      bookImageUrl: book.imageUrl,
    };

    const frontMatterContent = frontMatterUtil.stringify(content, {
      [SyncingStateKey]: frontmatterState,
    });

    return frontMatterContent;
  }

  public async updateFile(file: TFile, content: string): Promise<void> {
    await this.vault.modify(file, content);
  }
}
