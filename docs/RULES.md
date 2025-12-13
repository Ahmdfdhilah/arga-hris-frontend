# RULES IMPLEMENTATION

## NO EMOJI IN CODE AND TOO MUCH COMMENTS
Pastikan codebase tidak banyak sampah emoji dan komen tidak perlu

## SELALU PASTIKAN PLANS DI PLANS
sebelum implementasi pastikan sudah sesuai plans jika kereset context nya jika disuruh

## SELALU LIHAT DOCS TECH STACK
Selalu gunakan Context7 untuk melihat docs real sesuai versi sblm eksekusi, pastikan kamu tidak sedang halusinasi.

## SEMUA ERROR EXCEPTION, DESC METHOD DAN CLASS HARUS DIKIRIM DALAM BAHASA INDONESIA
Selalu gunakan return message dalam bahasa indonesia.

## COMPONENT STRUCTURE AND ORGANIZATION

### 1. Component File Organization
- **SATU KOMPONEN PER FILE** - Setiap komponen harus dalam file terpisah
- **TIDAK BOLEH** ada multiple komponen dalam satu file
- Komponen yang kompleks harus dipecah menjadi sub-komponen

### 2. Folder Structure untuk Complex Components
Jika komponen memiliki sub-komponen atau helper components:

```
ComponentName/
├── ComponentName.tsx          # Main component
├── SubComponent1.tsx          # Sub-component 1
├── SubComponent2.tsx          # Sub-component 2
├── SubComponent3.tsx          # Sub-component 3
└── index.ts                   # Barrel export
```

**Contoh Implementasi:**
```
Header/
├── Header.tsx                 # Main header
├── SearchBar.tsx              # Search component
├── NotificationDropdown.tsx   # Notification component
└── index.ts                   # Export barrel

Sidebar/
├── Sidebar.tsx                # Main sidebar
├── SidebarContent.tsx         # Content wrapper
├── SidebarLogo.tsx            # Logo component
├── SidebarMenu.tsx            # Navigation menu
├── SidebarUserDropdown.tsx    # User dropdown
├── SidebarToggle.tsx          # Desktop toggle
├── MobileSidebarToggle.tsx    # Mobile toggle
└── index.ts                   # Export barrel
```

### 3. Component Naming Conventions
- **PascalCase** untuk nama file component: `UserProfile.tsx`, `SidebarMenu.tsx`
- **Descriptive names** yang jelas menunjukkan fungsi komponen
- Prefix dengan parent component untuk sub-components: `SidebarMenu.tsx`, `SidebarLogo.tsx`

### 4. Index File (Barrel Exports)
Setiap folder komponen harus punya `index.ts` untuk export:

```typescript
// index.ts
export { default } from './ComponentName';
export { default as SubComponent1 } from './SubComponent1';
export { default as SubComponent2 } from './SubComponent2';
```

### 5. Component Separation Principles

**Pisahkan komponen jika:**
- Komponen memiliki logic tersendiri yang kompleks
- Komponen bisa di-reuse di tempat lain
- File komponen sudah terlalu besar (>200 lines)
- Ada concern yang berbeda (logo, menu, user info)

**Component Responsibilities:**
- **Single Responsibility** - Satu komponen, satu tugas
- **Composable** - Komponen bisa di-compose menjadi komponen lebih besar
- **Reusable** - Bisa dipakai di berbagai tempat
- **Testable** - Mudah di-test secara isolated

### 6. Props Interface
- Definisikan interface untuk props di file yang sama dengan komponen
- Gunakan nama yang descriptive: `ComponentNameProps`
- Export interface jika dibutuhkan di luar

```typescript
interface SidebarMenuProps {
  accessibleMenus: MenuItem[];
  expandedMenus: string[];
  isMenuActive: (menu: MenuItem) => boolean;
  handleNavigate: (path: string) => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ ... }) => {
  // Component logic
};
```

### 7. Import Organization dalam Component
```typescript
// 1. External libraries
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


// 3. Internal components
import SubComponent1 from './SubComponent1';
import SubComponent2 from './SubComponent2';

// 4. Types and utilities
import type { MenuItem } from '@/lib/menus';
import { canAccessMenu } from '@/services/users/utils';

// 5. Assets
import Logo from '@/assets/logo.png';
```

## PAGE HEADER IMPLEMENTATION

### 1. Layout Component
- **Setiap page menggunakan PageHeader sendiri** - Memberi fleksibilitas per halaman

### 2. PageHeader Component
Component untuk header di setiap halaman dengan props:

```typescript
interface PageHeaderProps {
  title: string;              // Required - Judul halaman
  description?: string;        // Optional - Deskripsi halaman
  breadcrumb?: BreadcrumbItem[]; // Optional - Breadcrumb navigation
  actions?: ReactNode;         // Optional - Action buttons
}
```

### 3. Contoh Penggunaan PageHeader

**Basic Usage (Title Only):**
```tsx
import { PageHeader } from '@/components/common/Header';

const MyPage = () => (
  <div className="space-y-6">
    <PageHeader title="Halaman Saya" />
    {/* Page content */}
  </div>
);
```

