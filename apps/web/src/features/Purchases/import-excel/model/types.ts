export type Mode = 'upsert' | 'insert';

export type BatchResponse = {
  inserted?: number;
  upserted?: number;
  modified?: number;
  matched?: number;
};
