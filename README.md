# Money Lover Clone

A personal finance management application built with Next.js, Prisma, and PostgreSQL.

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **UI Components**: Radix UI, shadcn/ui

## Requirements

### Software

- Node.js 18+
- PostgreSQL 14+
- pnpm (recommended)

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Configure the following variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Clerk sign-in page | Yes |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Clerk sign-up page | Yes |

Example `DATABASE_URL`:
```
postgresql://username:password@localhost:5432/money_lover_clone
```

## Getting Started

### Installation

```bash
pnpm install
```

### Database Setup

1. Create a PostgreSQL database:
```bash
createdb money_lover_clone
```

2. Push schema to database:
```bash
pnpm prisma db push
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Full Deployment Script

```bash
pnpm deploy
```

This script performs:
1. `npm install` - Install dependencies
2. `npm run typecheck` - Type checking with TypeScript
3. `npm run lint` - ESLint validation
4. `prisma generate` - Generate Prisma client
5. `prisma migrate deploy` - Run database migrations
6. `npm run build` - Production build

### Individual Commands

```bash
pnpm build        # Build for production
pnpm start        # Start production server
pnpm prisma generate  # Generate Prisma client
pnpm prisma migrate deploy  # Deploy migrations
pnpm lint         # Run ESLint
pnpm typecheck   # TypeScript type check
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start development server |
| `build` | Build for production |
| `start` | Start production server |
| `lint` | Run ESLint |
| `typecheck` | Run TypeScript type check |
| `deploy` | Full deployment (install, check, migrate, build) |
| `postinstall` | Auto-generate Prisma client after install |

## License

MIT