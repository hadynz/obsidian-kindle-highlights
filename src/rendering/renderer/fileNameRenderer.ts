import nunjucks, { Environment } from 'nunjucks';
import sanitize from 'sanitize-filename';

import type { Book, BookMetadata } from '~/models';

import { fileNameTemplateVariables } from './templateVariables';

export default class FileNameRenderer {
  private nunjucks: Environment;

  constructor(private template: string) {
    this.nunjucks = new nunjucks.Environment(null, { autoescape: false });
  }

  public validate(template: string): boolean {
    try {
      this.nunjucks.renderString(template ?? '', {});
      return true;
    } catch (error) {
      return false;
    }
  }

  public render(book: Partial<Book>, metadata: Partial<BookMetadata>): string {
    const templateVariables = fileNameTemplateVariables(book, metadata);

    const fileName = this.nunjucks.renderString(this.template, templateVariables);

    return `${sanitize(fileName)}.md`;
  }
}
