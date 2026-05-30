# Bugfix Requirements Document

## Introduction

The AR try-on feature is failing to apply custom textures extracted from uploaded clothing images to the Snap Lens AR view. When users upload a clothing image and specify the clothing type, the system should extract the texture from the image and dynamically apply it to the corresponding clothing item in the AR experience. However, the AR view currently displays a default shirt with a default white texture instead of the user's uploaded texture, rendering the custom texture upload feature non-functional.

This bug affects the core value proposition of the AR try-on feature, which is to allow users to visualize how custom clothing patterns and textures would look on them in real-time.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user uploads a clothing image via the DynamicLensAR component and clicks "Start AR Try-On" THEN the system displays a default shirt with a white texture in the AR view instead of the extracted texture from the uploaded image

1.2 WHEN the backend successfully processes the garment texture and returns a texture URL via the `/api/ar-tryon/process-garment` endpoint THEN the Snap Lens does not receive or apply this texture URL to the AR clothing model

1.3 WHEN the `applyLens` method is called with `launchParams` containing `texture_url` and `garment` type THEN the Snap Lens ignores these parameters and renders the default texture

1.4 WHEN a user selects a different clothing type (sweatshirt, hoodie, dress, etc.) THEN the AR view does not reflect the selected clothing type and continues to show the default shirt

### Expected Behavior (Correct)

2.1 WHEN a user uploads a clothing image via the DynamicLensAR component and clicks "Start AR Try-On" THEN the system SHALL extract the texture from the uploaded image, pass it to the Snap Lens, and display the AR view with the custom texture applied to the selected clothing type

2.2 WHEN the backend successfully processes the garment texture and returns a texture URL via the `/api/ar-tryon/process-garment` endpoint THEN the Snap Lens SHALL receive this texture URL and apply it to the AR clothing model in real-time

2.3 WHEN the `applyLens` method is called with `launchParams` containing `texture_url` and `garment` type THEN the Snap Lens SHALL use these parameters to dynamically load the texture from the provided URL and apply it to the specified garment type

2.4 WHEN a user selects a different clothing type (sweatshirt, hoodie, dress, etc.) THEN the AR view SHALL display the corresponding 3D clothing model with the custom texture applied

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the texture extraction process runs via `extractTexture()` in `textureUtils.js` THEN the system SHALL CONTINUE TO generate a seamless 1024x1024 PNG texture with proper tiling and edge blending

3.2 WHEN a user uploads an image through the `/api/ar-tryon/process-garment` endpoint THEN the system SHALL CONTINUE TO save the processed texture to the `backend/public/textures/` directory with a unique UUID filename

3.3 WHEN the Snap Camera Kit session is initialized with valid API credentials THEN the system SHALL CONTINUE TO successfully bootstrap the camera, create a session, and apply the base lens

3.4 WHEN a user captures a photo in the AR view THEN the system SHALL CONTINUE TO capture the canvas content and allow the user to download it

3.5 WHEN the LensStudioAR component is used with a wardrobe item THEN the system SHALL CONTINUE TO display the static lens without custom texture parameters

3.6 WHEN a user saves a processed texture to their profile via `/api/ar-tryon/save-texture` THEN the system SHALL CONTINUE TO store the texture metadata in the user's MongoDB document

3.7 WHEN the ARTryOn component overlays a texture on the video feed THEN the system SHALL CONTINUE TO apply the texture as a semi-transparent overlay on the captured photo (this is the non-Snap AR fallback)