**Full Usage (Title, Description, Breadcrumbs, Actions):**
```tsx
import { PageHeader } from '@/components/common/Header';
import { Download, RefreshCw } from 'lucide-react';

const MyPage = () => (
  <div className="space-y-6">
    <PageHeader
      title="Dashboard"
      description="Selamat datang di ARGA HRIS"
      breadcrumb={[
        { label: 'Dashboard', href: '/' },
        { label: 'Dashboard' },
      ]}
      actions={
        <>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </>
      }
    />
    {/* Page content */}
  </div>
);
```

### 4. Breadcrumb Configuration
```typescript
interface BreadcrumbItem {
  label: string;    // Text yang ditampilkan
  href?: string;    // Optional - Link untuk item (kecuali item terakhir)
}

// Contoh:
breadcrumbs={[
  { label: 'Dashboard', href: '/' },
  { label: 'Karyawan', href: '/employees' },
  { label: 'Detail Karyawan' }, // Item terakhir tanpa href
]}
```

### 5. Styling Guidelines
- **WAJIB menggunakan CSS variables** dari `globals.css`
- **TIDAK BOLEH** hardcode colors seperti `green-500`, `blue-600`, dll
- **GUNAKAN** semantic colors: `text-foreground`, `text-muted-foreground`, `bg-background`, `bg-card`, dll
- **TIDAK ADA** border atau background berbeda antara header dan body
- Layout menggunakan spacing: `p-4 md:p-6 lg:p-8` untuk responsive padding

### 6. CSS Variables yang Tersedia
```css
/* Text Colors */
text-foreground           /* Primary text */
text-muted-foreground     /* Secondary text */
text-primary              /* Primary brand color text */
text-destructive          /* Error/danger text */

/* Background Colors */
bg-background             /* Main background */
bg-card                   /* Card background */
bg-muted                  /* Muted background */
bg-primary                /* Primary brand background */
bg-destructive            /* Error/danger background */

/* Border Colors */
border                    /* Default border */
border-input              /* Input border */

/* State Colors */
hover:text-foreground     /* Hover state */
focus:ring               /* Focus ring */
```

## PAGES STRUCTURE AND ORGANIZATION

### 1. Pages Directory Structure
Pages harus diorganisir dalam folder terpisah di `src/pages/`:

```
pages/
├── Dashboard/
│   ├── Dashboard.tsx          # Main page component
│   ├── StatCard.tsx           # Page-specific component
│   └── index.ts               # Barrel export
├── Employees/
│   ├── EmployeeList.tsx       # List page
│   ├── EmployeeDetail.tsx     # Detail page
│   ├── EmployeeForm.tsx       # Form page
│   ├── EmployeeCard.tsx       # Shared component
│   └── index.ts               # Barrel export
├── NotFound/
│   ├── NotFound.tsx
│   └── index.ts
└── index.ts                   # Central barrel export
```

### 2. Page Component Guidelines

**Setiap page folder harus:**
- **Satu folder per feature/module** - Dashboard, Employees, Attendance, dll
- **Main page component** dengan nama yang sama dengan folder
- **Sub-components** untuk komponen yang spesifik ke page tersebut
- **index.ts** untuk barrel exports

**Structure Pattern:**
```
PageName/
├── PageName.tsx              # Main page (required)
├── PageSpecificComponent.tsx # Optional sub-components
└── index.ts                  # Barrel export (required)
```

### 3. Page Component Naming

**File Naming:**
- Main page: `Dashboard.tsx`, `EmployeeList.tsx`, `NotFound.tsx`
- Sub-components: `StatCard.tsx`, `EmployeeCard.tsx`, `FilterPanel.tsx`
- Forms: `EmployeeForm.tsx`, `AttendanceForm.tsx`
- Details: `EmployeeDetail.tsx`, `AttendanceDetail.tsx`

**Component Naming:**
```typescript
// Main page component
const Dashboard: React.FC = () => { ... }

// Sub-component
const StatCard: React.FC<StatCardProps> = ({ ... }) => { ... }
```

### 4. Page Structure Template

**Basic Page:**
```tsx
// External libraries
import { useState } from 'react';

// Internal components
import { PageHeader } from '@/components/common/Header';

// Page-specific components
import StatCard from './StatCard';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Page description"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Dashboard' },
        ]}
      />

      {/* Page content */}
    </div>
  );
};

export default Dashboard;
```

### 5. Page Exports (index.ts)

**Pattern untuk index.ts di setiap page folder:**
```typescript
// pages/Dashboard/index.ts
export { default } from './Dashboard';
export { default as StatCard } from './StatCard';
```

**Pattern untuk central pages/index.ts:**
```typescript
// pages/index.ts
export { default as Dashboard } from './Dashboard';
export { default as NotFound } from './NotFound';
export { default as Unauthorized } from './Unauthorized';
export { default as EmployeeList } from './Employees/EmployeeList';
export { default as EmployeeDetail } from './Employees/EmployeeDetail';
```

### 6. Routing Integration

**AppRoutes.tsx Pattern:**
```tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from '@/components/Auth/AuthGuard';
import Layout from '@/components/layouts/Layout';
import { Dashboard, NotFound, Unauthorized } from '@/pages';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Protected routes with Layout */}
      <Route
        path="/dashboard"
        element={
          <AuthGuard>
            <Layout>
              <Dashboard />
            </Layout>
          </AuthGuard>
        }
      />

      {/* Public routes without Layout */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
```

