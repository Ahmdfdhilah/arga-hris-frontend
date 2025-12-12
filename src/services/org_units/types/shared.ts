export const ORG_UNIT_COMMON_TYPES = [
  'company',
  'division',
  'department',
  'section',
  'team',
  'branch',
  'region',
] as const;

export type OrgUnitCommonType = typeof ORG_UNIT_COMMON_TYPES[number];
