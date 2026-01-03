import { Role } from '@/lib/auth/roles';
import { PurchaseStatus } from '@shared/enums/purchase-status.enum';

export type PurchaseField =
  | 'entryNumber'
  | 'entryDate'
  | 'status'
  | 'site'
  | 'lastStatusChangedAt'
  | 'contractSubject'
  | 'supplierName'
  | 'smp'
  | 'supplierInn'
  | 'purchaseAmount'
  | 'initialPrice'
  | 'contractNumber'
  | 'contractDate'
  | 'validFrom'
  | 'validTo'
  | 'contractEnd'
  | 'placementDate'
  | 'methodOfPurchase'
  | 'documentNumber'
  | 'completed'
  | 'savings'
  | 'performanceAmount'
  | 'performanceForm'
  | 'additionalAgreementNumber'
  | 'currentContractAmount'
  | 'remainingContractAmount'
  | 'publication'
  | 'responsible'
  | 'planNumber'
  | 'applicationAmount'
  | 'comment'
  | 'bankGuaranteeValidFrom'
  | 'bankGuaranteeValidTo';

const ALL_FIELDS: PurchaseField[] = [
  /* перечислите все как выше */
] as any;

const except = (arr: PurchaseField[], ex: PurchaseField[]) =>
  arr.filter((x) => !ex.includes(x));

export type PurchaseFormPolicy = {
  canCreate: boolean;
  canEdit: boolean;
  // какие поля вообще показывать в UI (для create админа можно урезать)
  visibleFields: Set<PurchaseField>;
  // какие поля можно изменять (остальные disabled)
  editableFields: Set<PurchaseField>;
  // принудительные значения (например статус "В работе" для Admin-create)
  forcedValues?: Partial<Record<PurchaseField, any>>;
};

export function buildPurchaseFormPolicy(params: {
  roles: string[];
  mode: 'create' | 'edit' | 'view';
}): PurchaseFormPolicy {
  const { roles, mode } = params;

  const is = (r: Role) => roles.includes(r);

  // по умолчанию: всё видно, ничего не редактируется
  let visible = new Set<PurchaseField>(ALL_FIELDS);
  let editable = new Set<PurchaseField>();
  let canCreate = false;
  let canEdit = false;
  let forcedValues: PurchaseFormPolicy['forcedValues'];

  if (is(Role.SeniorAdmin)) {
    canCreate = true;
    canEdit = mode !== 'view';
    visible = new Set(ALL_FIELDS);
    editable = new Set(except(ALL_FIELDS, ['entryDate'])); // нельзя менять дату создания
  } else if (is(Role.Procurement)) {
    canCreate = true;
    canEdit = mode !== 'view';
    visible = new Set(ALL_FIELDS);
    editable = new Set(except(ALL_FIELDS, ['entryNumber', 'entryDate']));
  } else if (is(Role.Admin)) {
    canCreate = true;
    canEdit = false;

    if (mode === 'create') {
      // показываем и редактируем только 3 поля, остальное скрываем
      visible = new Set<PurchaseField>([
        'entryNumber',
        'site',
        'contractSubject',
        'status',
        'entryDate',
      ]);
      editable = new Set<PurchaseField>([
        'entryNumber',
        'site',
        'contractSubject',
      ]);
      forcedValues = { status: PurchaseStatus.InProgress };
    } else {
      // edit/view: всё видно, всё disabled
      visible = new Set(ALL_FIELDS);
      editable = new Set();
    }
  } else if (is(Role.Statistic)) {
    canCreate = false;
    canEdit = false;
    visible = new Set(ALL_FIELDS);
    editable = new Set();
  } else if (is(Role.Initiator)) {
    canCreate = false;
    canEdit = false;
    visible = new Set(ALL_FIELDS);
    editable = new Set();
  }

  return {
    canCreate,
    canEdit,
    visibleFields: visible,
    editableFields: editable,
    forcedValues,
  };
}

export function filterByEditable(values: any, editable: Set<PurchaseField>) {
  const out: any = {};
  for (const k of editable) {
    if (k in values) out[k] = values[k];
  }
  return out;
}
