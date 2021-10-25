import type { App } from 'obsidian';
import { get } from 'svelte/store';

import { settingsStore } from '~/store';
import { scrapeBookMetadata } from '~/scraper';
import { DiffManager } from './diffManager';
import { Renderer } from '~/renderer';
import { ResyncBookModal, OverwriteFileModal } from '~/components/resyncModal';
import type FileManager from '~/fileManager';
import type { KindleFile } from '~/fileManager';
import type { Book, BookMetadata, Highlight } from '~/models';
import type { DiffResult } from './diffManager';

export default class SyncManager {
  private renderer: Renderer;

  constructor(private app: App, private fileManager: FileManager) {
    this.fileManager = fileManager;
    this.renderer = new Renderer();
  }

  public async syncBook(book: Book, highlights: Highlight[]): Promise<void> {
    if (highlights.length === 0) {
      return; // No highlights for book. Skip sync
    }

    const file = await this.fileManager.getKindleFile(book);

    if (file == null) {
      await this.createBook(book, highlights);
      return;
    }

    const result = await new ResyncBookModal(this.app).show(book);

    if (result === 'resync') {
      await this.resyncBook(file, highlights);
    }
  }

  public async resyncBook(
    file: KindleFile,
    highlights: Highlight[]
  ): Promise<DiffResult[]> {
    const diffManager = await DiffManager.create(this.fileManager, file);

    const diffs = await diffManager.diff(highlights);

    if (diffs.length > 0) {
      await diffManager.applyDiffs(diffs);
    }

    return diffs;
  }

  private async createBook(book: Book, highlights: Highlight[]): Promise<void> {
    let createFile = true;

    // Does a non-Kindle file with the same name already exist?
    const [exists, existingFile] = this.fileManager.fileExists(book);

    if (exists) {
      const result = await new OverwriteFileModal(this.app).show(book);

      if (result === 'skip') {
        return; //  Skip creation of this book
      }

      createFile = false;
    }

    const metadata = await this.syncMetadata(book);
    const content = this.renderer.render({ book, highlights, metadata });

    if (createFile) {
      await this.fileManager.createFile(book, content);
    } else {
      await this.fileManager.overrideFile(existingFile, book, content);
    }
  }

  private async syncMetadata(book: Book): Promise<BookMetadata> {
    let metadata: BookMetadata;

    try {
      if (get(settingsStore).downloadBookMetadata && book.asin) {
        metadata = await scrapeBookMetadata(book);
      }
    } catch (error) {
      console.error(`Couldn't download metadata for ${book.title}`, error);
    }

    return metadata;
  }
}
