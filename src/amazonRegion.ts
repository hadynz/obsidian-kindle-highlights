import _ from 'lodash';
import { get } from 'svelte/store';

import type { AmazonAccount, AmazonAccountRegion } from '~/models';
import { settingsStore } from '~/store';

export const AmazonRegions: Record<AmazonAccountRegion, AmazonAccount> = {
  global: {
    name: 'Global',
    hostname: 'amazon.com',
    kindleReaderUrl: 'https://read.amazon.com',
    notebookUrl: 'https://read.amazon.com/notebook',
  },
  india: {
    name: 'India',
    hostname: 'amazon.in',
    kindleReaderUrl: 'https://read.amazon.in',
    notebookUrl: 'https://read.amazon.in/notebook',
  },
  japan: {
    name: 'Japan',
    hostname: 'amazon.co.jp',
    kindleReaderUrl: 'https://read.amazon.co.jp',
    notebookUrl: 'https://read.amazon.co.jp/notebook',
  },
  spain: {
    name: 'Spain',
    hostname: 'amazon.es',
    kindleReaderUrl: 'https://leer.amazon.es',
    notebookUrl: 'https://leer.amazon.es/notebook',
  },
  germany: {
    name: 'Germany/Swiss/Austria',
    hostname: 'amazon.de',
    kindleReaderUrl: 'https://lesen.amazon.de',
    notebookUrl: 'https://lesen.amazon.de/notebook',
  },
  italy: {
    name: 'Italy',
    hostname: 'amazon.it',
    kindleReaderUrl: 'https://leggi.amazon.it',
    notebookUrl: 'https://leggi.amazon.it/notebook',
  },
  UK: {
    name: 'UK',
    hostname: 'amazon.co.uk',
    kindleReaderUrl: 'https://read.amazon.co.uk',
    notebookUrl: 'https://read.amazon.co.uk/notebook',
  },
  france: {
    name: 'France',
    hostname: 'amazon.fr',
    kindleReaderUrl: 'https://lire.amazon.fr',
    notebookUrl: 'https://lire.amazon.fr/notebook',
  },
  canada: {
    name: 'Canada',
    hostname: 'amazon.ca',
    kindleReaderUrl: 'https://read.amazon.ca',
    notebookUrl: 'https://read.amazon.ca/notebook',
  },
};

export const currentAmazonRegion = (): AmazonAccount => {
  const selectedRegion = get(settingsStore).amazonRegion;
  return AmazonRegions[selectedRegion];
};

export const orderedAmazonRegions = (): AmazonAccountRegion[] => {
  const keys = Object.keys(AmazonRegions) as AmazonAccountRegion[];

  // Remove 'global' as we will add it manually again top of the list
  _.remove(keys, (key) => key === 'global');

  const orderedKeys = _.orderBy(keys, (key) => key.toLowerCase(), 'asc');
  return ['global', ...orderedKeys];
};
