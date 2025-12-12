# Services Architecture Rules

## Struktur Folder

```
src/services/
├── base/
│   ├── service.ts
│   ├── utils.ts
│   ├── types/
│   │   ├── shared.ts
│   │   ├── response.ts
│   │   ├── request.ts
│   │   └── index.ts
│   └── index.ts
│
├── [module-name]/
│   ├── service.ts          # WAJIB: methods mapping ke backend endpoints
│   ├── utils.ts            # WAJIB: helper functions untuk module ini
│   ├── types/
│   │   ├── request.ts
│   │   ├── response.ts
│   │   ├── shared.ts
│   │   └── index.ts
│   └── index.ts
│
└── index.ts
```

PENTING:
- Setiap module WAJIB punya utils.ts sendiri
- Utils terkait service HARUS di module service itu, BUKAN di src/utils/ global
- JANGAN buat utils di komponen atau di src/utils/[moduleName]Utils.ts

## Naming Conventions

### SALAH
```
authService.ts
userService.ts
employeeService.ts
```

### BENAR
```
service.ts
utils.ts
types/request.ts
types/response.ts
types/shared.ts
```

Alasan: Nama folder sudah menjelaskan module, tidak perlu redundan di nama file.

## Base Types vs Module Types

### Base Types (base/types/shared.ts)
Hanya untuk types yang dipakai SEMUA modules:

```typescript
export interface ApiResponse<T> {
  error: boolean;
  message: string;
  timestamp: string;
  data: T;
}

export interface PaginatedApiResponse<T> {
  error: boolean;
  message: string;
  timestamp: string;
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
  has_prev_page: boolean;
  has_next_page: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface ApiErrorResponse {
  error: true;
  message: string;
  timestamp: string;
  data?: any;
  detail?: string;
  errors?: Record<string, string[]>;
}
```

### JANGAN di Base Types
```typescript
export interface CurrentUser { ... }
export interface TokenInfo { ... }
export interface User { ... }
export interface Role { ... }
```
Taruh di module masing-masing: auth/types/response.ts atau users/types/response.ts

## Backend Response Format

Semua response dari backend HRIS:

```typescript
{
  "error": false,
  "message": "Success message",
  "timestamp": "2025-10-30T10:30:00.000Z",
  "data": { ... }
}

{
  "error": false,
  "message": "Success message",
  "timestamp": "2025-10-30T10:30:00.000Z",
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total_items": 100,
    "total_pages": 10,
    "has_prev_page": false,
    "has_next_page": true
  }
}

{
  "error": true,
  "message": "Error message",
  "timestamp": "2025-10-30T10:30:00.000Z",
  "data": null
}
```

Referensi: `arga_web_backend/arga-hris-service/app/core/responses/helpers.py`

## Service Class Structure

Service HANYA berisi methods yang mapping 1:1 dengan backend endpoints.
JANGAN masukkan helper functions, validasi, atau transformasi data di service.

**PENTING: BaseService Pattern**
- BaseService methods (`get`, `post`, `put`, `patch`, `delete`) return generic type `T`
- SETIAP method service HARUS explicitly specify complete return type
- GET list endpoints SELALU return `PaginatedApiResponse<T>`
- GET single, POST, PUT, PATCH, DELETE return `ApiResponse<T>`

```typescript
import { BaseService } from '../base/service';
import type { ApiResponse, PaginatedApiResponse, PaginationParams } from '../base/types';
import type {
  CreateRequest,
  UpdateRequest,
  ItemResponse,
  ItemFilterParams,
} from './types';

class ModuleService extends BaseService {
  constructor() {
    super('/module-path');
  }

  // GET list - always return PaginatedApiResponse
  async getItems(params?: PaginationParams & ItemFilterParams): Promise<PaginatedApiResponse<ItemResponse>> {
    return this.get<PaginatedApiResponse<ItemResponse>>('', params);
  }

  // GET single - return ApiResponse
  async getItem(id: number): Promise<ApiResponse<ItemResponse>> {
    return this.get<ApiResponse<ItemResponse>>(`/${id}`);
  }

  // POST create - return ApiResponse
  async createItem(request: CreateRequest): Promise<ApiResponse<ItemResponse>> {
    return this.post<ApiResponse<ItemResponse>>('', request);
  }

  // PUT update - return ApiResponse
  async updateItem(id: number, request: UpdateRequest): Promise<ApiResponse<ItemResponse>> {
    return this.put<ApiResponse<ItemResponse>>(`/${id}`, request);
  }

  // DELETE - return ApiResponse
  async deleteItem(id: number): Promise<ApiResponse<null>> {
    return this.delete<ApiResponse<null>>(`/${id}`);
  }
}

export const moduleService = new ModuleService();
export default moduleService;
```

