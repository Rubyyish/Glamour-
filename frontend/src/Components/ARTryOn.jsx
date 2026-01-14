import React, { useEffect, useRef, useState } from 'react';

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;

// CDN URLs pinned to exact versions
const CDN_SCRIPTS = [
  'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
  'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
  'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js',
];

/**
 * Dynamically inject a script tag from `src`.
 * Idempotent — does nothing if the script is already in the document.
 */
const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.crossOrigin = 'anonymous';
    s.onload = resolve;
    s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(s);
  });

const ARTryOn = ({ wardrobeItems = [] }) => {
  const canvasRef = useRef(null);
  // Holds the fully-loaded HTMLImageElement for the selected garment.
  // Only assigned inside img.onload so it is never set to a partial image.
  const garmentImgRef = useRef(null);
  // Holds the garment color string so the placeholder rect can use it
  // inside the useEffect closure where state is stale.
  const garmentColorRef = useRef('#9333ea');
  const [status, setStatus] = useState('Loading MediaPipe…');
  const [error, setError] = useState(null);
  const [poseReady, setPoseReady] = useState(false);
  // Pixel-space coordinates for the 4 body-anchor landmarks
  const [landmarks, setLandmarks] = useState(null);
  // Torso detection confidence, 0-100
  const [detectionScore, setDetectionScore] = useState(0);
  const [selectedGarment, setSelectedGarment] = useState(
    wardrobeItems?.[0] ?? null
  );

  /**
   * Call this when the user picks a garment from the dropdown.
   * Resets garmentImgRef so the placeholder rect is shown while loading,
   * then assigns the Image only after it has fully decoded.
   */
  const onSelectGarment = (garment) => {
    setSelectedGarment(garment);
    // Clear previous image so the placeholder shows immediately
    garmentImgRef.current = null;
    // Remember the color for the loading-state placeholder
    garmentColorRef.current = garment.color || '#9333ea';

    const img = new Image();
    img.crossOrigin = 'anonymous';
    // Only store the image once it has fully loaded
    img.onload = () => {
      garmentImgRef.current = img;
    };
    // Setting src triggers the load; do this AFTER onload is attached
    img.src = garment.image_url;
  };

  // Load the initially selected garment image
  useEffect(() => {
    if (selectedGarment) {
      onSelectGarment(selectedGarment);
    }
  }, []);

  useEffect(() => {
    let cameraInstance = null;
    let poseInstance = null;

    const init = async () => {
      try {
        // 1. Load all CDN scripts sequentially (order matters)
        for (const src of CDN_SCRIPTS) {
          await loadScript(src);
        }

        // 2. Obtain webcam stream
        setStatus('Requesting camera access…');
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: CANVAS_WIDTH },
            height: { ideal: CANVAS_HEIGHT },
            facingMode: 'user',
          },
          audio: false,
        });

        // 3. Hidden offscreen video to feed into both canvas and Pose
        const video = document.createElement('video');
        video.playsInline = true;
        video.muted = true;
        video.srcObject = mediaStream;
        video.style.display = 'none';
        document.body.appendChild(video);

        // 4. Configure MediaPipe Pose with the requested options
        poseInstance = new window.Pose({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`,
        });

        poseInstance.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.55,
          minTrackingConfidence: 0.5,
        });

        // 5. Results callback — draw mirrored frame + pose overlay on canvas
        poseInstance.onResults((results) => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext('2d');

          // Clear the previous frame and redraw the raw camera image first.
          // This must happen before any overlay drawing to prevent ghost trails.
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

          ctx.save();
          ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

          // Mirror horizontally so it feels like a reflective mirror
          ctx.translate(CANVAS_WIDTH, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(results.image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          ctx.restore();

          // Pose skeleton overlay (drawn after the mirror restore)
          if (
            results.poseLandmarks &&
            window.drawConnectors &&
            window.drawLandmarks &&
            window.POSE_CONNECTIONS
          ) {
            window.drawConnectors(
              ctx,
              results.poseLandmarks,
              window.POSE_CONNECTIONS,
              { color: '#00FF88', lineWidth: 3 }
            );
            window.drawLandmarks(ctx, results.poseLandmarks, {
              color: '#FF4444',
              radius: 4,
            });
          }

          // ── Extract & store the 4 anchor landmarks in pixel space ──────────
          // X is mirrored with (1 - lm.x) to align with the flipped canvas.
          if (results.poseLandmarks) {
            const lms = results.poseLandmarks;
            const toPixel = (lm) => ({
              x: (1 - lm.x) * CANVAS_WIDTH,   // mirror X
              y: lm.y * CANVAS_HEIGHT,
            });

            setLandmarks({
              leftShoulder:  toPixel(lms[11]),  // index 11
              rightShoulder: toPixel(lms[12]),  // index 12
              leftHip:       toPixel(lms[23]),  // index 23
              rightHip:      toPixel(lms[24]),  // index 24
            });

            // ── Mirror landmarks to match CSS scaleX(-1) on the video ────
            // x is flipped with (1 - lm.x); y and z are kept as-is.
            const mirroredLandmarks = results.poseLandmarks.map((lm) => ({
              ...lm,
              x: 1 - lm.x,
            }));

            // ── Draw garment overlay or loading placeholder ───────────────
            // Derive a rough torso bounding box used by both branches.
            const ls = mirroredLandmarks[11]; // left shoulder
            const rs = mirroredLandmarks[12]; // right shoulder
            const lh = mirroredLandmarks[23]; // left hip
            const rh = mirroredLandmarks[24]; // right hip
            const boxX = Math.min(ls.x, rs.x) * canvas.width;
            const boxY = Math.min(ls.y, rs.y) * canvas.height;
            const boxW = Math.abs(rs.x - ls.x) * canvas.width;
            const boxH = Math.abs(
              (Math.max(lh.y, rh.y) - Math.min(ls.y, rs.y))
            ) * canvas.height;

            if (garmentImgRef.current && garmentImgRef.current.complete) {
              // Image ready — draw the actual garment
              drawGarmentOverlay(
                ctx,
                mirroredLandmarks,
                canvas.width,
                canvas.height,
                garmentImgRef.current
              );
            } else if (garmentColorRef.current) {
              // Image still loading — draw a semi-transparent colored rectangle
              // so the user can see a placeholder at the correct body position.
              ctx.save();
              ctx.globalAlpha = 0.45;
              ctx.fillStyle = garmentColorRef.current;
              ctx.beginPath();
              ctx.roundRect?.(boxX, boxY, boxW, boxH, 8) ??
                ctx.rect(boxX, boxY, boxW, boxH);
              ctx.fill();
              ctx.globalAlpha = 1;
              ctx.restore();
            }

            // ── Torso confidence score ────────────────────────────────────
            const torso = [lms[11], lms[12], lms[23], lms[24]];
            const confidence =
              torso.reduce((sum, l) => sum + (l?.visibility ?? 0), 0) / 4;
            setDetectionScore(Math.round(confidence * 100));
          }
        });

        // 6. Use the Camera utility to call pose.send() on EVERY video frame
        cameraInstance = new window.Camera(video, {
          onFrame: async () => {
            if (poseInstance) {
              await poseInstance.send({ image: video });
            }
          },
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
        });

        await cameraInstance.start();
        setStatus('Camera active');
        setPoseReady(true);

        // Cleanup helper captured in closure
        cameraInstance._videoEl = video;
        cameraInstance._stream = mediaStream;
      } catch (err) {
        console.error('AR Try-On init error:', err);
        setError(
          err.name === 'NotAllowedError'
            ? 'Camera permission denied. Allow camera access and reload.'
            : `Error: ${err.message}`
        );
        setStatus('');
      }
    };

    init();

    return () => {
      if (cameraInstance) {
        cameraInstance.stop?.();
        cameraInstance._stream?.getTracks().forEach((t) => t.stop());
        cameraInstance._videoEl?.remove();
      }
      if (poseInstance) {
        poseInstance.close?.();
      }
    };
  }, []);

  /** Download the current canvas frame as a PNG. */
  const saveLook = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'glamoure-look.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '20px',
        fontFamily: 'sans-serif',
      }}
    >
      <h2 style={{ margin: 0 }}>AR Try‑On — Glamouré</h2>

      {error ? (
        <p style={{ color: '#c0392b', fontWeight: 'bold' }}>{error}</p>
      ) : (
        <p style={{ color: '#555', fontSize: '0.9rem' }}>
          {status}
          {poseReady && ' · Pose detection active'}
        </p>
      )}

      {/* Garment selection dropdown */}
      {wardrobeItems && wardrobeItems.length > 0 && (
        <select
          value={selectedGarment?._id || ''}
          onChange={(e) => {
            const garment = wardrobeItems.find((g) => g._id === e.target.value);
            if (garment) onSelectGarment(garment);
          }}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '2px solid #ccc',
            fontSize: '0.95rem',
            fontFamily: 'sans-serif',
            cursor: 'pointer',
            backgroundColor: '#fff',
          }}
        >
          {wardrobeItems.map((garment) => (
            <option key={garment._id} value={garment._id}>
              {garment.item_name}
            </option>
          ))}
        </select>
      )}

      {/* Canvas wrapper — relative so the badge can be positioned inside */}
      {wardrobeItems && wardrobeItems.length > 0 ? (
        <div
          style={{
            position: 'relative',
            display: 'inline-block',
            maxWidth: '100%',
          }}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{
              borderRadius: '12px',
              border: '2px solid #ccc',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              background: '#000',
              display: 'block',
              maxWidth: '100%',
            }}
          />

          {/* Detection score badge — top-right corner */}
          <span
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: '600',
              color: '#fff',
              background:
                detectionScore > 60
                  ? '#10b981'
                  : detectionScore >= 30
                  ? '#f59e0b'
                  : '#ef4444',
              boxShadow: '0 1px 6px rgba(0,0,0,0.3)',
              letterSpacing: '0.02em',
            }}
          >
            Body: {detectionScore}%
          </span>
        </div>
      ) : (
        <div
          style={{
            width: `${CANVAS_WIDTH}px`,
            height: `${CANVAS_HEIGHT}px`,
            borderRadius: '12px',
            border: '2px solid #ccc',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            background: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <p
            style={{
              color: '#94a3b8',
              fontSize: '14px',
              margin: 0,
              textAlign: 'center',
            }}
          >
            Add items to your wardrobe to try them on.
          </p>
        </div>
      )}

      {/* Hint shown only when detection is poor */}
      {detectionScore < 30 && wardrobeItems && wardrobeItems.length > 0 && (
        <p style={{ color: '#ef4444', fontSize: '0.82rem', margin: 0 }}>
          📏 Stand 2-3 metres from camera · Ensure good lighting
        </p>
      )}

      {/* Save Look button */}
      {wardrobeItems && wardrobeItems.length > 0 && (
        <button
          onClick={saveLook}
          disabled={detectionScore <= 30}
          style={{
            background: '#a78bfa',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 24px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: detectionScore > 30 ? 'pointer' : 'not-allowed',
            opacity: detectionScore > 30 ? 1 : 0.4,
            transition: 'opacity 0.2s ease',
          }}
        >
          💾 Save Look
        </button>
      )}
    </div>
  );
};

export default ARTryOn;