### 7. Page vs Component Decision

**Buat sebagai Page jika:**
- Merupakan route/URL tersendiri
- Memiliki PageHeader
- Berisi business logic dan data fetching
- Compose multiple components
- Ada di routing (AppRoutes.tsx)

**Buat sebagai Component jika:**
- Reusable di multiple pages
- Pure presentational
- Tidak terkait dengan routing
- Small, focused functionality

**Contoh:**
```
 Page: Dashboard.tsx, EmployeeList.tsx, AttendanceRecord.tsx
 Component: StatCard.tsx, EmployeeCard.tsx, DataTable.tsx
```

### 8. Page-Specific Components Location

**Location Rules:**
- **Di dalam page folder** - Jika HANYA dipakai di page tersebut
- **Di `src/components/`** - Jika dipakai di multiple pages

**Example:**
```
pages/Dashboard/
├── Dashboard.tsx
└── StatCard.tsx          # Only used in Dashboard

components/common/
└── DataTable.tsx         # Used in multiple pages
```

### 9. Error Pages Convention

Error pages (404, 403, 500) tidak perlu Layout:

```tsx
// NotFound.tsx - No Layout wrapper
const NotFound: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      {/* Error page content */}
    </div>
  );
};
```

### 10. Page Import Examples

**Import main page:**
```tsx
import { Dashboard } from '@/pages';
// or
import Dashboard from '@/pages/Dashboard';
```

**Import page-specific component:**
```tsx
import { StatCard } from '@/pages/Dashboard';
```

**Import multiple pages:**
```tsx
import {
  Dashboard,
  NotFound,
  Unauthorized,
  EmployeeList,
  EmployeeDetail,
} from '@/pages';
```

## DATA FETCHING WITH TANSTACK QUERY

### 1. Hooks Organization
Semua TanStack Query hooks HARUS di `src/hooks/tanstackHooks/`:

```
hooks/
├── tanstackHooks/
│   ├── useUsers.ts
│   ├── useEmployees.ts
│   ├── useOrgUnits.ts
│   └── index.ts
├── useUserSearch.ts       # Search hooks
├── useURLFilters.ts       # URL state management
├── useDebounce.ts         # Utility hooks
└── useResponsive.ts
```

### 2. TanStack Hook Pattern

**File Structure:**
```typescript
// hooks/tanstackHooks/useUsers.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { usersService } from '@/services/users';
import type {
  User,
  UserDetail,
  UserFilterParams,
  UserCreateRequest,
  UserUpdateRequest,
} from '@/services/users/types';
import type { PaginationParams, PaginatedApiResponse, ApiResponse } from '@/services/base/types';
import { handleApiError } from '@/utils/errorHandler';

// Query Keys - WAJIB untuk cache management
export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (filters: PaginationParams & UserFilterParams) =>
    [...usersKeys.lists(), filters] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: number) => [...usersKeys.details(), id] as const,
};

// ==================== Queries ====================

/**
 * Hook untuk mendapatkan paginated list
 * WAJIB: filters parameter dengan types dari service
 */
export const useUsers = (
  filters: PaginationParams & UserFilterParams,
  options?: Omit<
    UseQueryOptions<
      PaginatedApiResponse<User | UserDetail>,
      Error,
      PaginatedApiResponse<User | UserDetail>,
      ReturnType<typeof usersKeys.list>
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: usersKeys.list(filters),
    queryFn: () => usersService.getUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook untuk mendapatkan single item by ID
 * WAJIB: null check dengan enabled
 */
export const useUser = (
  userId: number | null,
  options?: Omit<
    UseQueryOptions<
      ApiResponse<User>,
      Error,
      ApiResponse<User>,
      ReturnType<typeof usersKeys.detail>
    >,
    'queryKey' | 'queryFn' | 'enabled'
  >,
) => {
  return useQuery({
    queryKey: usersKeys.detail(userId!),
    queryFn: () => usersService.getUser(userId!),
    enabled: !!userId, // WAJIB untuk prevent fetch jika null
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// ==================== Mutations ====================

/**
 * Hook untuk create mutation
 * WAJIB:
 * - Invalidate queries on success
 * - Toast notification (success & error)
 * - handleApiError untuk error messages
 */
export const useCreateUser = (
  options?: Omit<
    UseMutationOptions<ApiResponse<User>, Error, UserCreateRequest>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: (data: UserCreateRequest) => usersService.createUser(data),
    onSuccess: (response, variables, context, _mutation) => {
      // Invalidate list queries untuk refresh data
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });

      // Toast notification
      toast.success('User berhasil dibuat');

      // Call custom onSuccess if provided
      onSuccess?.(response, variables, context, _mutation);
    },
    onError: (error, variables, context, _mutation) => {
      // Parse error dengan handleApiError
      const apiError = handleApiError(error);

      // Toast error message
      toast.error(apiError.message);

      // Call custom onError if provided
      onError?.(error, variables, context, _mutation);
    },
  });
};

/**
 * Hook untuk update mutation
 */
export const useUpdateUser = (
  options?: Omit<
    UseMutationOptions<
      ApiResponse<User>,
      Error,
      { userId: number; data: UserUpdateRequest }
    >,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: ({ userId, data }: { userId: number; data: UserUpdateRequest }) =>
      usersService.updateUser(userId, data),
    onSuccess: (response, variables, context, _mutation) => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: usersKeys.detail(variables.userId),
      });

      toast.success('User berhasil diupdate');
      onSuccess?.(response, variables, context, _mutation);
    },
    onError: (error, variables, context, _mutation) => {
      const apiError = handleApiError(error);
      toast.error(apiError.message);
      onError?.(error, variables, context, _mutation);
    },
  });
};

/**
 * Hook untuk delete/deactivate mutation
 */
export const useDeactivateUser = (
  options?: Omit<
    UseMutationOptions<ApiResponse<User>, Error, number>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: (userId: number) => usersService.deactivateUser(userId),
    onSuccess: (response, variables, context, _mutation) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: usersKeys.detail(variables),
      });

      toast.success('User berhasil dinonaktifkan');
      onSuccess?.(response, variables, context, _mutation);
    },
    onError: (error, variables, context, _mutation) => {
      const apiError = handleApiError(error);
      toast.error(apiError.message);
      onError?.(error, variables, context, _mutation);
    },
  });
};
```

