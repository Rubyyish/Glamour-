# AR Texture Application Fix - Bugfix Design

## Overview

The AR try-on feature fails to apply custom textures extracted from uploaded clothing images to the Snap Lens AR view. The system successfully processes textures on the backend and passes them via `launchParams` to the Snap Camera Kit, but the Snap Lens itself lacks the necessary script to receive and apply these dynamic textures. As a result, users see a default white texture instead of their uploaded clothing pattern.

This fix requires adding a `DynamicTextureLoader` script to the Snap Lens Studio project that reads the `texture_url` and `garment` parameters from `launchParams` and dynamically applies the texture to the appropriate 3D garment model. The fix is entirely on the Lens Studio side—the frontend and backend are already correctly configured.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when a user uploads a clothing image and starts AR try-on, but the Snap Lens does not have a script to read `launchParams` and apply the texture
- **Property (P)**: The desired behavior - the Snap Lens SHALL read `texture_url` and `garment` from `launchParams`, fetch the texture from the URL, and apply it to the corresponding 3D garment material
- **Preservation**: Existing functionality that must remain unchanged - texture extraction, backend processing, Camera Kit initialization, photo capture, and non-dynamic lens usage
- **launchParams**: Parameters passed to the Snap Lens via Camera Kit's `applyLens()` method, containing `texture_url` (full public URL) and `garment` (clothing type)
- **DynamicTextureLoader**: A Lens Studio script that reads `launchParams`, fetches the texture from the URL using `RemoteMediaModule`, and applies it to the target material
- **targetMaterial**: The material property of the 3D garment mesh in Lens Studio that receives the dynamic texture
- **RemoteMediaModule**: Snap Lens Studio component that fetches remote resources (textures) from URLs
- **Camera Kit Session**: The Snap Camera Kit session created in `DynamicLensAR.jsx` that applies the lens with `launchParams`

## Bug Details

### Bug Condition

The bug manifests when a user uploads a clothing image, the backend successfully processes it into a texture, and the frontend passes the texture URL via `launchParams` to the Snap Lens, but the lens does not have a script to read these parameters and apply the texture. The `applyLens` method is called with correct parameters, but the lens ignores them because it lacks the necessary scripting logic.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { textureUrl: string, garmentType: string, lensHasScript: boolean }
  OUTPUT: boolean
  
  RETURN input.textureUrl IS_VALID_URL
         AND input.garmentType IN ['tshirt', 'sweatshirt', 'hoodie', 'dress', 'leggings', 'shorts']
         AND input.lensHasScript == false
         AND applyLensCalled(input.textureUrl, input.garmentType)