## Types Organization

### Request Types (types/request.ts)
```typescript
export interface CreateUserRequest {
  email: string;
  first_name: string;
  last_name: string;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
}
```

### Response Types (types/response.ts)
```typescript
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
}

export interface UserWithDetails extends User {
  details: any;
}
```

### Shared Types (types/shared.ts)
Types yang dipakai request DAN response dalam module yang sama.
Biasanya kosong kecuali ada enum atau constant.

## Utils vs Service Separation

### Service (service.ts)
HANYA berisi methods yang mapping langsung ke backend endpoints.

YANG BOLEH di Service:
```typescript
// GET single - specify complete return type
async getUser(userId: number): Promise<ApiResponse<User>> {
  return this.get<ApiResponse<User>>(`/${userId}`);
}

// GET list - always PaginatedApiResponse
async getUsers(params?: PaginationParams): Promise<PaginatedApiResponse<User>> {
  return this.get<PaginatedApiResponse<User>>('', params);
}

// POST create - specify complete return type
async createUser(request: CreateRequest): Promise<ApiResponse<User>> {
  return this.post<ApiResponse<User>>('', request);
}

// PUT update - specify complete return type
async updateUser(userId: number, request: UpdateRequest): Promise<ApiResponse<User>> {
  return this.put<ApiResponse<User>>(`/${userId}`, request);
}

// DELETE - specify complete return type
async deleteUser(userId: number): Promise<ApiResponse<null>> {
  return this.delete<ApiResponse<null>>(`/${userId}`);
}
```

YANG TIDAK BOLEH di Service:
```typescript
// Helper functions tidak boleh di service
async hasRole(userId: number, roleName: string): Promise<boolean> {
  const response = await this.getUserRolesAndPermissions(userId);
  return response.data.roles.includes(roleName);
}

async isAdmin(userId: number): Promise<boolean> {
  return await this.hasRole(userId, 'admin');
}

// Validation tidak boleh di service
async validateAndCreateUser(request: CreateRequest): Promise<ApiResponse<User>> {
  if (!this.isValidEmail(request.email)) {
    throw new Error('Invalid email');
  }
  return this.createUser(request);
}
```

### Utils (utils.ts)
Berisi helper functions, transformasi data, validasi, atau logic yang tidak mapping ke endpoint.

TARUH di Utils:
```typescript
import { usersService } from './service';
import type { UserRolesPermissions } from './types';

export async function hasRole(userId: number, roleName: string): Promise<boolean> {
  try {
    const response = await usersService.getUserRolesAndPermissions(userId);
    return response.data.roles.includes(roleName);
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
}

export async function hasPermission(userId: number, permissionCode: string): Promise<boolean> {
  try {
    const response = await usersService.getUserRolesAndPermissions(userId);
    return response.data.permissions.includes(permissionCode);
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
}

export async function isAdmin(userId: number): Promise<boolean> {
  const adminRole = await hasRole(userId, 'admin');
  const superAdminRole = await hasRole(userId, 'super_admin');
  return adminRole || superAdminRole;
}

export function transformUserData(user: any) {
  return {
    ...user,
    fullName: `${user.first_name} ${user.last_name}`,
  };
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

### Kapan Pakai Utils vs Service

Utils untuk:
- Helper functions yang tidak mapping ke endpoint
- Kombinasi beberapa service calls
- Transformasi data
- Validasi input
- Format output
- Cached results
- Computed values

Service untuk:
- Method yang langsung call backend endpoint
- Harus return ApiResponse atau PaginatedApiResponse
- Tidak boleh ada logic selain call endpoint

## Backend Endpoint Mapping

Setiap service method harus mapping 1:1 dengan backend endpoint.

Backend:
```python
@router.post("/logout")
async def logout(...): ...

@router.post("/logout-all")
async def logout_all_sessions(...): ...

@router.get("")
async def list_items(page: int, limit: int, ...): ...

