# Next.js Frontend Project

A modern frontend application built with Next.js 15, React 18, and Tailwind CSS.

## Requirements

- Node.js 18+ (LTS recommended)
- npm, yarn, or pnpm package manager

## Installation

You can install the project dependencies using npm, yarn, or pnpm:

### Using npm

```bash
npm install
```

### Using yarn

```bash
yarn install
```

### Using pnpm

```bash
pnpm install
```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Environment variables example
NEXT_PUBLIC_API_URL=your_api_url_here
```

## Running the Project

### Development Mode

To run the project in development mode with hot-reload:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### Production Build

To create a production build:

```bash
npm run build
# or
yarn build
# or
pnpm build
```

Then, to start the production server:

```bash
npm run start
# or
yarn start
# or
pnpm start
```

## Docker Support

The project includes Docker configuration for containerized deployment:

```bash
# Build the Docker image
./docker_build.sh
# or
docker build -t nextjs-frontend .

# Run the container
docker run -p 3000:3000 nextjs-frontend
```

## Project Structure

```
.
├── app/                # App router pages and API routes
├── components/         # Reusable UI components
│   └── ui/             # Shadcn UI components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── public/             # Static assets
├── services/           # API service functions
├── styles/             # Global styles
└── types/              # TypeScript type definitions
```

## Technologies

- [Next.js](https://nextjs.org/) - React framework for production
- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn UI](https://ui.shadcn.com/) - UI component library
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript

## Development Commands

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality 