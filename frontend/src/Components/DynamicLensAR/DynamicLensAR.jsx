import { useState, useRef, useEffect } from 'react';
import {
  bootstrapCameraKit,
  createExtension,
  createMediaStreamSource,
  Injectable,
  remoteApiServicesFactory,
  Transform2D
} from '@snap/camera-kit';
import { toast } from 'react-toastify';
import { processGarmentTexture } from '../../api/arTryOnApi';
import { checkBrowserCompatibility, getSystemInfo } from '../../utils/browserCompatibility';
import './DynamicLensAR.css';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const DynamicLensAR = ({ onClose }) => {
  const [step, setStep] = useState('upload'); // 'upload', 'camera'
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [clothingType, setClothingType] = useState('sweatshirt');
  const [processing, setProcessing] = useState(false);
  const [textureUrl, setTextureUrl] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [compatibilityInfo, setCompatibilityInfo] = useState(null);

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const sessionRef = useRef(null);
  const sourceRef = useRef(null);
  const cameraKitRef = useRef(null);
  const lensRef = useRef(null);
  const processedTextureUrlRef = useRef(null);

  // Stores the raw texture bytes for the Remote API to serve directly to the lens
  const textureRef = useRef(null);

  // Remote API service — the lens calls "get_image" and we reply with the texture buffer
  const createRemoteApiService = () => ({
    apiSpecId: import.meta.env.VITE_REMOTE_API_SPEC_ID,
    getRequestHandler: (request) => {
      if (request.endpointId === 'get_image') {
        return (reply) => {
          const texture = textureRef.current;
          if (!texture) {
            reply({
              status: 'notFound',
              metadata: {},
              body: new ArrayBuffer(0)
            });
            return;
          }
          reply({
            status: 'success',
            metadata: { 'content-type': texture.mime },
            body: texture.buffer
          });
        };
      }
    }
  });

  // Re-apply the lens with updated garment / texture params without re-bootstrapping
  const applyLensWithData = async (garment, textureUrlValue) => {
    if (!sessionRef.current || !lensRef.current) return;
    try {
      await sessionRef.current.applyLens(lensRef.current, {
        launchParams: {
          garment,
          ...(textureUrlValue && { textureUrl: textureUrlValue })
        }
      });
    } catch (err) {
      console.error('Failed to re-apply lens:', err);
    }
  };

  // Handle garment type change — if camera is already active, re-apply lens immediately
  const handleGarmentChange = async (value) => {
    setClothingType(value);
    if (sessionRef.current && lensRef.current) {
      await applyLensWithData(value, processedTextureUrlRef.current);
    }
  };

  const clothingTypes = [
    { value: 'tshirt', label: 'T-Shirt' },
    { value: 'sweatshirt', label: 'Sweatshirt' },
    { value: 'hoodie', label: 'Hoodie' },
    { value: 'dress', label: 'Dress' },
    { value: 'leggings', label: 'Leggings' },
    { value: 'shorts', label: 'Shorts' }
  ];

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessAndStart = async () => {
    if (!selectedImage) {
      toast.error('Please select an image');
      return;
    }

    try {
      setProcessing(true);
      
      // Process the texture - pass file and garment type separately
      const response = await processGarmentTexture(selectedImage, clothingType);
      
      if (response.success) {
        // Build the full public URL for the texture
        const fullTextureUrl = response.texture.startsWith('http')
          ? response.texture
          : `${BACKEND_URL}${response.texture}`;

        setTextureUrl(fullTextureUrl);
        processedTextureUrlRef.current = fullTextureUrl;

        // Fetch the actual texture bytes so the Remote API can serve them to the lens
        try {
          const imageResponse = await fetch(fullTextureUrl, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
          });
          const buffer = await imageResponse.arrayBuffer();

          textureRef.current = {
            buffer,
            mime: 'image/png',
            name: selectedImage.name.replace(/\.[^.]+$/, '.png')
          };
        } catch (fetchErr) {
          console.warn('Could not pre-fetch texture bytes:', fetchErr);
          // Camera will still start; Remote API will return notFound until bytes arrive
        }

        toast.success('Texture processed! Starting AR camera...');
        setStep('camera');
      } else {
        throw new Error(response.error || 'Failed to process texture');
      }
    } catch (err) {
      console.error('Error processing texture:', err);
      toast.error('Failed to process texture: ' + (err.message || 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (step === 'camera' && textureUrl) {
      initializeCameraKit();
    }

    return () => {
      cleanup();
    };
  }, [step, textureUrl]);

  const checkWebGL2Support = () => {
    // Use the utility function
    const compatibility = checkBrowserCompatibility();
    setCompatibilityInfo(compatibility);
    
    console.log('Browser Compatibility:', compatibility);
    console.log('System Info:', getSystemInfo());
    
    return compatibility.webgl2Supported;
  };

  const initializeCameraKit = async () => {
    try {
      console.log('🎥 Initializing Camera Kit with dynamic texture...');
      
      if (!checkWebGL2Support()) {
        throw new Error('WebGL2 is not available. Please enable hardware acceleration in your browser settings or try a different browser.');
      }

      // Longer delay to prevent UI lag
      await new Promise(resolve => setTimeout(resolve, 300));

      if (!canvasRef.current) return;
      
      const apiToken = import.meta.env.VITE_API_TOKEN;
      const lensId = import.meta.env.VITE_LENS_ID;
      const lensGroupId = import.meta.env.VITE_LENS_GROUP_ID;

      if (!apiToken || !lensId || !lensGroupId) {
        throw new Error('Missing Snap Camera Kit credentials');
      }

      // Bootstrap Camera Kit with Remote API extension (only once)
      if (!cameraKitRef.current) {
        const remoteApiService = createRemoteApiService();
        const remoteApiProvider = Injectable(
          remoteApiServicesFactory.token,
          [],
          () => [remoteApiService]
        );
        const extension = createExtension().provides(remoteApiProvider);
        cameraKitRef.current = await bootstrapCameraKit(
          { apiToken },
          (container) => container.provides(extension)
        );
      }
      console.log('✅ Camera Kit bootstrapped with Remote API extension');

      const cameraKit = cameraKitRef.current;

      // Create session
      const session = await cameraKit.createSession({
        liveRenderTarget: canvasRef.current
      });
      console.log('✅ Session created');

      sessionRef.current = session;

      // Get user media
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      console.log('✅ Media stream obtained');

      // Create source
      const source = createMediaStreamSource(mediaStream, {
        transform: Transform2D.MirrorX,
        cameraType: 'user'
      });
      
      await session.setSource(source);
      sourceRef.current = source;
      console.log('✅ Source set');

      // Play
      await session.play();
      console.log('✅ Session playing');

      // Load lens
      const lens = await cameraKit.lensRepository.loadLens(lensId, lensGroupId);
      lensRef.current = lens;
      console.log('✅ Lens loaded');

      // Apply lens with garment type and texture URL via launchParams
      console.log('🖼️ Texture URL passed to lens:', processedTextureUrlRef.current);
      await session.applyLens(lens, {
        launchParams: {
          garment: clothingType,
          ...(processedTextureUrlRef.current && {
            textureUrl: processedTextureUrlRef.current
          })
        }
      });
      console.log('✅ Lens applied with garment type:', clothingType);

      setIsReady(true);
      toast.success('AR camera ready with your custom texture!');
    } catch (err) {
      console.error('❌ Error initializing Camera Kit:', err);
      setError(err.message);
      toast.error('Failed to initialize AR: ' + err.message);
    }
  };

  const cleanup = () => {
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

  const capturePhoto = () => {
    if (!canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const photoData = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = `ar-tryon-${Date.now()}.png`;
      link.href = photoData;
      link.click();

      toast.success('Photo captured!');
    } catch (err) {
      console.error('Failed to capture photo:', err);
      toast.error('Failed to capture photo');
    }
  };

  return (
    <div className="dynamic-lens-overlay">
      <div className="dynamic-lens-container">
        {/* Header */}
        <div className="dynamic-lens-header">
          <h3>{step === 'upload' ? 'Upload Clothing' : 'AR Try-On'}</h3>
          <button onClick={onClose} className="dynamic-lens-close">×</button>
        </div>

        {/* Upload Step */}
        {step === 'upload' && (
          <div className="upload-section">
            <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="image-preview" />
              ) : (
                <div className="upload-placeholder">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <p>Click to upload clothing image</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
            </div>

            <div className="clothing-type-selector">
              <label>Clothing Type:</label>
              <div className="type-buttons">
                {clothingTypes.map(type => (
                  <button
                    key={type.value}
                    className={`type-btn ${clothingType === type.value ? 'active' : ''}`}
                    onClick={() => handleGarmentChange(type.value)}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="start-ar-btn"
              onClick={handleProcessAndStart}
              disabled={!selectedImage || processing}
            >
              {processing ? 'Processing...' : 'Start AR Try-On'}
            </button>
          </div>
        )}

        {/* Camera Step */}
        {step === 'camera' && (
          <div className="camera-section">
            <div className="camera-wrapper">
              {error ? (
                <div className="camera-error">
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
                    <button onClick={() => setStep('upload')} className="back-btn">
                      Back to Upload
                    </button>
                    <a 
                      href="chrome://settings/system" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="settings-btn"
                    >
                      Browser Settings
                    </a>
                  </div>
                </div>
              ) : !isReady ? (
                <div className="camera-loading">
                  <div className="spinner"></div>
                  <p>Initializing AR camera...</p>
                  <p style={{ fontSize: '0.9em', opacity: 0.7, marginTop: '8px' }}>This may take a few seconds</p>
                </div>
              ) : null}
              <canvas 
                ref={canvasRef} 
                className="camera-canvas"
                width={1280}
                height={720}
                style={{ display: isReady ? 'block' : 'none' }}
              />
            </div>

            {isReady && !error && (
              <div className="camera-controls">
                <button onClick={capturePhoto} className="capture-btn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  Capture
                </button>
                <button onClick={() => setStep('upload')} className="change-btn">
                  Change Image
                </button>
                {textureUrl && (
                  <a 
                    href={textureUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="view-texture-btn"
                    title="View processed texture (opens backend URL)"
                  >
                    View Texture
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicLensAR;
