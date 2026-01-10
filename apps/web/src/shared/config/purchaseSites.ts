import { PurchaseSite } from '@/shared/enums/purchase-site.enum';

export const PURCHASE_SITE_OPTIONS = Object.values(PurchaseSite).map((v) => ({
  value: v,
  label: v,
}));
