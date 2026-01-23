import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { saveARPhoto, getUserTextures, getLatestTextureConfig } from '../../api/arTryOnApi';
import TextureUpload from '../TextureUpload/TextureUpload';
import './ARTryOn.css';

const ARTryOn = ({ item, onClose }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showTextureUpload, setShowTextureUpload] = useState(false);
  const [userTextures, setUserTextures] = useState([]);
  const [selectedTexture, setSelectedTexture] = useState(null);
  const [isLoadingTextures, setIsLoadingTextures] = useState(false);

  useEffect(() => {
    startCamera();
    loadUserTextures();
    return () => {
      stopCamera();
    };
  }, []);

  const loadUserTextures = async () => {
    try {
      setIsLoadingTextures(true);
      const response = await getUserTextures();
      if (response.success) {
        setUserTextures(response.textures || []);
        // If there's a default texture, select it
        if (response.textures && response.textures.length > 0) {
          setSelectedTexture(response.textures[0]);
        }
      }
    } catch (error) {
      console.error('Error loading textures:', error);
      // Not critical, user can continue without textures
    } finally {
      setIsLoadingTextures(false);
    }
  };

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsCameraActive(true);
          setIsLoading(false);
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please ensure camera permissions are granted.');
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      
      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Draw item overlay or texture (centered on upper body area)
      const overlayImage = selectedTexture?.textureUrl || item?.image;
      if (overlayImage) {
        try {
          // Construct full URL for texture
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
          const fullUrl = overlayImage.startsWith('http') 
            ? overlayImage 
            : overlayImage.startsWith('/api')
              ? `${apiUrl}${overlayImage}`
              : overlayImage;
          
          console.log('Loading texture from:', fullUrl);
          
          // Fetch image as blob to avoid CORS issues
          const response = await fetch(fullUrl);
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          
          const img = new Image();
          
          img.onload = () => {
            // Calculate overlay size - make it larger and more shirt-like
            const overlayWidth = canvas.width * 0.5; // Increased from 0.4 to 0.5
            const overlayHeight = overlayWidth * 1.2; // Make it taller (shirt proportions)
            const x = (canvas.width - overlayWidth) / 2;
            const y = canvas.height * 0.2; // Moved up slightly from 0.25 to 0.2
            
            // Add semi-transparent overlay with better opacity
            ctx.globalAlpha = 0.85; // Increased from 0.7 to 0.85 for better visibility
            ctx.drawImage(img, x, y, overlayWidth, overlayHeight);
            ctx.globalAlpha = 1.0;
            
            // Convert to image
            const imageData = canvas.toDataURL('image/png');
            setCapturedImage(imageData);
            
            // Clean up object URL
            URL.revokeObjectURL(objectUrl);
          };
          
          img.onerror = (error) => {
            console.error('Error loading overlay image:', error);
            toast.error('Failed to load texture. Using photo without overlay.');
            const imageData = canvas.toDataURL('image/png');
            setCapturedImage(imageData);
            URL.revokeObjectURL(objectUrl);
          };
          
          img.src = objectUrl;
        } catch (error) {
          console.error('Error fetching texture:', error);
          toast.error('Failed to load texture. Using photo without overlay.');
          const imageData = canvas.toDataURL('image/png');
          setCapturedImage(imageData);
        }
      } else {
        const imageData = canvas.toDataURL('image/png');
        setCapturedImage(imageData);
      }
    }
  };

  const retake = () => {
    setCapturedImage(null);
  };

  const downloadImage = () => {
    if (capturedImage) {
      const link = document.createElement('a');
      link.download = `ar-tryon-${item?.name || 'photo'}-${new Date().getTime()}.png`;
      link.href = capturedImage;
      link.click();
    }
  };

  const handleDone = async () => {
    if (capturedImage) {
      try {
        setIsSaving(true);
        
        await saveARPhoto({
          itemName: item?.name || 'AR Try-On',
          itemImage: item?.image || '',
          itemCategory: item?.category || 'General',
          photoData: capturedImage
        });

        toast.success('AR photo saved to your gallery!');
        onClose();
      } catch (error) {
        console.error('Error saving AR photo:', error);
        toast.error('Failed to save photo. You can still download it.');
      } finally {
        setIsSaving(false);
      }
    } else {
      onClose();
    }
  };

  const handleTextureProcessed = (result) => {
    if (result.success && result.texture) {
      // Reload textures after successful processing
      loadUserTextures();
      toast.info('Texture processed! Reload to use it in try-on.');
    }
  };

  return (
    <div className="ar-tryon-overlay">
      <div className="ar-tryon-container">
        <div className="ar-tryon-header">
          <h2>AR Try-On</h2>
          <button onClick={onClose} className="ar-close-btn">×</button>
        </div>

        {item && (
          <div className="ar-item-info">
            <img src={item.image} alt={item.name} className="ar-item-thumbnail" />
            <div>
              <h3>{item.name}</h3>
              <p>{item.brand}</p>
            </div>
          </div>
        )}

        {/* Texture Selection */}
        {!isLoadingTextures && (
          <div className="ar-texture-selector">
            <div className="texture-selector-header">
              <label>Apply Custom Texture:</label>
              <button 
                onClick={() => setShowTextureUpload(true)}
                className="texture-upload-trigger-btn"
                title="Upload a new texture"
              >
                + New Texture
              </button>
            </div>
            
            {userTextures.length > 0 && (
              <div className="texture-options">
                <button
                  className={`texture-option ${!selectedTexture ? 'active' : ''}`}
                  onClick={() => setSelectedTexture(null)}
                  title="Original item image"
                >
                  Original
                </button>
                {userTextures.map((texture) => {
                  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
                  const textureUrl = texture.textureUrl.startsWith('http') 
                    ? texture.textureUrl 
                    : `${apiUrl}${texture.textureUrl}`;
                  
                  return (
                    <button
                      key={texture._id}
                      className={`texture-option ${selectedTexture?._id === texture._id ? 'active' : ''}`}
                      onClick={() => setSelectedTexture(texture)}
                      title={texture.description || texture.garmentType}
                    >
                      <img src={textureUrl} alt={texture.garmentType} />
                      <span>{texture.garmentType}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="ar-camera-container">
          {isLoading && (
            <div className="ar-loading">
              <div className="spinner"></div>
              <p>Starting camera...</p>
            </div>
          )}

          {error && (
            <div className="ar-error">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p>{error}</p>
              <button onClick={startCamera} className="retry-btn">Try Again</button>
            </div>
          )}

          {!capturedImage ? (
            <>
              <video
                ref={videoRef}
                className={`ar-video ${isCameraActive ? 'active' : ''}`}
                autoPlay
                playsInline
                muted
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              {isCameraActive && (
                <div className="ar-overlay-guide">
                  <div className="guide-frame">
                    <div className="corner top-left"></div>
                    <div className="corner top-right"></div>
                    <div className="corner bottom-left"></div>
                    <div className="corner bottom-right"></div>
                  </div>
                  <p className="guide-text">Position yourself in the frame</p>
                </div>
              )}
            </>
          ) : (
            <div className="ar-captured-container">
              <img src={capturedImage} alt="Captured" className="ar-captured-image" />
            </div>
          )}
        </div>

        <div className="ar-controls">
          {!capturedImage ? (
            <>
              <button 
                onClick={capturePhoto} 
                className="ar-capture-btn"
                disabled={!isCameraActive}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                Capture Photo
              </button>
              <button onClick={onClose} className="ar-cancel-btn">
                Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={downloadImage} className="ar-download-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download
              </button>
              <button onClick={retake} className="ar-retake-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10"/>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                </svg>
                Retake
              </button>
              <button 
                onClick={handleDone} 
                className="ar-done-btn"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="spinner-small"></div>
                    Saving...
                  </>
                ) : (
                  'Save & Done'
                )}
              </button>
            </>
          )}
        </div>

        <div className="ar-tips">
          <p>💡 Tips: Ensure good lighting and stand at arm's length from the camera</p>
        </div>
      </div>

      {/* Texture Upload Modal */}
      {showTextureUpload && (
        <TextureUpload
          onTextureProcessed={handleTextureProcessed}
          onClose={() => {
            setShowTextureUpload(false);
            loadUserTextures();
          }}
        />
      )}
    </div>
  );
};

export default ARTryOn;

