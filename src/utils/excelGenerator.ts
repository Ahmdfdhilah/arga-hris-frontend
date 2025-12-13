// Excel Generator Utils
// Generic utilities untuk generate Excel files dengan support multi-sheet, merged cells, dan dynamic headers
// Bisa dipakai untuk berbagai keperluan export Excel di aplikasi

import ExcelJS from 'exceljs';

// ==================== Types ====================

/**
 * Config untuk generate Excel
 */
export interface ExcelConfig {
  filename: string;
  sheets: SheetConfig[];
}

/**
 * Config untuk single sheet
 */
export interface SheetConfig {
  sheetName: string;
  title?: string;
  description?: string;
  data: SheetData;
}

/**
 * Data untuk sheet dengan flexible header structure
 */
export interface SheetData {
  headers: HeaderRow[];
  rows: CellValue[][];
  columnWidths?: number[];
}

/**
 * Header row yang bisa berisi merged cells
 */
export interface HeaderRow {
  cells: HeaderCell[];
}

/**
 * Single header cell dengan optional merge
 */
export interface HeaderCell {
  value: string;
  colSpan?: number;
  rowSpan?: number;
}

/**
 * Cell value types
 */
export type CellValue = string | number | boolean | Date | null | undefined | StyledCell;

/**
 * Cell with styling
 */
export interface StyledCell {
  value: string | number | boolean | Date | null | undefined;
  style?: {
    font?: {
      bold?: boolean;
      color?: { rgb: string };
      sz?: number;
    };
    fill?: {
      fgColor?: { rgb: string };
    };
    alignment?: {
      horizontal?: 'left' | 'center' | 'right';
      vertical?: 'top' | 'middle' | 'bottom'; // ExcelJS uses 'middle' not 'center'
    };
  };
}

// ==================== Generic Excel Generator ====================

/**
 * Generate Excel file dari config
 *
 * @param config - Excel configuration dengan multiple sheets
 * @returns Promise<Blob> yang bisa di-download
 *
 * @example
 * ```typescript
 * const config: ExcelConfig = {
 *   filename: 'report.xlsx',
 *   sheets: [{
 *     sheetName: 'Sheet1',
 *     title: 'Report Title',
 *     description: 'Report description',
 *     data: {
 *       headers: [
 *         { cells: [{ value: 'Name' }, { value: 'Age' }] }
 *       ],
 *       rows: [
 *         ['John', 25],
 *         ['Jane', 30]
 *       ]
 *     }
 *   }]
 * };
 *
 * const blob = await generateExcelFile(config);
 * downloadBlob(blob, config.filename);
 * ```
 */
export async function generateExcelFile(config: ExcelConfig): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ARGA HRIS';
  workbook.created = new Date();

  config.sheets.forEach((sheetConfig) => {
    createWorksheet(workbook, sheetConfig);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
}

/**
 * Create worksheet dari sheet config
 */
function createWorksheet(workbook: ExcelJS.Workbook, config: SheetConfig): void {
  const worksheet = workbook.addWorksheet(config.sheetName);

  let currentRowNumber = 1;

  // Add title jika ada
  if (config.title) {
    const titleRow = worksheet.getRow(currentRowNumber);
    titleRow.getCell(1).value = config.title;
    titleRow.getCell(1).font = { bold: true, size: 14 };
    currentRowNumber++;
  }

  // Add description jika ada
  if (config.description) {
    const descRow = worksheet.getRow(currentRowNumber);
    descRow.getCell(1).value = config.description;
    descRow.getCell(1).font = { size: 10 };
    currentRowNumber++;
  }

  // Add empty row after title/description
  if (config.title || config.description) {
    currentRowNumber++;
  }

  // Process headers dengan merge support
  config.data.headers.forEach((headerRow) => {
    const row = worksheet.getRow(currentRowNumber);
    let currentCol = 1;

    headerRow.cells.forEach((cell) => {
      const rowSpan = cell.rowSpan || 1;
      const colSpan = cell.colSpan || 1;

      // Skip empty cells (untuk merged cells dari row sebelumnya)
      if (cell.value !== '') {
        const excelCell = row.getCell(currentCol);
        excelCell.value = cell.value;

        // Apply header styling
        excelCell.font = { bold: true };
        excelCell.alignment = { horizontal: 'center', vertical: 'middle' };
        excelCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };
        excelCell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };

        // Merge cells jika perlu
        if (rowSpan > 1 || colSpan > 1) {
          worksheet.mergeCells(
            currentRowNumber,
            currentCol,
            currentRowNumber + rowSpan - 1,
            currentCol + colSpan - 1
          );
        }
      }

      currentCol += colSpan;
    });

    currentRowNumber++;
  });

  // Process data rows
  config.data.rows.forEach((rowData) => {
    const row = worksheet.getRow(currentRowNumber);

    rowData.forEach((cellValue, colIndex) => {
      const cell = row.getCell(colIndex + 1);
      applyCellValue(cell, cellValue);
    });

    currentRowNumber++;
  });

  // Set column widths
  if (config.data.columnWidths) {
    config.data.columnWidths.forEach((width, index) => {
      const col = worksheet.getColumn(index + 1);
      col.width = width;
    });
  }
}

/**
 * Apply cell value dengan type detection dan styling
 */
function applyCellValue(cell: ExcelJS.Cell, value: CellValue): void {
  // Handle StyledCell
  if (typeof value === 'object' && value !== null && 'value' in value) {
    const styledCell = value as StyledCell;

    // Set cell value
    applyCellValue(cell, styledCell.value);

    // Apply custom styling
    if (styledCell.style) {
      if (styledCell.style.font) {
        cell.font = {
          bold: styledCell.style.font.bold,
          color: styledCell.style.font.color
            ? { argb: 'FF' + styledCell.style.font.color.rgb }
            : undefined,
          size: styledCell.style.font.sz
        };
      }

      if (styledCell.style.fill) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF' + styledCell.style.fill.fgColor?.rgb }
        };
      }

      if (styledCell.style.alignment) {
        cell.alignment = {
          horizontal: styledCell.style.alignment.horizontal as any,
          vertical: styledCell.style.alignment.vertical as any
        };
      }
    }

    // Add border to all data cells
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    return;
  }

  // Handle primitive values
  if (value === null || value === undefined) {
    cell.value = '';
  } else if (typeof value === 'number') {
    cell.value = value;
  } else if (typeof value === 'boolean') {
    cell.value = value;
  } else if (value instanceof Date) {
    cell.value = value;
  } else {
    cell.value = String(value);
  }

  // Add border to all data cells
  cell.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };
}

/**
 * Download blob as file
 * 
 * @param blob - Blob to download
 * @param filename - Filename
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Sanitize sheet name (max 31 chars, remove invalid chars)
 */
export function sanitizeSheetName(name: string): string {
  return name
    .replace(/[:\\/?*\[\]]/g, '')
    .substring(0, 31);
}

/**
 * Sanitize filename (remove invalid chars)
 */
export function sanitizeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, '_');
}
