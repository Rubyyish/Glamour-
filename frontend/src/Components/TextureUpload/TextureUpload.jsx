import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  processGarmentTexture,
  saveTextureToProfile,
  getUserTextures
} from '../../api/arTryOnApi';
import './TextureUpload.css';

const TextureUpload = ({ onTextureProcessed, onClose }) => {
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedTexture, setProcessedTexture] = useState(null);
  const [garmentType, setGarmentType] = useState('sweatshirt');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const garmentTypes = [
    { value: 'shirt', label: 'T-Shirt' },
    { value: 'pants', label: 'Pants' },
    { value: 'sweatshirt', label: 'Sweatshirt' },
    { value: 'jacket', label: 'Jacket' },
    { value: 'dress', label: 'Dress' },
    { value: 'skirt', label: 'Skirt' },
    { value: 'sweater', label: 'Sweater' },
    { value: 'other', label: 'Other' }
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setProcessedTexture(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setProcessedTexture(null);
    } else {
      toast.error('Please drop an image file');
    }
  };

  const processTexture = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }

    try {
      setIsProcessing(true);
      const result = await processGarmentTexture(selectedImage, garmentType);

      if (result.success) {
        setProcessedTexture(result);
        toast.success('Texture processed successfully!');
        
        if (onTextureProcessed) {
          onTextureProcessed(result);
        }
      } else {
        toast.error(result.error || 'Failed to process texture');
      }
    } catch (error) {
      console.error('Error processing texture:', error);
      toast.error('Failed to process texture. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const saveTexture = async () => {
    if (!processedTexture || !processedTexture.filename) {
      toast.error('No processed texture to save');
      return;
    }

    try {
      setIsSaving(true);
      const result = await saveTextureToProfile(
        processedTexture.filename,
        garmentType,
        description
      );

      if (result.success) {
        console.log('Texture saved:', result);
        toast.success('✅ Texture saved to your profile! Now it\'s available in AR Try-On.');
        
        // Notify parent that texture was saved successfully
        if (onTextureProcessed) {
          onTextureProcessed({
            success: true,
            texture: processedTexture.texture,
            filename: processedTexture.filename,
            saved: true
          });
        }
        
        // Reset form
        setSelectedImage(null);
        setPreviewUrl(null);
        setProcessedTexture(null);
        setDescription('');
        
        if (onClose) {
          setTimeout(onClose, 500); // Small delay to show success toast
        }
      } else {
        toast.error(result.message || 'Failed to save texture');
      }
    } catch (error) {
      console.error('Error saving texture:', error);
      toast.error('Failed to save texture. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const downloadTexture = async () => {
    if (!processedTexture?.texture) {
      toast.error('No texture available to download');
      return;
    }

    try {
      const response = await fetch(processedTexture.texture);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `texture-${garmentType}-${new Date().getTime()}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading texture:', error);
      toast.error('Failed to download texture');
    }
  };

  return (
    <div className="texture-upload-modal">
      <div className="texture-upload-container">
        <div className="texture-upload-header">
          <h2>Upload & Process Texture</h2>
          {onClose && (
            <button onClick={onClose} className="texture-close-btn">
              ×
            </button>
          )}
        </div>

        <div className="texture-upload-content">
          {/* Step 1: Upload Image */}
          <div className="texture-step">
            <h3>Step 1: Select Image</h3>
            
            <div
              className="texture-dropzone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <div className="texture-preview-wrapper">
                  <img src={previewUrl} alt="Selected" className="texture-preview-img" />
                  <button
                    type="button"
                    className="texture-change-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <div className="texture-dropzone-content">
                  <p className="texture-icon">📸</p>
                  <p>Drag image here or click to select</p>
                  <p className="texture-hint">PNG, JPG, or GIF (2MB max)</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                hidden
              />
            </div>
          </div>

          {/* Step 2: Garment Type */}
          <div className="texture-step">
            <h3>Step 2: Select Garment Type</h3>
            <select
              value={garmentType}
              onChange={(e) => setGarmentType(e.target.value)}
              className="texture-select"
            >
              {garmentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Step 3: Process */}
          {!processedTexture && (
            <div className="texture-step">
              <h3>Step 3: Process Texture</h3>
              <button
                onClick={processTexture}
                disabled={!selectedImage || isProcessing}
                className="texture-process-btn"
              >
                {isProcessing ? 'Processing...' : 'Process Texture'}
              </button>
            </div>
          )}

          {/* Step 4: Preview & Save */}
          {processedTexture && (
            <div className="texture-step">
              <h3>Step 4: Save Texture to Profile</h3>
              <p className="texture-step-info">✨ Preview of your processed texture:</p>
              
              <div className="texture-result-preview">
                <img 
                  src={processedTexture.texture} 
                  alt="Processed texture" 
                  className="texture-result-img"
                />
              </div>

              <input
                type="text"
                placeholder="Add a description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="texture-description-input"
              />

              <div className="texture-action-buttons">
                <button
                  onClick={downloadTexture}
                  className="texture-download-btn"
                >
                  📥 Download Texture
                </button>
                <button
                  onClick={saveTexture}
                  disabled={isSaving}
                  className="texture-save-btn"
                >
                  {isSaving ? '💾 Saving...' : '💾 Save to Profile (Required)'}
                </button>
              </div>

              <p className="texture-save-hint">
                ⚠️ You must click "Save to Profile" to use this texture in AR Try-On!
              </p>

              <button
                onClick={() => {
                  setSelectedImage(null);
                  setPreviewUrl(null);
                  setProcessedTexture(null);
                  setDescription('');
                }}
                className="texture-reset-btn"
              >
                ↩️ Process Another Image
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextureUpload;
