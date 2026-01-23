import { useEffect, useRef, useState } from 'react';
import { bootstrapCameraKit, createMediaStreamSource, Transform2D } from '@snap/camera-kit';
import { toast } from 'react-toastify';
import { checkBrowserCompatibility, getSystemInfo } from '../../utils/browserCompatibility';
import './LensStudioAR.css';

const LensStudioAR = ({ item, onClose }) => {
  const canvasRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [compatibilityInfo, setCompatibilityInfo] = useState(null);
  const sessionRef = useRef(null);
  const sourceRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const initializeCameraKit = async () => {
      try {
        console.log('🎥 Initializing Snap Camera Kit from npm...');
        
        // Check browser compatibility
        const compatibility = checkBrowserCompatibility();
        setCompatibilityInfo(compatibility);
        
        console.log('Browser Compatibility:', compatibility);
        console.log('System Info:', getSystemInfo());
        
        if (!compatibility.isCompatible) {
          const errorMsg = `AR is not supported: ${compatibility.issues.join(', ')}`;
          throw new Error(errorMsg);
        }

        // Longer delay to prevent lag
        await new Promise(resolve => setTimeout(resolve, 300));

        if (!mounted || !canvasRef.current) {
          return;
        }
        
        const apiToken = import.meta.env.VITE_API_TOKEN;
        const lensId = import.meta.env.VITE_LENS_ID;
        const lensGroupId = import.meta.env.VITE_LENS_GROUP_ID;

        console.log('📋 Config:', { 
          hasApiToken: !!apiToken, 
          lensId, 
          lensGroupId 
        });

        if (!apiToken || !lensId || !lensGroupId) {
          throw new Error('Missing Snap Camera Kit credentials in .env file');
        }

        // Bootstrap Camera Kit
        const cameraKit = await bootstrapCameraKit({ apiToken });
        console.log('✅ Camera Kit bootstrapped');

        if (!mounted) return;

        // Create session
        const session = await cameraKit.createSession({
          liveRenderTarget: canvasRef.current
        });
        console.log('✅ Session created');

        sessionRef.current = session;

        if (!mounted) return;

        // Get user media
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        console.log('✅ Media stream obtained');

        if (!mounted) return;

        // Create source from media stream
        const source = createMediaStreamSource(mediaStream, {
          transform: Transform2D.MirrorX,
          cameraType: 'front'
        });
        
        await session.setSource(source);
        sourceRef.current = source;
        console.log('✅ Source set');

        if (!mounted) return;

        // Play the source
        await source.setRenderSize(canvasRef.current.width, canvasRef.current.height);
        await session.play();
        console.log('✅ Session playing');

        if (!mounted) return;

        // Load and apply lens
        const lens = await cameraKit.lensRepository.loadLens(lensId, lensGroupId);
        console.log('✅ Lens loaded:', lens);

        await session.applyLens(lens);
        console.log('✅ Lens applied');

        if (mounted) {
          setIsReady(true);
          setIsInitializing(false);
          toast.success('AR camera ready!');
        }
      } catch (err) {
        console.error('❌ Error initializing Camera Kit:', err);
        if (mounted) {
          setError(err.message);
          setIsInitializing(false);
          toast.error('Failed to initialize AR camera: ' + err.message);
        }
      }
    };

    initializeCameraKit();

    return () => {
      mounted = false;
      
      // Cleanup
      if (sourceRef.current) {
        try {
          const tracks = sourceRef.current.mediaStream?.getTracks();
          tracks?.forEach(track => track.stop());
        } catch (err) {
          console.error('Error stopping tracks:', err);
        }
      }
      
      if (sessionRef.current) {
        try {
          sessionRef.current.pause();
          sessionRef.current.destroy();
        } catch (err) {
          console.error('Error destroying session:', err);
        }
      }
    };
  }, []);

  const capturePhoto = () => {
    if (!canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const photoData = canvas.toDataURL('image/png');
      
      // Create download link
      const link = document.createElement('a');
      link.download = `ar-tryon-${item?.name || 'photo'}-${Date.now()}.png`;
      link.href = photoData;
      link.click();

      toast.success('Photo captured and downloaded!');
    } catch (err) {
      console.error('Failed to capture photo:', err);
      toast.error('Failed to capture photo');
    }
  };

  return (
    <div className="lens-studio-ar-overlay">
      <div className="lens-studio-ar-container">
        {/* Header */}
        <div className="lens-studio-ar-header">
          <div className="lens-studio-ar-item-info">
            <h3>{item?.name || 'AR Try-On'}</h3>
            {item?.brand && <p>{item.brand}</p>}
          </div>
          <button onClick={onClose} className="lens-studio-ar-close">
            ×
          </button>
        </div>

        {/* Camera Canvas */}
        <div className="lens-studio-ar-canvas-wrapper">
          {error ? (
            <div className="lens-studio-ar-error">
              <div className="error-icon">⚠️</div>
              <h3>AR Not Available</h3>
              <p className="error-message">{error}</p>
              
              {compatibilityInfo && compatibilityInfo.recommendations.length > 0 && (
                <div className="error-recommendations">
                  <p className="recommendations-title">How to fix:</p>
                  <ul>
                    {compatibilityInfo.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {compatibilityInfo && (
                <div className="system-info">
                  <p><strong>Browser:</strong> {compatibilityInfo.browser.name} {compatibilityInfo.browser.version}</p>
                  <p><strong>WebGL2:</strong> {compatibilityInfo.webgl2Supported ? '✅ Supported' : '❌ Not Supported'}</p>
                  <p><strong>Hardware Acceleration:</strong> {
                    compatibilityInfo.hardwareAcceleration === 'enabled' ? '✅ Enabled' :
                    compatibilityInfo.hardwareAcceleration === 'disabled' ? '❌ Disabled' :
                    '❓ Unknown'
                  }</p>
                </div>
              )}
              
              <div className="error-actions">
                <button onClick={onClose} className="error-close-btn">Close</button>
                <a 
                  href="chrome://settings/system" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="error-settings-btn"
                >
                  Open Browser Settings
                </a>
              </div>
            </div>
          ) : isInitializing ? (
            <div className="lens-studio-ar-loading">
              <div className="spinner"></div>
              <p>Initializing AR camera...</p>
              <p style={{ fontSize: '0.9em', opacity: 0.7, marginTop: '8px' }}>This may take a few seconds</p>
            </div>
          ) : null}
          <canvas 
            ref={canvasRef} 
            className="lens-studio-ar-canvas"
            width={1280}
            height={720}
            style={{ display: isReady ? 'block' : 'none' }}
          />
        </div>

        {/* Controls */}
        {isReady && !error && (
          <div className="lens-studio-ar-controls">
            <button
              onClick={capturePhoto}
              className="lens-studio-ar-capture-btn"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Capture Photo
            </button>
          </div>
        )}

        {/* Instructions */}
        {isReady && !error && (
          <div className="lens-studio-ar-instructions">
            <p>📸 Move around to see the AR effect in real-time</p>
            <p>💡 The lens will track your body movements</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LensStudioAR;
