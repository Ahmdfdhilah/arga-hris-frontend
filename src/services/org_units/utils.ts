import { orgUnitsService } from './service';
import type { OrgUnit, OrgUnitHierarchy } from './types';

export async function getOrgUnitFullPath(orgUnitId: number): Promise<string> {
  try {
    const response = await orgUnitsService.getOrgUnit(orgUnitId);
    return response.data.path;
  } catch (error) {
    console.error('Error mendapatkan path unit organisasi:', error);
    return '';
  }
}

export async function isOrgUnitActive(orgUnitId: number): Promise<boolean> {
  try {
    const response = await orgUnitsService.getOrgUnit(orgUnitId);
    return response.data.is_active;
  } catch (error) {
    console.error('Error mengecek status unit organisasi:', error);
    return false;
  }
}

export function formatOrgUnitDisplay(orgUnit: OrgUnit): string {
  return `${orgUnit.code} - ${orgUnit.name}`;
}

export function getOrgUnitLevel(orgUnit: OrgUnit): number {
  return orgUnit.level;
}

export function buildOrgUnitBreadcrumb(hierarchy: OrgUnitHierarchy): string[] {
  const breadcrumb: string[] = [];

  hierarchy.ancestors.forEach(ancestor => {
    breadcrumb.push(ancestor.name);
  });

  breadcrumb.push(hierarchy.current.name);

  return breadcrumb;
}

export async function getOrgUnitAncestors(orgUnitId: number): Promise<OrgUnit[]> {
  try {
    const response = await orgUnitsService.getOrgUnitHierarchy(orgUnitId);
    return response.data.ancestors;
  } catch (error) {
    console.error('Error mendapatkan ancestor unit organisasi:', error);
    return [];
  }
}

export async function hasChildren(orgUnitId: number): Promise<boolean> {
  try {
    const response = await orgUnitsService.getOrgUnitChildren(orgUnitId, { page: 1, limit: 1 });
    return (response.meta?.total_items ?? 0) > 0;
  } catch (error) {
    console.error('Error mengecek children unit organisasi:', error);
    return false;
  }
}

export function validateOrgUnitCode(code: string): { valid: boolean; error?: string } {
  if (!code || !code.trim()) {
    return { valid: false, error: 'Kode unit organisasi tidak boleh kosong' };
  }

  const cleaned = code.trim().toUpperCase();

  if (!/^[A-Z0-9_-]+$/.test(cleaned)) {
    return {
      valid: false,
      error: 'Kode unit organisasi hanya boleh mengandung huruf, angka, dash, dan underscore'
    };
  }

  if (cleaned.length > 50) {
    return { valid: false, error: 'Kode unit organisasi maksimal 50 karakter' };
  }

  return { valid: true };
}

export function sortOrgUnitsByLevel(orgUnits: OrgUnit[]): OrgUnit[] {
  return [...orgUnits].sort((a, b) => a.level - b.level);
}

export function filterActiveOrgUnits(orgUnits: OrgUnit[]): OrgUnit[] {
  return orgUnits.filter(unit => unit.is_active);
}

// ===== Org Unit Type Badge Utils (SSOT) =====

export type OrgUnitTypeValue = 'Direktorat' | 'Managerial' | 'Operasional';

interface TypeBadgeConfig {
  label: string;
  className: string;
}

const TYPE_BADGE_CONFIGS: Record<OrgUnitTypeValue, TypeBadgeConfig> = {
  Direktorat: {
    label: 'Direktorat',
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  },
  Managerial: {
    label: 'Managerial',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  Operasional: {
    label: 'Operasional',
    className: 'bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300',
  },
};

const DEFAULT_BADGE_CONFIG: TypeBadgeConfig = {
  label: 'Unknown',
  className: 'bg-muted text-muted-foreground',
};

export function getOrgUnitTypeBadgeConfig(type: string): TypeBadgeConfig {
  return TYPE_BADGE_CONFIGS[type as OrgUnitTypeValue] ?? { ...DEFAULT_BADGE_CONFIG, label: type };
}

export function getOrgUnitTypeBadgeClassName(type: string): string {
  return getOrgUnitTypeBadgeConfig(type).className;
}
