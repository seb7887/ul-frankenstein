# CLAUDE.md

## Project Information

This is a web application project developed with **Next.js** and **TypeScript**, implementing authentication through **Auth0** with Universal Login and using **shadcn/ui** for all user interface components.

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Authentication**: Auth0 with Universal Login
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS (required by shadcn/ui)
- **Package Manager**: npm/yarn/pnpm

## Project Structure

```
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── callback/
│   ├── (protected)/
│   │   └── dashboard/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/          # Componentes shadcn/ui
│   ├── auth/        # Componentes relacionados con autenticación
│   └── shared/      # Componentes compartidos
├── lib/
│   ├── auth0.ts     # Configuración de Auth0
│   ├── utils.ts     # Utilidades (incluyendo cn de shadcn)
│   └── types.ts     # Definiciones de tipos TypeScript
├── hooks/
│   └── use-auth.ts  # Hook personalizado para autenticación
├── middleware.ts    # Middleware de Next.js para protección de rutas
└── tailwind.config.js
```

## Configuración de Autenticación

### Auth0 Setup
- Use **Universal Login** for all authentication
- Implement **Auth0 Next.js SDK** (`@auth0/nextjs-auth0`)
- Configure environment variables:
  ```env
  AUTH0_SECRET='use [openssl rand -hex 32] to generate a 32 bytes value'
  AUTH0_BASE_URL='http://localhost:3000'
  AUTH0_ISSUER_BASE_URL='https://YOUR_DOMAIN.auth0.com'
  AUTH0_CLIENT_ID='your_client_id'
  AUTH0_CLIENT_SECRET='your_client_secret'
  ```

### Authentication Routes
- `/api/auth/login` - Sign in
- `/api/auth/logout` - Sign out
- `/api/auth/callback` - Auth0 callback
- `/api/auth/me` - User information

## UI Components

### shadcn/ui Guidelines
- **ALL** UI elements must use shadcn/ui components
- Install components as needed: `npx shadcn-ui@latest add [component]`
- Use the `cn()` function from `lib/utils.ts` to combine classes
- Maintain consistency in theme and colors

### Main Components to Use
- `Button` - For all buttons
- `Card` - For content containers
- `Input` - For input fields
- `Form` - For forms (with react-hook-form + zod)
- `Dialog` - For modals
- `Navigation Menu` - For navigation
- `Avatar` - For user profiles
- `Badge` - For labels and status
- `Alert` - For messages and notifications

## Development Patterns

### TypeScript
- Define interfaces for all Auth0 data
- Use strict types for component props
- Implement types for API responses

### Component Structure
```typescript
interface ComponentProps {
  // Typed props
}

export function Component({ ...props }: ComponentProps) {
  // Component logic
  return (
    // JSX using shadcn/ui components
  );
}
```

### Authentication in Components
```typescript
import { useUser } from '@auth0/nextjs-auth0/client';

export function ProtectedComponent() {
  const { user, isLoading, error } = useUser();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>Not authenticated</div>;
  
  return (
    // Content for authenticated users
  );
}
```

## Route Protection Middleware

Implement middleware to protect routes:
```typescript
import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

export default withMiddlewareAuthRequired();

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*']
};
```

## Useful Commands

```bash
# Install Auth0 dependencies
npm install @auth0/nextjs-auth0

# Install shadcn/ui
npx shadcn-ui@latest init

# Add specific components
npx shadcn-ui@latest add button card input form

# Development
npm run dev

# Build
npm run build
```

## Special Considerations

1. **SSR/SSG**: Properly configure Auth0 for server-side rendering
2. **Error Handling**: Implement consistent error handling for Auth0
3. **Loading States**: Use shadcn/ui components for loading states
4. **Responsive Design**: All components must be responsive using Tailwind
5. **Accessibility**: shadcn/ui includes accessibility best practices by default

## Authentication Flow

1. Unauthenticated user accesses protected route
2. Middleware redirects to Auth0 Universal Login
3. User authenticates with Auth0
4. Callback processes the response
5. User is redirected to the application with active session
6. Protected components render user-specific content

## Additional Notes

- Maintain consistency in shadcn/ui component usage
- Implement dark mode if needed using shadcn's theme system
- Use predefined component variants before creating customizations
- Follow Next.js App Router conventions for file organization