### 3. Mutation Callbacks - WAJIB 4 PARAMETER

**PENTING:** TanStack Query v5+ membutuhkan **4 PARAMETER** untuk `onSuccess` dan `onError` callbacks:

**Parameter yang WAJIB:**
1. `response` / `error` - Response data atau error object
2. `variables` - Variables yang dikirim ke mutation
3. `context` - Context dari mutation
4. `_mutation` - **PARAMETER KEEMPAT** - Mutation object (gunakan underscore jika tidak dipakai)

**BENAR:**
```typescript
export const useCreateUser = (
  options?: Omit<
    UseMutationOptions<ApiResponse<User>, Error, UserCreateRequest>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: (data: UserCreateRequest) => usersService.createUser(data),
    onSuccess: (response, variables, context, _mutation) => {
      //  4 parameters
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success('User berhasil dibuat');
      onSuccess?.(response, variables, context, _mutation);
    },
    onError: (error, variables, context, _mutation) => {
      //  4 parameters
      const apiError = handleApiError(error);
      toast.error(apiError.message);
      onError?.(error, variables, context, _mutation);
    },
  });
};
```

**SALAH:**
```typescript
//  JANGAN GUNAKAN 3 PARAMETER - INI AKAN ERROR!
onSuccess: (response, variables, context) => {
  // Wrong! Missing 4th parameter
  onSuccess?.(response, variables, context);
},
onError: (error, variables, context) => {
  // Wrong! Missing 4th parameter
  onError?.(error, variables, context);
}
```

**Konsekuensi jika tidak follow:**
- TypeScript error tentang parameter mismatch
- Runtime error saat callback dipanggil
- Custom `onSuccess`/`onError` tidak akan receive semua parameters yang benar

### 4. Query Keys Best Practices

**Pattern:**
```typescript
export const moduleKeys = {
  all: ['module'] as const,
  lists: () => [...moduleKeys.all, 'list'] as const,
  list: (filters: FilterParams) => [...moduleKeys.lists(), filters] as const,
  details: () => [...moduleKeys.all, 'detail'] as const,
  detail: (id: number) => [...moduleKeys.details(), id] as const,
};
```

**Mengapa perlu:**
- Cache management yang tepat
- Invalidation yang spesifik
- Type-safe query keys
- Debugging lebih mudah

### 5. Using Hooks in Components

```tsx
import { useUsers, useCreateUser, useDeactivateUser } from '@/hooks/tanstackHooks/useUsers';
import { useURLFilters } from '@/hooks/useURLFilters';
import type { UserFilterParams } from '@/services/users/types';
import type { PaginationParams } from '@/services/base/types';

const UserList: React.FC = () => {
  // URL Filters
  const urlFiltersHook = useURLFilters<PaginationParams & UserFilterParams>({
    defaults: {
      page: 1,
      limit: 10,
      search: '',
      is_active: undefined,
      org_unit_id: undefined,
    },
  });

  const filters = urlFiltersHook.getCurrentFilters();

  // Data fetching - pass filters directly
  const { data, isLoading, isError, error } = useUsers(filters);

  // Mutations
  const createMutation = useCreateUser();
  const deactivateMutation = useDeactivateUser();

  // Handlers
  const handleCreate = (formData: UserCreateRequest) => {
    createMutation.mutate(formData);
  };

  const handleDeactivate = (userId: number) => {
    deactivateMutation.mutate(userId);
  };

  return (
    // Component JSX
  );
};
```

### 6. TanStack Query Parameter Rules

**WAJIB:**
- Filters HARUS menggunakan types dari service
- Combine PaginationParams & ModuleFilterParams
- Pass filters object langsung ke hook
- JANGAN destructure filters sebelum pass ke hook

**BENAR:**
```typescript
const filters = urlFiltersHook.getCurrentFilters();
const { data, isLoading } = useUsers(filters);
```

