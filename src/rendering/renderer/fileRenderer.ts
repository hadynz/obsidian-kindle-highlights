import _ from 'lodash';
import { Environment } from 'nunjucks';

import type { BookHighlight, Highlight, RenderedHighlight } from '~/models';

import { TrimAllEmptyLinesExtension } from '../nunjucks.extensions';

import HighlightRenderer from './highlightRenderer';
import { fileTemplateVariables } from './templateVariables';

const clippingType = (note: string): RenderedHighlight['type'] => {
  switch (note) {
    case '.h1':
      return 'heading1';
    case '.h2':
      return 'heading2';
    case '.h3':
      return 'heading3';
    case '.h4':
      return 'heading4';
    default:
      return 'clipping';
  }
};

const concatenate = (highlights: Highlight[]): Highlight[] => {
  if (highlights.length < 2) {
    return highlights;
  }

  const text = highlights
    .map((highlight) => highlight.text.replace(/\.$/, ''))
    .map((text, index) => {
      return index > 0 ? _.lowerFirst(text) : text;
    })
    .join('... ');

  return [{ ...highlights[highlights.length - 1], text, note: null }];
};

const noteConcatCount = (highlight: Highlight | null): number => {
  const matches = /.c(.*)/.exec(highlight?.note);
  return matches ? +matches[1] : null;
};

export const mapToRenderedHighlights = (entry: Highlight[]): RenderedHighlight[] => {
  let clippingsCache: Highlight[] = [];

  const concatenatedClips = entry.reduce(
    (accum, currentHighlight: Highlight, index: number) => {
      const currentConcatCount = noteConcatCount(currentHighlight);
      const previousConcatCount = noteConcatCount(clippingsCache[clippingsCache.length - 1]);

      // Current highlight doesn't have a special concat notation in note
      if (currentConcatCount == null) {
        accum = accum.concat(concatenate(clippingsCache)); // Flush anything in cache
        clippingsCache = []; // Reset cache

        accum.push(currentHighlight); // Add current highlight
      }

      // Current highlight is an increment over previous; add to cache
      if (currentConcatCount > previousConcatCount) {
        clippingsCache.push(currentHighlight);
      } else if (clippingsCache.length > 0) {
        accum = accum.concat(concatenate(clippingsCache)); // Flush anything in cache
        clippingsCache = []; // Reset cache

        clippingsCache.push(currentHighlight);
      }

      // No more clippings? Then flush!
      if (index === entry.length - 1) {
        accum = accum.concat(concatenate(clippingsCache)); // Flush anything in cache
        clippingsCache = []; // Reset cache
      }

      return accum;
    },
    [] as Highlight[]
  );

  // TODO: Modify all `text` and add `ref-` as suffix
  return concatenatedClips.map((e) => ({ ...e, type: clippingType(e.note) }));
};

export default class FileRenderer {
  private nunjucks: Environment;
  private highlightRenderer: HighlightRenderer;

  constructor(private fileTemplate: string, highlightTemplate: string) {
    this.nunjucks = new Environment(null, { autoescape: false });
    this.nunjucks.addExtension('Trim', new TrimAllEmptyLinesExtension());

    this.highlightRenderer = new HighlightRenderer(highlightTemplate);
  }

  public validate(template: string): boolean {
    try {
      this.nunjucks.renderString(template ?? '', { text: '' });
      return true;
    } catch (error) {
      return false;
    }
  }

  public render(entry: BookHighlight): string {
    const { book, highlights } = entry;

    const renderedHighlights = mapToRenderedHighlights(highlights)
      .map((h) => this.highlightRenderer.render(h, book))
      .join('\n');

    const templateVariables = fileTemplateVariables(entry, renderedHighlights);

    return this.nunjucks.renderString(this.fileTemplate, templateVariables);
  }
}