@router.get("/{id}")
async def get_item(id: int): ...
```

Frontend:
```typescript
// POST methods - return ApiResponse
async logout(): Promise<ApiResponse<null>> {
  return this.post<ApiResponse<null>>('/logout');
}

async logoutAllSessions(): Promise<ApiResponse<null>> {
  return this.post<ApiResponse<null>>('/logout-all');
}

// GET list - return PaginatedApiResponse
async listItems(params?: PaginationParams): Promise<PaginatedApiResponse<Item>> {
  return this.get<PaginatedApiResponse<Item>>('', params);
}

// GET single - return ApiResponse
async getItem(id: number): Promise<ApiResponse<Item>> {
  return this.get<ApiResponse<Item>>(`/${id}`);
}
```

## Export Pattern

### Module Index ([module]/index.ts)
```typescript
export * from './service';
export * from './types';
export * from './utils';
```

### Main Index (services/index.ts)
```typescript
export * from './base';
export * from './auth';
export * from './users';
```

## Checklist Service Baru

### Step 1: Cek Backend
- Baca router: `arga_web_backend/arga-hris-service/app/modules/[module]/routers/`
- Catat semua endpoints dan HTTP methods
- Baca schema: `arga_web_backend/arga-hris-service/app/modules/[module]/schemas/`

### Step 2: Buat Struktur
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

### Step 3: Isi Types
- Isi types/response.ts dengan response interfaces dari backend
- Isi types/request.ts dengan request interfaces dari backend
- Export di types/index.ts

### Step 4: Buat Service
- Extend dari BaseService
- Set basePath sesuai backend route prefix
- Buat method untuk setiap endpoint (HANYA yang mapping ke backend)
- Export singleton instance

### Step 5: Buat Utils
- Buat helper functions di utils.ts
- Import service dari './service'
- JANGAN taruh helper functions di service.ts
- JANGAN buat utils di src/utils/ atau di komponen

### Step 6: Export
- Export service, types, dan utils di [module]/index.ts
- Tambahkan module di services/index.ts

## Common Mistakes

### JANGAN
```typescript
auth/authService.ts

base/types/response.ts
  export interface User { ... }

async getUser() {
  return axios.get('http://localhost:8002/users/me');
}

return {
  success: true,
  data: { ... }
}

class UsersService {
  async getUsers() { ... }

  async hasRole(userId: number, roleName: string) {
    const response = await this.getUserRolesAndPermissions(userId);
    return response.data.roles.includes(roleName);
  }
}

src/utils/usersUtils.ts
  export function hasRole() { ... }

src/components/UserProfile/userHelpers.ts
  export function hasRole() { ... }
```

### GUNAKAN
```typescript
// File: auth/service.ts
class AuthService extends BaseService {
  constructor() {
    super('/auth');
  }

  async getCurrentUser(): Promise<ApiResponse<CurrentUser>> {
    return this.get<ApiResponse<CurrentUser>>('/me');
  }
}

// File: users/types/response.ts
export interface User { ... }

// File: users/service.ts
class UsersService extends BaseService {
  constructor() {
    super('/users');
  }

  // Specify complete return type - ApiResponse wrapped
  async getUserRolesAndPermissions(userId: number): Promise<ApiResponse<UserRolesPermissions>> {
    return this.get<ApiResponse<UserRolesPermissions>>(`/${userId}/roles-permissions`);
  }

  // GET list - always PaginatedApiResponse
  async getUsers(params?: PaginationParams): Promise<PaginatedApiResponse<User>> {
    return this.get<PaginatedApiResponse<User>>('', params);
  }
}

// File: users/utils.ts
export async function hasRole(userId: number, roleName: string): Promise<boolean> {
  try {
    const response = await usersService.getUserRolesAndPermissions(userId);
    return response.data.roles.includes(roleName);
  } catch (error) {
    console.error('Error mengecek role user:', error);
    return false;
  }
}
```

## Reference Files

Backend:
- `arga_web_backend/arga-hris-service/app/core/responses/`
- `arga_web_backend/arga-hris-service/app/modules/auth/routers/auth.py`
- `arga_web_backend/arga-hris-service/app/modules/users/routers/users.py`
- `arga_web_backend/arga-hris-service/app/modules/[module]/schemas/`

Frontend:
- `src/services/base/service.ts`
- `src/services/auth/service.ts`
- `src/services/users/service.ts`