**SALAH:**
```typescript
const { page, limit, search } = urlFiltersHook.getCurrentFilters();
const { data, isLoading } = useUsers({ page, limit, search });
```

**Alasan:** TanStack Query menggunakan filters sebagai query key,
perubahan apapun di filters akan trigger refetch.

## EMPTY STATE IMPLEMENTATION

### 1. Empty State Components

**Components:**
- `Empty` - Container
- `EmptyHeader` - Header section
- `EmptyTitle` - Title text
- `EmptyDescription` - Description text
- `EmptyContent` - Action buttons section

### 2. Empty State Patterns

**Pattern 1: Loading State**
```tsx
{isLoading && (
  <div className="flex items-center justify-center py-12">
    <Spinner className="h-8 w-8" />
  </div>
)}
```

**Pattern 2: Error State**
```tsx
{isError && (
  <Empty>
    <EmptyHeader>
      <EmptyTitle>Terjadi Kesalahan</EmptyTitle>
      <EmptyDescription>
        {error instanceof Error
          ? error.message
          : 'Gagal memuat data'}
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
)}
```

**Pattern 3: No Data (Without Filters)**
```tsx
{!isLoading && !isError && data?.data.length === 0 && !hasActiveFilters && (
  <Empty>
    <EmptyHeader>
      <EmptyTitle>Tidak Ada Data</EmptyTitle>
      <EmptyDescription>
        Belum ada data yang terdaftar
      </EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Button onClick={handleCreate}>
        <Plus className="mr-2 h-4 w-4" />
        Tambah Data
      </Button>
    </EmptyContent>
  </Empty>
)}
```

**Pattern 4: No Results (With Active Filters)**
```tsx
{!isLoading && !isError && data?.data.length === 0 && hasActiveFilters && (
  <Empty>
    <EmptyHeader>
      <EmptyTitle>Tidak Ada Hasil</EmptyTitle>
      <EmptyDescription>
        Tidak ada data yang sesuai dengan filter
      </EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Button variant="outline" onClick={handleClearFilters}>
        Hapus Filter
      </Button>
    </EmptyContent>
  </Empty>
)}
```

### 3. Combined Empty State Pattern

```tsx
<Card>
  <CardHeader>
    <CardTitle>Daftar User</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Loading */}
    {isLoading && (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    )}

    {/* Error */}
    {isError && (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Terjadi Kesalahan</EmptyTitle>
          <EmptyDescription>
            {error instanceof Error ? error.message : 'Gagal memuat data'}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )}

    {/* Empty State */}
    {!isLoading && !isError && data?.data.length === 0 && (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>
            {hasActiveFilters ? 'Tidak Ada Hasil' : 'Tidak Ada Data'}
          </EmptyTitle>
          <EmptyDescription>
            {hasActiveFilters
              ? 'Tidak ada data yang sesuai dengan filter'
              : 'Belum ada data yang terdaftar'}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          {hasActiveFilters ? (
            <Button variant="outline" onClick={handleClearFilters}>
              Hapus Filter
            </Button>
          ) : (
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Data
            </Button>
          )}
        </EmptyContent>
      </Empty>
    )}

    {/* Data List */}
    {!isLoading && !isError && data && data.data.length > 0 && (
      <>
        {/* Render data */}
      </>
    )}
  </CardContent>
</Card>
```

## FILTERING AND SEARCH IMPLEMENTATION

### 1. Filtering Component Structure

```tsx
<Filtering
  searchValue={filters.search || ''}
  onSearchChange={handleSearch}
  searchPlaceholder="Cari berdasarkan nama atau email..."
  onClearFilters={handleClearFilters}
>
  {/* Filter fields go here */}
</Filtering>
```

### 2. Filter Field Pattern

**Basic Select Filter:**
```tsx
<Field>
  <FieldLabel>Status User</FieldLabel>
  <FieldContent>
    <InputGroup>
      <InputGroupAddon align="inline-start">
        <UserCheck className="h-4 w-4 text-muted-foreground" />
      </InputGroupAddon>
      <Select
        value={
          filters.is_active === undefined
            ? 'all'
            : String(filters.is_active)
        }
        onValueChange={(value) => {
          urlFiltersHook.updateURL({
            is_active: value === 'all' ? undefined : value === 'true',
            page: 1,
          });
        }}
      >
        <SelectTrigger className="flex-1 border-0 shadow-none focus:ring-0">
          <SelectValue placeholder="Semua Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Status</SelectItem>
          <SelectItem value="true">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>Aktif</span>
            </div>
          </SelectItem>
          <SelectItem value="false">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />
              <span>Tidak Aktif</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </InputGroup>
  </FieldContent>
</Field>
```

