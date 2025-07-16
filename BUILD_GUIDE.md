# Build Guide for Verma-and-Co. React Native App

This guide provides detailed instructions for building APKs for both Android and iOS platforms.

## Prerequisites

Before building the app, ensure you have the following installed:

### For Both Platforms
- Node.js (v14 or newer)
- npm or yarn
- Git
- Expo CLI: `npm install -g expo-cli`

### For Android
- Android Studio
- Android SDK (API level 30+)
- JDK 11

### For iOS
- macOS
- Xcode (latest version)
- CocoaPods
- Apple Developer account

## Android Build Instructions

### 1. Configure app.json

Ensure your `app.json` file has the correct Android configuration:

```json
{
  "expo": {
    "android": {
      "package": "com.vermaandco.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      }
    }
  }
}
```

### 2. Generate a Keystore

If you don't already have a keystore for signing your app, create one:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore verma-and-co-key.keystore -alias verma-and-co-alias -keyalg RSA -keysize 2048 -validity 10000
```

### 3. Configure Gradle Variables

Add your keystore details to `~/.gradle/gradle.properties`:

```properties
VERMA_AND_CO_UPLOAD_STORE_FILE=verma-and-co-key.keystore
VERMA_AND_CO_UPLOAD_KEY_ALIAS=verma-and-co-alias
VERMA_AND_CO_UPLOAD_STORE_PASSWORD=your-keystore-password
VERMA_AND_CO_UPLOAD_KEY_PASSWORD=your-key-password
```

### 4. Configure app/build.gradle

Ensure your `android/app/build.gradle` file includes signing configuration:

```gradle
android {
    ...
    defaultConfig { ... }
    signingConfigs {
        release {
            if (project.hasProperty('VERMA_AND_CO_UPLOAD_STORE_FILE')) {
                storeFile file(VERMA_AND_CO_UPLOAD_STORE_FILE)
                storePassword VERMA_AND_CO_UPLOAD_STORE_PASSWORD
                keyAlias VERMA_AND_CO_UPLOAD_KEY_ALIAS
                keyPassword VERMA_AND_CO_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            ...
            signingConfig signingConfigs.release
        }
    }
}
```

### 5. Build the APK

#### Using Expo EAS Build

```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Login to your Expo account
eas login

# Configure EAS build
eas build:configure

# Build for Android
eas build -p android --profile preview
```

#### Manual Build (Alternative)

```bash
# Generate native Android project
expo prebuild -p android

# Navigate to Android directory
cd android

# Build release APK
./gradlew assembleRelease

# The APK will be available at: android/app/build/outputs/apk/release/app-release.apk
```

## iOS Build Instructions

### 1. Configure app.json

Ensure your `app.json` file has the correct iOS configuration:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.vermaandco.app",
      "buildNumber": "1.0.0",
      "supportsTablet": true
    }
  }
}
```

### 2. Apple Developer Account Setup

1. Ensure you have an active Apple Developer account
2. Create an App ID in the Apple Developer Portal
3. Create a provisioning profile for your app

### 3. Build the iOS App

#### Using Expo EAS Build

```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Login to your Expo account
eas login

# Configure EAS build
eas build:configure

# Build for iOS
eas build -p ios --profile preview
```

#### Manual Build (Alternative)

```bash
# Generate native iOS project
expo prebuild -p ios

# Navigate to iOS directory
cd ios

# Install CocoaPods dependencies
pod install

# Open the workspace in Xcode
open YourApp.xcworkspace

# In Xcode:
# 1. Select your target
# 2. Set your team (Apple Developer account)
# 3. Select a provisioning profile
# 4. Build the app (Product > Archive)
```

## Troubleshooting

### Android Build Issues

1. **Gradle Build Failures**
   - Ensure you have the correct JDK version installed
   - Try running `./gradlew clean` before building again

2. **Signing Issues**
   - Verify your keystore path and credentials in gradle.properties
   - Ensure the keystore file is accessible

### iOS Build Issues

1. **Xcode Build Failures**
   - Ensure you have the latest Xcode version
   - Check that your Apple Developer account is active
   - Verify provisioning profiles and certificates

2. **CocoaPods Issues**
   - Try running `pod repo update` followed by `pod install`

## Distribution

### Android

- Upload the signed APK to Google Play Console
- Create a new release in your app's production, beta, or alpha track
- Complete the store listing and roll out the release

### iOS

- Submit your app through App Store Connect
- Complete the required metadata, screenshots, and app information
- Submit for review

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Google Play Console](https://play.google.com/console/about/)
- [App Store Connect](https://appstoreconnect.apple.com/)