END FUNCTION
```

### Examples

- **Example 1**: User uploads a floral dress image → Backend processes texture → Frontend calls `applyLens(lens, { launchParams: { texture_url: "https://backend.com/textures/texture-abc.png", garment: "dress" } })` → Lens displays default white texture because no script reads `launchParams`
- **Example 2**: User uploads a striped sweatshirt → Backend returns texture URL → Frontend passes URL to lens → Lens ignores URL and shows default shirt with white texture
- **Example 3**: User selects "hoodie" as clothing type → Frontend passes `garment: "hoodie"` → Lens does not switch to hoodie model because no script reads the `garment` parameter
- **Edge Case**: User uploads texture with CORS restrictions → Lens script attempts to fetch but fails → Expected behavior: Lens logs error and falls back to default texture gracefully

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Texture extraction via `extractTexture()` in `textureUtils.js` must continue to generate seamless 1024x1024 PNG textures with proper tiling and edge blending
- Backend `/api/ar-tryon/process-garment` endpoint must continue to save processed textures to `backend/public/textures/` with unique UUID filenames
- Snap Camera Kit session initialization must continue to bootstrap the camera, create a session, and apply the base lens
- Photo capture functionality must continue to capture canvas content and allow downloads
- LensStudioAR component (static lens without custom textures) must continue to work unchanged
- Texture saving to user profile via `/api/ar-tryon/save-texture` must continue to store metadata in MongoDB
- ARTryOn component (non-Snap AR fallback) must continue to overlay textures on video feed

**Scope:**
All inputs that do NOT involve the Snap Lens receiving dynamic textures should be completely unaffected by this fix. This includes:
- Backend texture processing and storage
- Frontend Camera Kit initialization and session management
- Photo capture and download
- Static lens usage (LensStudioAR component)
- Texture metadata storage in user profiles

## Hypothesized Root Cause

Based on the bug description and the `LENS_DYNAMIC_TEXTURE_SCRIPT.md` documentation, the root cause is:

1. **Missing Lens Studio Script**: The Snap Lens project does not contain a script to read `launchParams` passed from Camera Kit. The lens is published without any logic to handle dynamic texture URLs or garment types.

2. **No RemoteMediaModule Integration**: The lens does not use Snap's `RemoteMediaModule` to fetch textures from external URLs. Without this, the lens cannot load the texture even if it could read the URL.

3. **No Material Assignment Logic**: The lens does not have logic to apply fetched textures to the garment material's `baseTex` or `baseColor` property.

4. **No Garment Type Switching**: The lens does not have logic to switch between different 3D garment models (shirt, dress, hoodie, etc.) based on the `garment` parameter.

The frontend and backend are correctly configured:
- ✅ Backend processes textures and returns public URLs
- ✅ Frontend passes `texture_url` and `garment` via `launchParams`
- ✅ Camera Kit session is initialized correctly
- ❌ Lens Studio project lacks the script to consume these parameters

## Correctness Properties

Property 1: Bug Condition - Dynamic Texture Application

_For any_ input where a valid texture URL and garment type are passed via `launchParams` to the Snap Lens, the fixed lens SHALL fetch the texture from the URL using `RemoteMediaModule`, apply it to the target garment material, and display the custom texture in the AR view.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Non-Dynamic Lens Behavior

_For any_ input that does NOT involve dynamic texture parameters (static lens usage, backend processing, photo capture, texture storage), the fixed system SHALL produce exactly the same behavior as the original system, preserving all existing functionality for texture extraction, Camera Kit initialization, and non-Snap AR features.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct, the fix requires changes to the Snap Lens Studio project only. No frontend or backend changes are needed.

**File**: Snap Lens Studio Project (`.lsproj` file)

**Component**: New Script Resource

**Specific Changes**:

1. **Create DynamicTextureLoader Script**: Add a new JavaScript script resource in Lens Studio named `DynamicTextureLoader.js` that:
   - Reads `texture_url` and `garment` from `global.launchParams`
   - Uses `RemoteMediaModule` to fetch the texture from the URL
   - Applies the fetched texture to the target material's `baseTex` property
   - Logs all steps for debugging (initialization, parameter reading, texture loading, application)

2. **Add Script to Camera Object**: Attach the `DynamicTextureLoader` script to the Camera object in the Lens Studio scene hierarchy

3. **Configure Target Material**: In the script's Inspector properties, assign the garment mesh's material to the `targetMaterial` input field

4. **Set Parameter Name**: Ensure the script's `parameterName` input is set to `"texture_url"` (default)

5. **Add Retry Logic**: Implement an UpdateEvent loop that retries reading `launchParams` for up to 60 frames (1 second) in case parameters arrive after lens initialization

6. **Add Error Handling**: Implement try-catch blocks and fallback behavior for:
   - Missing `launchParams`
   - Invalid texture URLs
   - CORS errors
   - Texture load failures
   - Missing target material

7. **Publish Updated Lens**: Publish the updated lens to Snap's servers so the frontend can use the new version

**Optional Enhancement** (if garment type switching is required):
8. **Add Garment Switching Logic**: If the lens contains multiple 3D garment models (shirt, dress, hoodie), add logic to:
   - Read the `garment` parameter from `launchParams`
   - Show/hide the appropriate 3D model based on the garment type
   - Apply the texture to the active model's material

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on the unfixed lens, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Test the current lens with various texture URLs and garment types. Monitor the Lens Studio Logger Panel and browser console to observe that `launchParams` are passed but not consumed by the lens.

**Test Cases**:
1. **Basic Texture Upload Test**: Upload a simple solid-color shirt image → Observe that backend returns texture URL → Observe that frontend passes URL to lens → Observe that lens displays default white texture (will fail on unfixed lens)
2. **Complex Pattern Test**: Upload a floral dress image → Observe that texture is processed correctly → Observe that lens ignores the texture URL (will fail on unfixed lens)
3. **Garment Type Test**: Select "hoodie" and upload texture → Observe that `garment: "hoodie"` is passed → Observe that lens shows default shirt instead of hoodie (will fail on unfixed lens)
4. **Logger Inspection**: Check Lens Studio Logger Panel → Observe NO messages like "DynamicTextureLoader: Lens initialized" or "Texture URL = ..." (confirms missing script)

**Expected Counterexamples**:
- Lens displays default white texture regardless of uploaded image
- Browser console shows `🖼️ Texture URL passed to lens: [URL]` but lens does not apply it
- Lens Studio Logger Panel shows no messages about reading `launchParams`
- Possible causes: missing script, missing `RemoteMediaModule`, missing material assignment

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed lens produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := applyLensWithScript(input.textureUrl, input.garmentType)
  ASSERT textureAppliedToMaterial(result)
  ASSERT loggerShowsSuccess(result)
END FOR
```

