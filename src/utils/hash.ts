import fletcher16 from 'fletcher';
import { Md5 } from 'ts-md5';

export const hash = (value: string): string => {
  return Md5.hashStr(value.toLowerCase());
};

export const hash_short = (value: string): string => {
  return fletcher16(Buffer.from(value.toLowerCase())).toString();
};