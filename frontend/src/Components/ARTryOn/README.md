# AR Try-On Feature

## Overview
The AR Try-On feature allows users to virtually try on clothing items using their device camera. This creates an immersive shopping experience where users can see how items might look on them before adding to their wardrobe.

## Features

### 1. Camera Access
- Requests user permission to access device camera
- Uses front-facing camera for selfie mode
- Optimized for 1280x720 resolution

### 2. Real-time Preview
- Live camera feed with overlay guide frame
- Visual guides to help users position themselves correctly
- Corner markers for better framing

### 3. Item Overlay
- Semi-transparent clothing item overlay on captured photo
- Positioned on upper body area (centered at 25% from top)
- 70% opacity for realistic blending

### 4. Photo Capture
- Capture button to take a snapshot
- Combines camera feed with item overlay
- High-quality PNG output

### 5. Photo Management
- Retake option to capture a new photo
- Download captured photo to device
- Preview captured image before saving

## Usage

### From Category/Collections Pages
1. Click on any product card to view details
2. Click "Try with AR" button in the modal
3. Allow camera permissions when prompted
4. Position yourself in the frame
5. Click "Capture Photo" to take a picture
6. Download or retake as needed

### From HomePage
1. Click "Start AR Experience" button in hero section
2. Camera opens for general AR experience
3. Follow the same capture process

## Technical Details

### Browser Compatibility
- Requires browser support for `getUserMedia` API
- Works on modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile and desktop compatible

### Permissions
- Camera access permission required
- User can deny and retry later
- Clear error messages if permission denied

### Image Processing
- Uses HTML5 Canvas for image manipulation
- Combines video frame with item image overlay
- Exports as PNG format for quality

## Tips for Best Results
- Ensure good lighting conditions
- Stand at arm's length from camera
- Position yourself centered in the frame
- Use the guide frame for proper alignment
- Keep camera steady when capturing

## Future Enhancements
- Body detection for better item placement
- Size adjustment controls
- Multiple item try-on simultaneously
- Save to wardrobe directly from AR
- Share captured photos on social media
- 3D model integration for more realistic rendering