**Test Plan**: After adding the `DynamicTextureLoader` script to the lens and publishing it, test with various textures and garment types.

**Test Cases**:
1. **Solid Color Texture**: Upload solid red shirt → Verify AR view shows red texture on garment
2. **Pattern Texture**: Upload striped sweatshirt → Verify AR view shows stripes on garment
3. **Complex Texture**: Upload floral dress → Verify AR view shows floral pattern on garment
4. **Different Garment Types**: Test with tshirt, sweatshirt, hoodie, dress, leggings, shorts → Verify correct model is shown (if garment switching is implemented)
5. **Logger Verification**: Check Lens Studio Logger Panel → Verify messages like "Texture URL = [URL]", "Texture loaded successfully!", "Texture applied successfully!"
6. **Browser Console Verification**: Check browser console → Verify no errors during lens application

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed system produces the same result as the original system.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT backendProcessing_original(input) = backendProcessing_fixed(input)
  ASSERT cameraKitInit_original(input) = cameraKitInit_fixed(input)
  ASSERT photoCapture_original(input) = photoCapture_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-lens inputs

**Test Plan**: Observe behavior on UNFIXED system first for backend processing, Camera Kit initialization, and photo capture, then verify these continue to work identically after the lens fix.

**Test Cases**:
1. **Backend Texture Processing Preservation**: Upload various images → Verify backend still generates 1024x1024 seamless textures → Verify textures are saved to `backend/public/textures/` with UUID filenames
2. **Camera Kit Initialization Preservation**: Start AR session → Verify Camera Kit bootstraps correctly → Verify session is created and source is set → Verify lens is loaded
3. **Photo Capture Preservation**: Capture photo in AR view → Verify canvas content is captured → Verify download link works
4. **Static Lens Preservation**: Use LensStudioAR component (without dynamic textures) → Verify static lens displays correctly
5. **Texture Storage Preservation**: Save texture to profile → Verify metadata is stored in MongoDB user document
6. **Non-Snap AR Preservation**: Use ARTryOn component (fallback) → Verify texture overlay on video feed works

### Unit Tests

- Test that `DynamicTextureLoader` script reads `launchParams` correctly
- Test that `RemoteMediaModule` fetches textures from valid URLs
- Test that texture is applied to material's `baseTex` property
- Test error handling for missing `launchParams`, invalid URLs, and CORS errors
- Test retry logic (60 frames) for delayed parameter arrival

### Property-Based Tests

- Generate random texture URLs and verify lens fetches and applies them correctly
- Generate random garment types and verify correct model is displayed (if switching is implemented)
- Generate random image uploads and verify backend processing remains unchanged
- Test that all non-lens features (photo capture, texture storage) continue to work across many scenarios

### Integration Tests

- Test full flow: upload image → backend processes → frontend passes to lens → lens applies texture → user sees custom texture in AR
- Test switching between garment types and verifying texture is applied to each
- Test capturing photo with custom texture and verifying download works
- Test error scenarios: invalid URL, CORS error, network failure → verify graceful fallback to default texture