**Searchable ID Filter (Combobox):**
```tsx
<Field>
  <FieldLabel>Organization Unit</FieldLabel>
  <FieldContent>
    <InputGroup>
      <InputGroupAddon align="inline-start">
        <Building2 className="h-4 w-4 text-muted-foreground" />
      </InputGroupAddon>
      <div className="flex-1">
        <Combobox
          options={orgUnitSearch.options}
          value={filters.org_unit_id}
          onChange={(value) => {
            urlFiltersHook.updateURL({
              org_unit_id: value as number,
              page: 1,
            });
          }}
          placeholder="Semua Organization Unit"
          searchPlaceholder="Cari berdasarkan kode/nama..."
          searchValue={orgUnitSearch.searchTerm}
          onSearchChange={orgUnitSearch.setSearchTerm}
          emptyMessage={
            orgUnitSearch.searchTerm
              ? 'Tidak ada organization unit yang ditemukan'
              : 'Ketik untuk mencari organization unit'
          }
          isLoading={orgUnitSearch.isSearching}
          enableInfiniteScroll={true}
          onLoadMore={orgUnitSearch.loadMore}
          hasNextPage={orgUnitSearch.hasMoreData}
          isLoadingMore={orgUnitSearch.isLoadingMore}
          pagination={orgUnitSearch.pagination}
          className="border-0 shadow-none focus:ring-0"
        />
      </div>
    </InputGroup>
  </FieldContent>
</Field>
```

### 3. Filter Handler Pattern

```tsx
const handleSearch = (value: string) => {
  urlFiltersHook.updateURL({ search: value, page: 1 });
};

const handleClearFilters = () => {
  urlFiltersHook.resetFilters();
};

const hasActiveFilters = urlFiltersHook.hasActiveFilters();
```

## URL FILTERS MANAGEMENT

### 1. useURLFilters Setup

```tsx
import { useURLFilters } from '@/hooks/useURLFilters';
import type { PaginationParams } from '@/services/base/types';
import type { UserFilterParams } from '@/services/users/types';

const urlFiltersHook = useURLFilters<PaginationParams & UserFilterParams>({
  defaults: {
    page: 1,
    limit: 10,
    search: '',
    is_active: undefined,
    has_employee: undefined,
    org_unit_id: undefined,
    include_details: true,
  },
});
```

### 2. Using URL Filters

```tsx
// Get current filters
const filters = urlFiltersHook.getCurrentFilters();

// Update URL with new filters
urlFiltersHook.updateURL({ search: 'john', page: 1 });

// Reset all filters
urlFiltersHook.resetFilters();

// Check if has active filters
const hasActiveFilters = urlFiltersHook.hasActiveFilters();

// Get shareable URL
const shareableURL = urlFiltersHook.getShareableURL();
```

### 3. Integration dengan TanStack Query

```tsx
// URL filters automatically trigger refetch karena query key berubah
const filters = urlFiltersHook.getCurrentFilters();
const { data, isLoading } = useUsers(filters);
```

**Cara kerja:**
1. User ubah filter
2. `updateURL` dipanggil
3. URL berubah
4. `getCurrentFilters` return filters baru
5. TanStack Query detect query key berubah
6. Automatic refetch dengan filters baru

## SEARCH HOOKS FOR COMBOBOX/AUTOCOMPLETE

### 1. Creating Search Hook

**Pattern dengan createSearchHook:**
```typescript
// hooks/useUserSearch.ts
import { usersService } from '@/services/users';
import type { User } from '@/services/users/types';
import type { PaginatedApiResponse } from '@/services/base/types';
import { createSearchHook } from '@/utils/createSearchHook';

export function useUserSearch() {
  const searchFunction = (
    term: string,
    limit = 50,
    page = 1,
  ): Promise<PaginatedApiResponse<User>> =>
    usersService.getUsers({ page, limit, search: term });

  return createSearchHook<User>({
    searchFunction,
    formatter: (user) => ({
      value: user.id,
      label: `${user.first_name} ${user.last_name}`,
      description: user.email,
    }),
  });
}
```

### 2. Using Search Hook in Forms

```tsx
import { useEmployeeSearch } from '@/hooks/useEmployeeSearch';

const UserFormFields: React.FC<UserFormFieldsProps> = ({
  formData,
  onChange,
}) => {
  const employeeSearch = useEmployeeSearch();

  return (
    <Field>
      <FieldLabel>Employee</FieldLabel>
      <FieldContent>
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </InputGroupAddon>
          <div className="flex-1">
            <Combobox
              options={employeeSearch.options}
              value={formData.employee_id}
              onChange={(value) => onChange('employee_id', value as number)}
              placeholder="Cari employee..."
              searchPlaceholder="Cari berdasarkan nomor/nama..."
              searchValue={employeeSearch.searchTerm}
              onSearchChange={employeeSearch.setSearchTerm}
              emptyMessage={
                employeeSearch.searchTerm
                  ? 'Tidak ada employee yang ditemukan'
                  : 'Ketik untuk mencari employee'
              }
              isLoading={employeeSearch.isSearching}
              enableInfiniteScroll={true}
              onLoadMore={employeeSearch.loadMore}
              hasNextPage={employeeSearch.hasMoreData}
              isLoadingMore={employeeSearch.isLoadingMore}
              pagination={employeeSearch.pagination}
              className="border-0 shadow-none focus:ring-0"
            />
          </div>
        </InputGroup>
      </FieldContent>
    </Field>
  );
};
```

### 3. Search Hook Naming Convention

**Pattern:**
```
use[Module]Search.ts
```

**Examples:**
- `useUserSearch.ts` - Search users
- `useEmployeeSearch.ts` - Search employees
- `useOrgUnitSearch.ts` - Search organization units
- `usePositionSearch.ts` - Search positions

