# Contributing to BuildMyAgent Clone

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/buildmyagent-clone.git
   cd buildmyagent-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

Examples:
- `feature/add-stripe-integration`
- `fix/calendar-booking-bug`
- `docs/update-api-documentation`

### Commit Messages

Follow conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```bash
feat(agents): add bulk delete functionality
fix(calendar): resolve timezone conversion issue
docs(readme): update deployment instructions
```

### Code Style

- Use TypeScript for all new code
- Follow existing code formatting (Prettier)
- Use descriptive variable names
- Add comments for complex logic
- Keep functions small and focused

### Testing

Before submitting a PR:

1. **Lint your code**
   ```bash
   npm run lint
   ```

2. **Build successfully**
   ```bash
   npm run build
   ```

3. **Test manually**
   - Create an agent
   - Test sandbox functionality
   - Verify API endpoints
   - Check database operations

## Pull Request Process

1. **Update documentation**
   - Update README.md if adding features
   - Add comments to complex code
   - Update API documentation if needed

2. **Create PR**
   - Use a clear, descriptive title
   - Reference any related issues
   - Describe changes in detail
   - Add screenshots for UI changes

3. **PR Template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   Describe testing performed
   
   ## Screenshots
   (if applicable)
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] No new warnings
   ```

## Project Structure

```
buildmyagent-clone/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   ├── agents/            # Agent pages
│   ├── workflows/         # Workflow pages
│   ├── dashboard/         # Dashboard page
│   └── auth/              # Authentication pages
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── workflows/        # Workflow-specific components
├── lib/                   # Utility functions
│   ├── prisma.ts         # Database client
│   ├── runtime.ts        # Agent runtime logic
│   ├── scheduling.ts     # Calendar/booking logic
│   └── workflow-engine.ts # Workflow execution
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## Adding New Features

### Adding a New API Route

1. Create route file: `app/api/[resource]/route.ts`
2. Implement GET, POST, PATCH, DELETE as needed
3. Add Zod validation schemas
4. Use Prisma for database operations
5. Add error handling
6. Update documentation

Example:
```typescript
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1),
  // ... other fields
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsed = schema.parse(data);
    
    const result = await prisma.resource.create({
      data: parsed,
    });
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Adding a New Component

1. Create component file in `components/`
2. Use TypeScript with proper types
3. Make it reusable
4. Add proper props documentation
5. Follow existing component patterns

### Adding a New Page

1. Create page file in `app/[route]/page.tsx`
2. Use "use client" directive if needed
3. Implement loading and error states
4. Add navigation links
5. Follow existing page structure

## Database Changes

### Adding a New Model

1. Update `prisma/schema.prisma`
2. Create migration:
   ```bash
   npx prisma migrate dev --name add_model_name
   ```
3. Update types in relevant files
4. Add API routes for the model
5. Update UI to display/manage data

### Modifying Existing Model

1. Update schema
2. Create migration
3. Update all dependent code
4. Test thoroughly

## Style Guidelines

### TypeScript

- Use strict type checking
- Avoid `any` type
- Define interfaces for complex objects
- Use type aliases for readability

### React

- Use functional components
- Prefer hooks over class components
- Keep components small and focused
- Extract reusable logic to custom hooks

### CSS/Tailwind

- Use Tailwind utility classes
- Follow existing color scheme
- Maintain responsive design
- Use consistent spacing

## Questions?

- Open an issue for bugs
- Start a discussion for feature ideas
- Check existing issues before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
