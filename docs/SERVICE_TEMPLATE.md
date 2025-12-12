# Service Template

Template untuk membuat service module baru.

## Step 1: Backend Preparation

### 1.1 Baca Backend Router

```bash
arga_web_backend/arga-hris-service/app/modules/[MODULE]/routers/
```

Catat semua:
- Endpoint paths
- HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Route parameters
- Query parameters
- Request body schemas
- Response schemas

### 1.2 Baca Backend Schemas

```bash
arga_web_backend/arga-hris-service/app/modules/[MODULE]/schemas/
```

Catat semua:
- Request schemas
- Response schemas
- Validation rules

## Step 2: Create Folder Structure

```bash
mkdir -p src/services/[module]/types
touch src/services/[module]/service.ts
touch src/services/[module]/utils.ts
touch src/services/[module]/index.ts
touch src/services/[module]/types/request.ts
touch src/services/[module]/types/response.ts
touch src/services/[module]/types/shared.ts
touch src/services/[module]/types/index.ts
```

## Step 3: Define Types

### types/response.ts

```typescript
export interface [Entity] {
  id: number;
  field1: string;
  field2: number;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface [Entity]WithRelations extends [Entity] {
  relation1?: any;
  relation2?: any[];
}

export interface [Entity]Stats {
  total: number;
  active: number;
  inactive: number;
}
```

### types/request.ts

```typescript
export interface Create[Entity]Request {
  field1: string;
  field2: number;
  field3?: string;
}

export interface Update[Entity]Request {
  field1?: string;
  field2?: number;
  field3?: string;
}

export interface [Entity]FilterParams {
  status?: string;
  category?: string;
  date_from?: string;
  date_to?: string;
}
```

### types/shared.ts

```typescript
export enum [Entity]Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

export const [ENTITY]_STATUS_OPTIONS = [
  { value: [Entity]Status.ACTIVE, label: 'Active' },
  { value: [Entity]Status.INACTIVE, label: 'Inactive' },
  { value: [Entity]Status.PENDING, label: 'Pending' },
];
```

### types/index.ts

```typescript
export * from './request';
export * from './response';
export * from './shared';
```

## Step 4: Create Service

### service.ts

PENTING: BaseService methods return type generic `T` langsung.
Setiap method service HARUS explicitly specify complete return type.

```typescript
import { BaseService } from '../base/service';
import type { ApiResponse, PaginatedApiResponse, PaginationParams } from '../base/types';
import type {
  [Entity],
  [Entity]WithRelations,
  Create[Entity]Request,
  Update[Entity]Request,
  [Entity]FilterParams,
} from './types';

class [Module]Service extends BaseService {
  constructor() {
    super('/[module-path]');
  }

  // GET list - return PaginatedApiResponse
  async getList(params?: PaginationParams & [Entity]FilterParams): Promise<PaginatedApiResponse<[Entity]>> {
    return this.get<PaginatedApiResponse<[Entity]>>('', params);
  }

  // GET single - return ApiResponse
  async getById(id: number): Promise<ApiResponse<[Entity]WithRelations>> {
    return this.get<ApiResponse<[Entity]WithRelations>>(`/${id}`);
  }

  // POST create - return ApiResponse
  async create(request: Create[Entity]Request): Promise<ApiResponse<[Entity]>> {
    return this.post<ApiResponse<[Entity]>>('', request);
  }

  // PUT update - return ApiResponse
  async update(id: number, request: Update[Entity]Request): Promise<ApiResponse<[Entity]>> {
    return this.put<ApiResponse<[Entity]>>(`/${id}`, request);
  }

  // PATCH partial update - return ApiResponse
  async partialUpdate(id: number, request: Partial<Update[Entity]Request>): Promise<ApiResponse<[Entity]>> {
    return this.patch<ApiResponse<[Entity]>>(`/${id}`, request);
  }

  // DELETE - return ApiResponse
  async delete(id: number): Promise<ApiResponse<null>> {
    return this.delete<ApiResponse<null>>(`/${id}`);
  }
}

export const [module]Service = new [Module]Service();
export default [module]Service;
```

**CATATAN PENTING:**
- BaseService methods (`get`, `post`, `put`, `patch`, `delete`) return generic type `T`
- SELALU specify complete return type: `this.get<ApiResponse<T>>` atau `this.get<PaginatedApiResponse<T>>`
- Jangan gunakan `this.get<T>` saja, harus wrapped dalam ApiResponse atau PaginatedApiResponse
- GET list endpoints SELALU return `PaginatedApiResponse<T>`
- GET single, POST, PUT, PATCH, DELETE return `ApiResponse<T>`

## Step 5: Create Utils

### utils.ts

```typescript
import { [module]Service } from './service';
import type { [Entity], [Entity]Status } from './types';

export async function check[Entity]Status(id: number): Promise<[Entity]Status | null> {
  try {
    const response = await [module]Service.getById(id);
    return response.data.status as [Entity]Status;
  } catch (error) {
    console.error('Error checking [entity] status:', error);
    return null;
  }
}

export function format[Entity]Display(entity: [Entity]): string {
  return `${entity.field1} - ${entity.field2}`;
}

export function validate[Entity]Input(input: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.field1) {
    errors.push('Field1 is required');
  }

  if (input.field2 < 0) {
    errors.push('Field2 must be positive');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function transform[Entity]ForDisplay(entity: [Entity]) {
  return {
    ...entity,
    displayName: format[Entity]Display(entity),
    formattedDate: new Date(entity.created_at).toLocaleDateString(),
  };
}
```

## Step 6: Export Module

### [module]/index.ts

```typescript
export * from './service';
export * from './types';
export * from './utils';
```

### services/index.ts

```typescript
export * from './base';
export * from './auth';
export * from './users';
export * from './[module]';
```

## Step 7: Integration Checklist

- [ ] Backend endpoints sudah tersedia
- [ ] Types sudah match dengan backend schemas
- [ ] Service methods sudah mapping 1:1 dengan endpoints
- [ ] Utils berisi helper functions, tidak ada di service
- [ ] Export pattern sudah benar
- [ ] Import types dari module sendiri, bukan dari base
- [ ] Service extends BaseService
- [ ] Return types menggunakan ApiResponse atau PaginatedApiResponse
- [ ] Test service dengan actual API call
- [ ] Update documentation jika perlu

## Example: Employees Module

### Folder Structure

```
src/services/employees/
├── service.ts
├── utils.ts
├── types/
│   ├── request.ts
│   ├── response.ts
│   ├── shared.ts
│   └── index.ts
└── index.ts
```

### Backend Reference

```
arga_web_backend/arga-hris-service/app/modules/employees/
├── routers/
│   └── employees.py
└── schemas/
    ├── employee.py
    └── employee_request.py
```

### service.ts

```typescript
import { BaseService } from '../base/service';
import type { ApiResponse, PaginatedApiResponse, PaginationParams } from '../base/types';
import type {
  Employee,
  EmployeeWithDetails,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  EmployeeFilterParams,
} from './types';

class EmployeesService extends BaseService {
  constructor() {
    super('/employees');
  }

  async getEmployees(params?: PaginationParams & EmployeeFilterParams): Promise<PaginatedApiResponse<Employee>> {
    return this.get<PaginatedApiResponse<Employee>>('', params);
  }

  async getEmployee(id: number): Promise<ApiResponse<EmployeeWithDetails>> {
    return this.get<ApiResponse<EmployeeWithDetails>>(`/${id}`);
  }

  async createEmployee(request: CreateEmployeeRequest): Promise<ApiResponse<Employee>> {
    return this.post<ApiResponse<Employee>>('', request);
  }

  async updateEmployee(id: number, request: UpdateEmployeeRequest): Promise<ApiResponse<Employee>> {
    return this.put<ApiResponse<Employee>>(`/${id}`, request);
  }

  async deleteEmployee(id: number): Promise<ApiResponse<null>> {
    return this.delete<ApiResponse<null>>(`/${id}`);
  }

  async activateEmployee(id: number): Promise<ApiResponse<Employee>> {
    return this.post<ApiResponse<Employee>>(`/${id}/activate`);
  }

  async deactivateEmployee(id: number): Promise<ApiResponse<Employee>> {
    return this.post<ApiResponse<Employee>>(`/${id}/deactivate`);
  }
}

export const employeesService = new EmployeesService();
export default employeesService;
```

