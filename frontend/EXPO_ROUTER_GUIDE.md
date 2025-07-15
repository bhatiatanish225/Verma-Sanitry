# Expo Router Development Guide

This comprehensive guide covers all aspects of developing with Expo Router, including project structure, navigation patterns, styling, and best practices.

## Project Overview

This is a minimal expo-router app using Expo SDK 52.0.30 and Expo Router 4.0.17. The project is designed for production-ready applications with beautiful, fully-featured designs.

## Project Structure

- All routes must be placed in the `/app` directory
- Reusable components must be placed in the `/components` directory
- Each route file must export a default React component

## Platform Compatibility

This project's default platform is Web, which means:

- Native-only APIs like Haptics, Local Authentication, and some Sensors are not available
- Use web-compatible alternatives or implement platform-specific code using `Platform.select()`
- Always check platform compatibility before using React Native APIs

### Platform-Specific Code Example

```typescript
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const triggerFeedback = () => {
  if (Platform.OS !== 'web') {
    // Only runs on iOS/Android
    Haptics.impactAsync();
  } else {
    // Implement web alternative (e.g., visual feedback)
  }
};
```

## Critical Framework Requirements

**CRITICAL**: The `useFrameworkReady` hook code in `app/_layout.tsx` is REQUIRED and must NEVER be removed or modified. This code is essential for the framework to function properly.

### Required Initialization Code

```typescript
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
```

## Expo Managed Workflow

- This project uses Expo managed workflow exclusively
- DO NOT create `ios` or `android` directories
- No native code files should be included in the project

## Navigation Architecture

### Primary Navigation: Tabs

- The app MUST use tab-based layout as the primary navigation structure
- Tab navigation is implemented using expo-router's built-in tab support
- All main sections of the app should be accessible via tabs

### Secondary Navigation

You can implement additional navigation patterns WITHIN tab screens:

- **Stack Navigation**: Use for hierarchical flows within a tab
- **Modal Navigation**: Use for overlay screens within a tab
- **Drawer Navigation**: Use for additional menu options within a specific tab

### Navigation Nesting Example

```typescript
// app/(tabs)/home/_layout.tsx - Stack navigator within a tab

import { Stack } from 'expo-router/stack';

export default function HomeTabLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="details" options={{ title: 'Details' }} />
    </Stack>
  );
}
```

## Tabs Layout Implementation

### File Structure Example

```
app/
├── _layout.tsx
└── (tabs)/
    ├── _layout.tsx
    ├── index.tsx
    └── settings.tsx
```

### Root Layout Setup

```typescript
// app/_layout.tsx
import { Stack } from 'expo-router/stack';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
```

### Tabs Layout Configuration

```typescript
// app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### Tab Screen Template

```typescript
// app/(tabs)/index.tsx or app/(tabs)/settings.tsx

import { View, Text, StyleSheet } from 'react-native';