### 4. Search Hook Features

**WAJIB include:**
- `searchTerm` - Current search term
- `setSearchTerm` - Update search term
- `options` - Formatted options untuk Combobox
- `suggestions` - Raw data dari API
- `isSearching` - Loading state
- `isLoadingMore` - Loading more data
- `hasMoreData` - Has next page
- `loadMore` - Load next page
- `pagination` - Pagination info

## RESPONSIVE CARD AND TABLE VIEW

### 1. Responsive Hook

```tsx
import { useResponsive } from '@/hooks/useResponsive';

const MyList: React.FC = () => {
  const { isDesktop } = useResponsive();

  return (
    <>
      {isDesktop ? (
        <UserTableView users={data.data} />
      ) : (
        <ItemGroup>
          {data.data.map((user) => (
            <UserCardView key={user.id} user={user} />
          ))}
        </ItemGroup>
      )}
    </>
  );
};
```

### 2. Table View Pattern

**File: UserTableView.tsx**
```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common';

interface UserTableViewProps {
  users: UserDetail[];
  onEdit: (user: UserDetail) => void;
  onToggleStatus: (user: UserDetail) => void;
}

export const UserTableView: React.FC<UserTableViewProps> = ({
  users,
  onEdit,
  onToggleStatus,
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getUserInitials(user.first_name, user.last_name)}
                  </AvatarFallback>
                </Avatar>
              </TableCell>

              <TableCell className="font-medium">
                {user.full_name}
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{user.email}</span>
                </div>
              </TableCell>

              <TableCell className="text-center">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  user.is_active
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {user.is_active ? 'Aktif' : 'Tidak Aktif'}
                </span>
              </TableCell>

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(user)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
```

### 3. Card View Pattern

**File: UserCardView.tsx**
```tsx
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  ItemFooter,
} from '@/components/common';

interface UserCardViewProps {
  user: UserDetail;
  onEdit: (user: UserDetail) => void;
  onToggleStatus: (user: UserDetail) => void;
}

export const UserCardView: React.FC<UserCardViewProps> = ({
  user,
  onEdit,
  onToggleStatus,
}) => {
  return (
    <Item variant="outline" className="mt-3">
      <ItemMedia>
        <Avatar>
          <AvatarFallback className="bg-primary/10 text-primary">
            {getUserInitials(user.first_name, user.last_name)}
          </AvatarFallback>
        </Avatar>
      </ItemMedia>

      <ItemContent className="gap-1">
        <div className="flex items-center gap-2">
          <ItemTitle>{user.full_name}</ItemTitle>
          <span
            className={`h-2 w-2 rounded-full ${
              user.is_active ? 'bg-primary' : 'bg-muted-foreground/50'
            }`}
          />
        </div>

        <ItemDescription className="space-y-0.5">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3.5 w-3.5" />
            <span>{user.email}</span>
          </div>
        </ItemDescription>

        <ItemFooter>
          <div className="text-xs text-muted-foreground">
            Status:{' '}
            <span className={user.is_active ? 'text-primary' : 'text-muted-foreground'}>
              {user.is_active ? 'Aktif' : 'Tidak Aktif'}
            </span>
          </div>
        </ItemFooter>
      </ItemContent>

      <ItemActions>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ItemActions>
    </Item>
  );
};
```

### 4. Responsive Breakpoints

```typescript
// useResponsive.ts
// Breakpoints:
// - Mobile: < 768px
// - Tablet: 768px - 1024px
// - Desktop: >= 1024px

const { isMobile, isTablet, isDesktop } = useResponsive();
```

## GENERIC DIALOG COMPONENTS

### 1. ConfirmDialog Pattern

```tsx
import { ConfirmDialog } from '@/components/common';

const MyComponent: React.FC = () => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const deleteMutation = useDeleteItem();

  const handleDelete = (item: Item) => {
    setItemToDelete(item);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    deleteMutation.mutate(itemToDelete.id);
    setConfirmOpen(false);
    setItemToDelete(null);
  };

  return (
    <>
      {/* Your component */}

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Hapus Item?"
        description={`Apakah Anda yakin ingin menghapus "${itemToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        variant="danger"
        onConfirm={confirmDelete}
        isProcessing={deleteMutation.isPending}
        confirmText="Hapus"
        cancelText="Batal"
      />
    </>
  );
};
```

**Variants:**
- `danger` - Red color, for delete/destructive actions
- `warning` - Yellow color, for risky actions
- `info` - Blue color, for informational confirms
- `success` - Green color, for positive actions

### 2. FormDialog Pattern

```tsx
import { FormDialog } from '@/components/common';

