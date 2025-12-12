# ARGA HRIS Web Application

Human Resource Information System (HRIS) untuk PT Arga Bangun Bangsa

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool dan dev server
- **Tailwind CSS** - Styling framework
- **Redux Toolkit** - State management
- **React Router** - Routing
- **Axios** - HTTP client
- **date-fns** - Date utility
- **Lucide React** - Icon library

## Prerequisites

- Node.js (v18 atau lebih tinggi)
- pnpm (package manager)

## Setup Development

1. Clone repository dan masuk ke direktori project:
```bash
cd apps/arga-hris-web
```

2. Install dependencies (dari root monorepo):
```bash
pnpm install
```

3. Copy file environment:
```bash
cp .env.example .env
```

4. Konfigurasi environment variables di file `.env`:
```env
VITE_SSO_DASHBOARD_URL=http://localhost:5174
VITE_API_BASE_URL_SSO=http://localhost:8001
VITE_API_BASE_URL_HRIS=http://localhost:8002
```

5. Jalankan development server:
```bash
pnpm dev
```

Aplikasi akan berjalan di `http://localhost:5176`

## Project Structure

```
src/
├── assets/          # Static assets (images, icons, etc)
├── components/      # Reusable components
│   ├── Auth/       # Authentication components
│   └── common/     # Common components (ErrorBoundary, etc)
├── hooks/          # Custom React hooks
├── layouts/        # Layout components
├── lib/            # Utility functions dan helpers
├── pages/          # Page components
├── redux/          # Redux store dan slices
│   ├── features/   # Redux feature slices
│   ├── hooks.ts    # Typed Redux hooks
│   ├── reducers.ts # Root reducer
│   └── store.ts    # Redux store configuration
├── routes/         # Route definitions
├── services/       # API service functions
├── utils/          # Utility functions
│   ├── api.ts      # Axios configuration dan interceptors
│   └── errorHandler.ts # Error handling utilities
├── App.tsx         # Main App component
├── main.tsx        # Entry point
└── index.css       # Global styles
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

## Authentication

Aplikasi ini menggunakan SSO (Single Sign-On) untuk authentication. Token akan diterima dari SSO Dashboard dan disimpan di Redux store dengan redux-persist.

### Auth Flow:
1. User diarahkan ke SSO Dashboard untuk login
2. Setelah login sukses, SSO mengirim token via URL params
3. AuthProvider menangkap token dan menyimpannya di Redux
4. Token digunakan untuk semua API calls ke HRIS backend

## API Configuration

API client dikonfigurasi dengan Axios interceptors yang menangani:
- Auto token refresh
- Request/Response interceptors
- Error handling
- Token expiration

## State Management

Redux Toolkit digunakan untuk state management dengan fitur:
- Persisted state (auth dan theme)
- TypeScript support
- Async thunks untuk API calls

## Styling

Menggunakan Tailwind CSS dengan workspace configuration. Custom styles dapat ditambahkan di:
- Global styles: `src/index.css`
- Component styles: Inline dengan Tailwind classes

## Development Guidelines

### Creating New Components
```tsx
// components/MyComponent.tsx
import { FC } from 'react';

interface MyComponentProps {
  title: string;
}

const MyComponent: FC<MyComponentProps> = ({ title }) => {
  return <div className="p-4">{title}</div>;
};

export default MyComponent;
```

### Creating New Pages
```tsx
// pages/MyPage.tsx
import { FC } from 'react';

const MyPage: FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">My Page</h1>
    </div>
  );
};

export default MyPage;
```

### API Service Pattern
```tsx
// services/myService.ts
import { hrisApi } from '@/utils/api';

export interface MyData {
  id: number;
  name: string;
}

export const getMyData = async (): Promise<MyData[]> => {
  const response = await hrisApi.get('/my-endpoint');
  return response.data;
};
```

## Contributing

1. Create feature branch dari `main`
2. Commit changes dengan descriptive messages
3. Push branch dan create Pull Request
4. Request review dari team

## Support

Untuk masalah atau pertanyaan, hubungi tim development ARGA.