export default function Tab() {
  return (
    <View style={styles.container}>
      <Text>Tab Content</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

## Styling Guidelines

- Use `StyleSheet.create` for all styling
- DO NOT use NativeWind or any alternative styling libraries unless explicitly asked for

## Error Handling

- Prefer showing errors directly in the UI instead of using the Alert API
- Use error states in components to display error messages inline

### Error Handling Example

```typescript
function UserProfile() {
  const [error, setError] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      <Text>User Profile</Text>
    </View>
  );
}
```

## Environment Variables

- Use Expo's environment variable system
- DO NOT use Vite environment variables

### Environment Variable Types

Create a `types/env.d.ts` file:

```typescript
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_API_URL: string;
      EXPO_PUBLIC_API_KEY: string;
      // Add other environment variables here
    }
  }
}

// Ensure this file is treated as a module
export {};
```

### Environment Setup

1. Create environment files for different environments:
   - `.env` - Development defaults
   - `.env.staging` - Staging environment
   - `.env.production` - Production environment

2. Example environment file structure:

```
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_API_KEY=your_api_key
```

## Dependencies

- ALWAYS maintain ALL existing dependencies in package.json
- DO NOT remove any pre-configured dependencies

## Font Management

Use `@expo-google-fonts` packages for any font implementation.

### Implementation Steps

1. **Install Required Packages**

```bash
npm install @expo-google-fonts/[font-name]
```

2. **Import and Load Fonts**

```typescript
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  // Hide splash screen once fonts are loaded
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Return null to keep splash screen visible while fonts load
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Continue with app rendering
  return <YourApp />;
}
```

3. **Apply Fonts in Styles**

```typescript
const styles = StyleSheet.create({
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
  },
  body: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  }
});
```

## Icons

- Use the lucide icon library exclusively by importing icons as React components from "lucide-react-native"
- Follow SVG prop defaults for consistency
- Import only needed icons for better performance

### Icon Usage Examples

```typescript
import { Camera } from 'lucide-react-native';

function PhotoButton() {
  return <Camera color="red" size={48} />;
}
```

### SVG Prop Defaults

```typescript
{
  size: 24,
  color: 'currentColor',
  strokeWidth: 2,
  absoluteStrokeWidth: false
}
```

### Custom Icons

```typescript
import { Icon } from 'lucide-react-native';
import { burger } from '@lucide/lab';

function MenuButton() {
  return <Icon iconNode={burger} />;
}
```

## Camera Usage

Use `expo-camera` for implementing camera features:

```typescript
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, Text, TouchableOpacity, View } from 'react-native';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}
```

## API Routes

Expo Router enables server-side API routes for secure backend functionality.

### Setup

1. Ensure server output in app.json:

```json
{
  "web": {
    "output": "server"
  }
}
```

2. Create API routes with `+api.ts` extension:

```typescript
// app/hello+api.ts
export function GET(request: Request) {
  return Response.json({ hello: 'world' });
}
```

### Request Handling Examples

```typescript
// POST request with body
export async function POST(request: Request) {
  const body = await request.json();
  return Response.json({ ... });
}

// Query parameters
export async function GET(request: Request) {
  const url = new URL(request.url);
  const post = url.searchParams.get('post');
  return Response.json({ ... });
}

// Error handling
export async function GET(request: Request, { post }: Record<string, string>) {
  if (!post) {
    return new Response('No post found', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
  return Response.json({ ... });
}
```

### Making Requests

```typescript
async function fetchHello() {
  const response = await fetch('/hello');
  const data = await response.json();
  alert('Hello ' + data.hello);
}
```

## Preferred Libraries

- `react-native-reanimated` instead of `Animated` from `react-native`
- `react-native-gesture-handler` instead of `PanResponder`

### Example Usage

```typescript
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

function Ball() {
  return (
    <GestureDetector>
      <Animated.View style={{}} />
    </GestureDetector>
  );
}
```

## Payments

For subscriptions or in-app purchases, use RevenueCat:

- RevenueCat handles billing, entitlements, analytics, and receipt validation
- Requires native code and will not function in browser preview
- Use Expo Dev Client for testing purchases
- DO NOT use Stripe for mobile platform subscriptions

Official guide: https://www.revenuecat.com/docs/getting-started/installation/expo

## File Management

### Removing Routes

```bash
rm -rf "path/to/route/file"
```

## Best Practices

1. **Design**: Create beautiful, production-worthy designs, not cookie-cutter templates
2. **Images**: Use Pexels images directly with `Image` components
3. **Platform Compatibility**: Always check platform compatibility before using React Native APIs
4. **Error Handling**: Show errors in UI rather than using Alert API
5. **Font Loading**: Handle loading states properly with splash screens
6. **Navigation**: Use tabs as primary navigation with stack navigation within tabs
7. **Security**: Implement proper authentication and input validation for API routes
8. **Performance**: Use preferred libraries like react-native-reanimated for better performance

## Common Patterns

### Loading States

```typescript
const [isLoading, setIsLoading] = useState(true);

if (isLoading) {
  return (
    <View style={styles.loadingContainer}>
      <Text>Loading...</Text>
    </View>
  );
}
```

### Error States

```typescript
const [error, setError] = useState<string | null>(null);

return (
  <View style={styles.container}>
    {error && (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )}
    {/* Rest of component */}
  </View>
);
```

### Platform-Specific Rendering

```typescript
import { Platform } from 'react-native';

const MyComponent = () => {
  return (
    <View>
      {Platform.OS === 'web' ? (
        <WebSpecificComponent />
      ) : (
        <MobileSpecificComponent />
      )}
    </View>
  );
};
```

This guide provides a comprehensive overview of Expo Router development patterns and best practices. Follow these guidelines to create production-ready, beautiful applications that work seamlessly across platforms.