const MyFormDialog: React.FC<FormDialogProps> = ({
  open,
  onOpenChange,
  item = null,
}) => {
  const isEdit = !!item;
  const [formData, setFormData] = useState<Partial<CreateRequest>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateItem();
  const updateMutation = useUpdateItem();

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (isEdit && item) {
      updateMutation.mutate({ itemId: item.id, data: formData });
    } else {
      createMutation.mutate(formData as CreateRequest);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <FormDialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? 'Edit Item' : 'Tambah Item Baru'}
      description={
        isEdit
          ? 'Ubah informasi item'
          : 'Isi formulir di bawah untuk menambahkan item baru'
      }
      mode={isEdit ? 'edit' : 'create'}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    >
      {/* Form fields go here */}
      <Field>
        <FieldLabel>Nama</FieldLabel>
        <FieldContent>
          <InputGroup>
            <InputGroupInput
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </InputGroup>
        </FieldContent>
        {errors.name && <FieldError>{errors.name}</FieldError>}
      </Field>
    </FormDialog>
  );
};
```

### 3. Form Fields Component Pattern

**Separate form fields into own component:**
```tsx
// UserFormFields.tsx
interface UserFormFieldsProps {
  formData: Partial<UserCreateRequest>;
  errors: Record<string, string>;
  onChange: (field: keyof UserCreateRequest, value: any) => void;
  isEdit?: boolean;
}

export const UserFormFields: React.FC<UserFormFieldsProps> = ({
  formData,
  errors,
  onChange,
  isEdit = false,
}) => {
  return (
    <div className="space-y-4">
      {/* Form fields */}
    </div>
  );
};
```

**Use in FormDialog:**
```tsx
<FormDialog {...props}>
  <UserFormFields
    formData={formData}
    errors={errors}
    onChange={handleFieldChange}
    isEdit={isEdit}
  />
</FormDialog>
```

## MODULARIZATION CHECKLIST

Untuk setiap service/module baru (misal: Employees, OrgUnits), pastikan:

### Service Layer
- [ ] Service class di `services/[module]/service.ts`
- [ ] Utils di `services/[module]/utils.ts`
- [ ] Types di `services/[module]/types/`
- [ ] Export di `services/[module]/index.ts`

### Hooks Layer
- [ ] TanStack hooks di `hooks/tanstackHooks/use[Module].ts`
- [ ] Search hook di `hooks/use[Module]Search.ts`
- [ ] Query keys pattern
- [ ] Mutations dengan toast & invalidation

### Pages Layer
- [ ] Main list page: `[Module]List.tsx`
- [ ] Table view component: `[Module]TableView.tsx`
- [ ] Card view component: `[Module]CardView.tsx`
- [ ] Form dialog: `[Module]FormDialog.tsx`
- [ ] Form fields: `[Module]FormFields.tsx`
- [ ] Export di `pages/[Module]/index.ts`

### UI Integration
- [ ] useURLFilters untuk filters
- [ ] useResponsive untuk card/table switch
- [ ] Filtering component dengan search
- [ ] Empty states (loading, error, no data, no results)
- [ ] ConfirmDialog untuk destructive actions
- [ ] FormDialog untuk create/edit
- [ ] Pagination component

### Type Safety
- [ ] All filters menggunakan types dari service
- [ ] PaginationParams & ModuleFilterParams combined
- [ ] Props interfaces untuk semua components
- [ ] ApiResponse/PaginatedApiResponse return types

## COMMON MISTAKES TO AVOID

### JANGAN
```typescript
// Hardcode colors
className="text-blue-500 bg-green-100"

// Utils di komponen
// pages/Users/userHelpers.ts
export function getUserInitials() { ... }

// Utils di src/utils/
// utils/userUtils.ts
export function hasRole() { ... }

// Filters object dibuat manual
const filters = {
  page: 1,
  limit: 10,
  search: searchTerm,
};

// Search hook di page file
const [searchTerm, setSearchTerm] = useState('');
const [suggestions, setSuggestions] = useState([]);

// Multiple components dalam satu file
const UserList = () => { ... };
const UserCard = () => { ... };
const UserTable = () => { ... };

// Hardcode filter values
<Select value="active">

// Tanpa empty state
{data?.data.map(item => ...)}
```

### GUNAKAN
```typescript
// Semantic colors dari CSS variables
className="text-primary bg-primary/10"

// Utils di service folder
// services/users/utils.ts
export function getUserInitials() { ... }

// useURLFilters untuk filters
const urlFiltersHook = useURLFilters<PaginationParams & UserFilterParams>({
  defaults: { ... }
});
const filters = urlFiltersHook.getCurrentFilters();

// Dedicated search hook
const userSearch = useUserSearch();

// Separate component files
// UserList.tsx
// UserCard.tsx (in same folder)
// UserTable.tsx (in same folder)

// Filter values dari URL state
<Select value={filters.status || 'all'}>

// Dengan complete empty states
{isLoading && <Spinner />}
{isError && <Empty>Error</Empty>}
{data?.data.length === 0 && <Empty>No data</Empty>}
{data?.data.length > 0 && data.data.map(item => ...)}
```

## COMPLETE LIST IMPLEMENTATION EXAMPLE

Reference: `apps/arga-hris-web/src/pages/Users/UserList.tsx`

Struktur lengkap untuk list page:

1. Imports (organized)
2. URL Filters setup
3. Search hooks (if needed for filters)
4. Data fetching dengan TanStack
5. Mutations hooks
6. Handlers
7. PageHeader
8. Filtering component
9. Card dengan states (Loading, Error, Empty, Data)
10. Responsive Table/Card view
11. Pagination
12. FormDialog
13. ConfirmDialog

Setiap module HARUS mengikuti pattern ini untuk konsistensi.
