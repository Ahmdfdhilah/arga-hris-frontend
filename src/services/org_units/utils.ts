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
