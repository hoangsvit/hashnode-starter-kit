import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';

interface LightboxProps {
  isOpen: boolean;
  imageUrl: string;
  alt: string;
  onClose: () => void;
}

const Lightbox = ({ isOpen, imageUrl, alt, onClose }: LightboxProps) => {
  const t = useTranslations('common.lightbox');
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [imgDimensions, setImgDimensions] = useState({ width: 1200, height: 800 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showHelp, setShowHelp] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Check on initial render
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Reset zoom and position when image changes or lightbox closes/opens
  useEffect(() => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  }, [imageUrl, isOpen]);

  useEffect(() => {
    setMounted(true);
    
    // Prevent scrolling when lightbox is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      // Preload and get dimensions of the image
      const img = new window.Image();
      img.onload = () => {
        setImgDimensions({
          width: img.width,
          height: img.height
        });
      };
      img.src = imageUrl;
    }
    
    // Add keyboard event listeners
    const handleKeyboard = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          setZoomLevel(prev => Math.min(5, prev + 0.5));
          break;
        case '-':
          setZoomLevel(prev => {
            const newZoom = Math.max(1, prev - 0.5);
            if (newZoom === 1) setPosition({ x: 0, y: 0 });
            return newZoom;
          });
          break;
        case '0':
          setZoomLevel(1);
          setPosition({ x: 0, y: 0 });
          break;
        case 'ArrowUp':
          if (zoomLevel > 1) {
            e.preventDefault();
            setPosition(prev => ({ x: prev.x, y: prev.y + 20 }));
          }
          break;
        case 'ArrowDown':
          if (zoomLevel > 1) {
            e.preventDefault();
            setPosition(prev => ({ x: prev.x, y: prev.y - 20 }));
          }
          break;
        case 'ArrowLeft':
          if (zoomLevel > 1) {
            e.preventDefault();
            setPosition(prev => ({ x: prev.x + 20, y: prev.y }));
          }
          break;
        case 'ArrowRight':
          if (zoomLevel > 1) {
            e.preventDefault();
            setPosition(prev => ({ x: prev.x - 20, y: prev.y }));
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyboard);
    
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyboard);
    };
  }, [isOpen, onClose, imageUrl, zoomLevel]);

  // Hide help tooltip after a few seconds
  useEffect(() => {
    if (isOpen && showHelp && !isMobile) { // Only show help on desktop
      const timer = setTimeout(() => {
        setShowHelp(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, showHelp, isMobile]);

  // Reset help state when lightbox opens
  useEffect(() => {
    if (isOpen) {
      setShowHelp(true);
    }
  }, [isOpen]);

  // Handle mouse wheel for zooming
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    setZoomLevel(prevZoom => {
      const newZoom = Math.max(1, Math.min(5, prevZoom + delta));
      return newZoom;
    });
  }, []);

  // Handle mouse down for dragging (when zoomed)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [zoomLevel, position]);

  // Handle mouse move for dragging
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart, zoomLevel]);

  // Handle mouse up to stop dragging
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (zoomLevel > 1 && e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ 
        x: touch.clientX - position.x, 
        y: touch.clientY - position.y 
      });
    }
  }, [zoomLevel, position]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isDragging && zoomLevel > 1 && e.touches.length === 1) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
      // Prevent page scrolling when dragging the image
      e.preventDefault();
    }
  }, [isDragging, dragStart, zoomLevel]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (!isOpen || !mounted) return null;

  // Portal the lightbox to the body to avoid styling conflicts
  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity"
      onClick={onClose}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="relative max-h-[90vh] max-w-[90vw]">
        {/* Help tooltip - only shown on desktop */}
        {showHelp && !isMobile && (
          <div className="lightbox-help-tooltip absolute -top-14 left-1/2 z-[60] w-max -translate-x-1/2 rounded-lg bg-black/80 px-4 py-2 text-center text-sm text-white shadow-lg">
            <p>{t('mouseControls')}</p>
          </div>
        )}
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute -right-4 -top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl font-bold text-black shadow-lg hover:bg-gray-200"
          aria-label={t('close')}
        >
          ×
        </button>
        
        {/* Zoom controls */}
        <div className="lightbox-zoom-controls absolute bottom-4 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-3 rounded-full bg-white/90 px-4 py-2 text-black shadow-lg dark:bg-black/80 dark:text-white">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setZoomLevel(Math.max(1, zoomLevel - 0.5));
              setPosition({ x: 0, y: 0 });
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
            disabled={zoomLevel <= 1}
            aria-label={t('zoomOut')}
          >
            <span className="text-xl font-bold">−</span>
          </button>
          
          <div className="lightbox-zoom-text min-w-[40px] text-center">
            {Math.round(zoomLevel * 100)}%
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setZoomLevel(Math.min(5, zoomLevel + 0.5));
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
            disabled={zoomLevel >= 5}
            aria-label={t('zoomIn')}
          >
            <span className="text-xl font-bold">+</span>
          </button>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setZoomLevel(1);
              setPosition({ x: 0, y: 0 });
            }}
            className="lightbox-reset-button ml-1 flex items-center justify-center rounded-full bg-slate-200 px-2 py-1 text-sm hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
            disabled={zoomLevel === 1}
            aria-label={t('reset')}
          >
            {t('reset')}
          </button>
        </div>
        
        <div 
          className="overflow-hidden" 
          onClick={(e) => e.stopPropagation()}
          onWheel={handleWheel}
        >
          <div 
            className="relative"
            style={{ 
              width: Math.min(imgDimensions.width, window.innerWidth * 0.85),
              height: Math.min(imgDimensions.height, window.innerHeight * 0.85),
              maxWidth: '85vw',
              maxHeight: '85vh',
              cursor: zoomLevel > 1 ? 'grab' : 'default',
              overflow: 'hidden'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div style={{
              transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
              transformOrigin: 'center',
              transition: isDragging ? 'none' : 'transform 0.2s',
              width: '100%',
              height: '100%'
            }}>
              <Image 
                src={imageUrl} 
                alt={alt} 
                fill
                sizes="85vw"
                style={{ 
                  objectFit: 'contain',
                  pointerEvents: 'none'
                }}
                priority
                unoptimized={true} // To avoid image quality loss during zoom
              />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Lightbox;