### utils.ts

```typescript
import { employeesService } from './service';
import type { Employee, EmployeeStatus } from './types';

export async function isEmployeeActive(id: number): Promise<boolean> {
  try {
    const response = await employeesService.getEmployee(id);
    return response.data.is_active;
  } catch (error) {
    console.error('Error checking employee status:', error);
    return false;
  }
}

export function formatEmployeeName(employee: Employee): string {
  return `${employee.first_name} ${employee.last_name}`.trim();
}

export function validateEmployeeEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getEmployeeStatusBadgeColor(status: EmployeeStatus): string {
  const colors: Record<EmployeeStatus, string> = {
    [EmployeeStatus.ACTIVE]: 'bg-green-100 text-green-800',
    [EmployeeStatus.INACTIVE]: 'bg-gray-100 text-gray-800',
    [EmployeeStatus.SUSPENDED]: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
```

## Common Patterns

### Pattern 1: CRUD Operations

```typescript
// GET list with pagination
async getList(params?: PaginationParams): Promise<PaginatedApiResponse<T>> {
  return this.get<PaginatedApiResponse<T>>('', params);
}

// GET single item
async getById(id: number): Promise<ApiResponse<T>> {
  return this.get<ApiResponse<T>>(`/${id}`);
}

// POST create
async create(request: CreateRequest): Promise<ApiResponse<T>> {
  return this.post<ApiResponse<T>>('', request);
}

// PUT update
async update(id: number, request: UpdateRequest): Promise<ApiResponse<T>> {
  return this.put<ApiResponse<T>>(`/${id}`, request);
}

// DELETE
async delete(id: number): Promise<ApiResponse<null>> {
  return this.delete<ApiResponse<null>>(`/${id}`);
}
```

### Pattern 2: Status Operations

```typescript
async activate(id: number): Promise<ApiResponse<T>> {
  return this.post<ApiResponse<T>>(`/${id}/activate`);
}

async deactivate(id: number): Promise<ApiResponse<T>> {
  return this.post<ApiResponse<T>>(`/${id}/deactivate`);
}

async suspend(id: number): Promise<ApiResponse<T>> {
  return this.post<ApiResponse<T>>(`/${id}/suspend`);
}

async archive(id: number): Promise<ApiResponse<T>> {
  return this.post<ApiResponse<T>>(`/${id}/archive`);
}
```

### Pattern 3: Bulk Operations

```typescript
async bulkCreate(requests: CreateRequest[]): Promise<ApiResponse<T[]>> {
  return this.post<ApiResponse<T[]>>('/bulk', { items: requests });
}

async bulkUpdate(updates: { id: number; data: UpdateRequest }[]): Promise<ApiResponse<T[]>> {
  return this.put<ApiResponse<T[]>>('/bulk', { updates });
}

async bulkDelete(ids: number[]): Promise<ApiResponse<null>> {
  return this.delete<ApiResponse<null>>('/bulk', { ids });
}
```

### Pattern 4: Relations

```typescript
async getWithRelations(id: number): Promise<ApiResponse<TWithRelations>> {
  return this.get<ApiResponse<TWithRelations>>(`/${id}/relations`);
}

async addRelation(id: number, relationId: number): Promise<ApiResponse<T>> {
  return this.post<ApiResponse<T>>(`/${id}/relations/${relationId}`);
}

async removeRelation(id: number, relationId: number): Promise<ApiResponse<T>> {
  return this.delete<ApiResponse<T>>(`/${id}/relations/${relationId}`);
}
```

### Pattern 5: File Operations

```typescript
async uploadFile(id: number, file: File): Promise<ApiResponse<T>> {
  return this.uploadFile<ApiResponse<T>>(`/${id}/upload`, file);
}

async downloadFile(id: number, fileId: number): Promise<void> {
  return this.downloadFile(`/${id}/files/${fileId}`, 'filename.pdf');
}

async deleteFile(id: number, fileId: number): Promise<ApiResponse<null>> {
  return this.delete<ApiResponse<null>>(`/${id}/files/${fileId}`);
}
```
