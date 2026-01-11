export const PURCHASE_CATEGORIES = [
  'IT',
  'FOOD',
  'EQUIPMENT',
  'CONSUMABLES',
] as const;

export type PurchaseCategory = (typeof PURCHASE_CATEGORIES)[number];

// (опционально) подписи для UI
export const PURCHASE_CATEGORY_LABEL: Record<PurchaseCategory, string> = {
  IT: 'ИТ',
  FOOD: 'Еда',
  EQUIPMENT: 'Оборудование',
  CONSUMABLES: 'Расходники',
};
