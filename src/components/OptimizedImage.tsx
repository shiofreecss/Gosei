import React, { memo, useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  containerClassName?: string;
  caption?: string;
  isMobile?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = memo(({
  src,
  alt,
  fallbackSrc = "https://via.placeholder.com/600x400?text=Image+Not+Found",
  width = 600,
  height = 400,
  className = "go-game-image",
  containerClassName = "go-image-container",
  caption,
  isMobile = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Generate mobile-friendly src if needed
  const getMobileSrc = (originalSrc: string) => {
    // Extract file name and extension
    const lastDotIndex = originalSrc.lastIndexOf('.');
    const lastSlashIndex = originalSrc.lastIndexOf('/');
    
    if (lastDotIndex === -1 || lastSlashIndex === -1) return originalSrc;
    
    const fileName = originalSrc.substring(lastSlashIndex + 1, lastDotIndex);
    const fileExt = originalSrc.substring(lastDotIndex);
    const filePath = originalSrc.substring(0, lastSlashIndex + 1);
    
    return `${filePath}${fileName}-small${fileExt}`;
  };
  
  const mobileSrc = getMobileSrc(src);
  const imageSrcSet = `${mobileSrc} 480w, ${src} 800w`;
  const imageSizes = "(max-width: 768px) 100vw, 600px";

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = fallbackSrc;
  };
  
  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div className={containerClassName} style={{ 
      marginTop: '30px',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: isMobile ? '0 5px 15px rgba(0, 0, 0, 0.1)' : '0 10px 30px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.8)',
      transition: 'all 0.3s ease',
      backgroundColor: 'rgba(245, 245, 245, 0.5)'
    }}>
      <div style={{ 
        position: 'relative',
        width: '100%',
        paddingBottom: '66.67%', // 3:2 aspect ratio
        backgroundColor: 'rgba(245, 245, 245, 0.5)'
      }}>
        <img 
          src={src}
          srcSet={imageSrcSet}
          sizes={imageSizes}
          alt={alt} 
          className={className}
          loading="lazy"
          decoding="async"
          width={width}
          height={height}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            objectFit: 'cover',
            willChange: 'transform',
            contain: 'paint',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      </div>
      {caption && (
        <div style={{
          padding: '10px 15px',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(5px)',
          borderTop: '1px solid rgba(200, 210, 230, 0.5)',
          fontSize: '14px',
          color: '#444',
          textAlign: 'center'
        }}>
          {caption}
        </div>
      )}
    </div>
  );
});

export default OptimizedImage; 