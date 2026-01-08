/**
 * Browser Compatibility Checker for AR Features
 * Checks WebGL2, hardware acceleration, and browser support
 */

export const checkBrowserCompatibility = () => {
  const results = {
    isCompatible: true,
    webgl2Supported: false,
    hardwareAcceleration: 'unknown',
    browser: detectBrowser(),
    issues: [],
    recommendations: []
  };

  // Check WebGL2 support
  results.webgl2Supported = checkWebGL2Support();
  
  if (!results.webgl2Supported) {
    results.isCompatible = false;
    results.issues.push('WebGL2 is not supported or disabled');
    results.recommendations.push('Enable hardware acceleration in browser settings');
    results.recommendations.push('Update your graphics drivers');
    results.recommendations.push('Try Chrome, Firefox, or Edge browser');
  }

  // Check hardware acceleration
  results.hardwareAcceleration = checkHardwareAcceleration();
  
  if (results.hardwareAcceleration === 'disabled') {
    results.isCompatible = false;
    results.issues.push('Hardware acceleration is disabled');
    results.recommendations.push('Enable hardware acceleration in browser settings');
  }

  // Check browser compatibility
  if (!isSupportedBrowser(results.browser)) {
    results.issues.push(`${results.browser.name} may have limited AR support`);
    results.recommendations.push('Use Chrome, Firefox, or Edge for best experience');
  }

  return results;
};

/**
 * Check if WebGL2 is supported
 */
export const checkWebGL2Support = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('experimental-webgl2');
    
    if (!gl) {
      console.error('❌ WebGL2 context not available');
      return false;
    }
    
    // Additional check: verify WebGL2 is actually working
    const isWorking = gl.getParameter(gl.VERSION);
    
    if (!isWorking) {
      console.error('❌ WebGL2 context exists but not working');
      return false;
    }
    
    console.log('✅ WebGL2 is supported and working');
    console.log('WebGL Version:', isWorking);
    return true;
  } catch (e) {
    console.error('❌ WebGL2 check failed:', e);
    return false;
  }
};

/**
 * Check hardware acceleration status
 */
export const checkHardwareAcceleration = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!gl) {
      return 'disabled';
    }

    // Check for software renderer (indicates no hardware acceleration)
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      console.log('GPU Renderer:', renderer);
      
      // Check if using software renderer
      if (renderer.toLowerCase().includes('swiftshader') || 
          renderer.toLowerCase().includes('llvmpipe') ||
          renderer.toLowerCase().includes('software')) {
        console.warn('⚠️ Using software renderer (no hardware acceleration)');
        return 'disabled';
      }
      
      console.log('✅ Hardware acceleration enabled');
      return 'enabled';
    }
    
    return 'unknown';
  } catch (e) {
    console.error('Hardware acceleration check failed:', e);
    return 'unknown';
  }
};

/**
 * Detect browser name and version
 */
export const detectBrowser = () => {
  const ua = navigator.userAgent;
  let browserName = 'Unknown';
  let version = 'Unknown';

  // Chrome
  if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) {
    browserName = 'Chrome';
    version = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
  }
  // Edge
  else if (ua.indexOf('Edg') > -1) {
    browserName = 'Edge';
    version = ua.match(/Edg\/(\d+)/)?.[1] || 'Unknown';
  }
  // Firefox
  else if (ua.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
    version = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
  }
  // Safari
  else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
    browserName = 'Safari';
    version = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
  }

  return { name: browserName, version };
};

/**
 * Check if browser is supported for AR
 */
export const isSupportedBrowser = (browser) => {
  const supported = ['Chrome', 'Edge', 'Firefox'];
  return supported.includes(browser.name);
};

/**
 * Get detailed system info for debugging
 */
export const getSystemInfo = () => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  
  const info = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    vendor: navigator.vendor,
    language: navigator.language,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigator.deviceMemory || 'Unknown',
    webgl: null
  };

  if (gl) {
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    info.webgl = {
      version: gl.getParameter(gl.VERSION),
      vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown',
      renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown',
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS)
    };
  }

  return info;
};

/**
 * Generate user-friendly error message
 */
export const getCompatibilityMessage = (compatibilityResults) => {
  if (compatibilityResults.isCompatible) {
    return {
      type: 'success',
      title: 'Your browser supports AR',
      message: 'You can use all AR features.'
    };
  }

  return {
    type: 'error',
    title: 'AR Not Supported',
    message: compatibilityResults.issues.join('. '),
    recommendations: compatibilityResults.recommendations
  };
};
