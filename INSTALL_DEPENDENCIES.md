# Dependencies Required

Run one of these commands to install missing packages:

```bash
# Option 1: Fix PowerShell policy first
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
npm install zustand browser-image-compression uuid @types/uuid

# Option 2: Use npx
npx --yes npm install zustand browser-image-compression uuid @types/uuid
```

## Required Packages:
- `zustand` - State management for cart
- `browser-image-compression` - Image upload optimization  
- `uuid` - UUID generation
- `@types/uuid` - TypeScript types
