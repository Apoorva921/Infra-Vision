# Copy Design Components

The design components from "Design AI Features Section (1)" need to be copied to `components/ai-features/`.

## Components to Copy

Copy these files from `Design AI Features Section (1)/src/components/` to `infra-vision/components/ai-features/`:

### Main Components:
- `SmartCityFeatures.tsx`
- `CityInfrastructureAnalyzer.tsx`
- `SmartRoadHousingPlanning.tsx`
- `AdvancedDataVisualization.tsx`
- `UrbanGrowthPatterns.tsx`
- `UrbanGrowthDashboard.tsx`
- `UrbanGrowthExplorer.tsx`
- `SustainabilityGreenPlanning.tsx`
- `FeatureCard.tsx`
- `InfrastructureCard.tsx`
- `PremiumUrbanGrowthCard.tsx`

### UI Components:
Copy all files from `Design AI Features Section (1)/src/components/ui/` to `infra-vision/components/ai-features/ui/`

### Figma Components:
- `figma/ImageWithFallback.tsx` (already created)

## After Copying

1. Update all imports in the copied components:
   - Change `'./ui/button'` to `'@/components/ai-features/ui/button'`
   - Change `'./FeatureCard'` to `'@/components/ai-features/FeatureCard'`
   - Update relative imports to use `@/components/ai-features/` prefix

2. Add `'use client'` directive to all components that use:
   - `useState`, `useEffect`, or other React hooks
   - `motion` from `motion/react`
   - Event handlers

3. Fix any window/document references:
   - Wrap in `useEffect` or check for `typeof window !== 'undefined'`

## Quick Copy Script (PowerShell)

```powershell
# Copy main components
Copy-Item "Design AI Features Section (1)\src\components\*.tsx" -Destination "infra-vision\components\ai-features\" -Exclude "ui"

# Copy UI components
Copy-Item "Design AI Features Section (1)\src\components\ui\*" -Destination "infra-vision\components\ai-features\ui\" -Recurse

# Copy figma components
Copy-Item "Design AI Features Section (1)\src\components\figma\*" -Destination "infra-vision\components\ai-features\figma\" -Recurse
```

## Manual Steps

If the script doesn't work, manually copy each file and update the imports.











