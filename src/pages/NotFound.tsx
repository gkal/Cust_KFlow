import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import emailService from '../lib/services/emailService';

const NotFound = () => {
  const [isAnimated, setIsAnimated] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [imageError, setImageError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  
  // Randomize the glitched 404 text appearance
  const glitchArray = Array.from({ length: 10 }, (_, i) => i);

  // Handle mouse movement for parallax effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    
    setMousePosition({ x, y });
  };

  useEffect(() => {
    // Set page title and meta tags
    const originalTitle = document.title;
    document.title = "Kronos / 404. Η σελίδα δεν βρέθηκε";
    
    // Add content-type meta tag if it doesn't exist
    let contentTypeMetaTag = document.querySelector('meta[http-equiv="Content-Type"]');
    if (!contentTypeMetaTag) {
      contentTypeMetaTag = document.createElement('meta');
      contentTypeMetaTag.setAttribute('http-equiv', 'Content-Type');
      contentTypeMetaTag.setAttribute('content', 'text/html; charset=utf-8');
      document.head.appendChild(contentTypeMetaTag);
    }
    
    // Trigger animation after component mount
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 100);
    
    // Send notification email about the 404 error
    const sendNotification = async () => {
      try {
        // Get full URL with domain
        const fullUrl = window.location.href;
        
        await emailService.send404Notification({
          pageUrl: fullUrl,
          userAgent: navigator.userAgent,
          referrer: document.referrer || undefined,
          timestamp: new Date(),
          ipAddress: undefined // IP address is typically determined server-side
        });
      } catch (error) {
        console.error('Failed to send 404 notification:', error);
        // Don't show the error to the user
      }
    };
    
    // Only send the notification in production, not during development
    if (process.env.NODE_ENV === 'production') {
      sendNotification();
    }
    
    // Cleanup function to restore original title when component unmounts
    return () => {
      clearTimeout(timer);
      document.title = originalTitle;
      
      // Optional: Remove the meta tag if you created it
      if (contentTypeMetaTag && !document.querySelector('meta[http-equiv="Content-Type"][data-original="true"]')) {
        document.head.removeChild(contentTypeMetaTag);
      }
    };
  }, [location.pathname]); // Re-run if the path changes

  // Handle image error
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="flex flex-col items-center justify-center min-h-[90vh] px-4 overflow-hidden relative"
    >
      {/* Background grid elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`line-h-${i}`}
              className="absolute h-px bg-app-text-primary w-full"
              style={{ top: `${(i * 5)}%` }}
            />
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`line-v-${i}`}
              className="absolute w-px bg-app-text-primary h-full"
              style={{ left: `${(i * 5)}%` }}
            />
          ))}
        </div>
        
        {/* Animated dots */}
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={`dot-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${3 + Math.random() * 6}px`,
              height: `${3 + Math.random() * 6}px`,
              backgroundColor: 'var(--app-border-primary)',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.1 + Math.random() * 0.3,
              animation: `float ${5 + Math.random() * 5}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
      
      {/* Logo */}
      <div className="mb-6 z-10">
        {!imageError ? (
          <img 
            src="/assets/images/logo.png" 
            alt="Λογότυπο" 
            className="h-16 md:h-20"
            onError={handleImageError}
            style={{ 
              transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)`,
              transition: 'transform 0.1s ease-out'
            }}
          />
        ) : (
          <div 
            className="h-16 md:h-20 flex items-center justify-center font-bold text-2xl text-app-success"
            style={{ 
              transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)`,
              transition: 'transform 0.1s ease-out'
            }}
          >
            KRONOS
          </div>
        )}
      </div>
      
      {/* Glitched 404 Text */}
      <div className="relative mb-12 z-10">
        <div 
          className="relative"
          style={{ 
            transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          {/* Main 404 text with shadow */}
          <h1 className="text-[120px] md:text-[180px] font-bold leading-none text-app-success select-none relative">
            404
            <span className="absolute -top-1 -left-1 text-app-error opacity-30 blur-sm">404</span>
            <span className="absolute -bottom-1 -right-1 text-app-border-primary opacity-30 blur-sm">404</span>
          </h1>
          
          {/* Glitch layers */}
          {glitchArray.map((i) => (
            <div 
              key={i}
              className="absolute inset-0 opacity-0"
              style={{
                animation: `glitch-${i % 3} 4s infinite`,
                animationDelay: `${i * 0.1}s`,
                transform: `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`,
                clipPath: `polygon(${Math.random() * 100}% 0%, 100% ${Math.random() * 100}%, ${Math.random() * 100}% 100%, 0% ${Math.random() * 100}%)`,
                textShadow: `${Math.random() * 10 - 5}px ${Math.random() * 10 - 5}px 0 var(--app-error)`,
              }}
            >
              <h1 className="text-[120px] md:text-[180px] font-bold leading-none text-app-success select-none">
                404
              </h1>
            </div>
          ))}
        </div>
        
        <div 
          className={`text-center transition-all duration-1000 delay-300 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ 
            transform: `translate(${mousePosition.x * -10}px, ${mousePosition.y * -10}px)`,
            transition: 'transform 0.1s ease-out, opacity 1s, translate 1s'
          }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-app-text-primary mb-3">
            Η Σελίδα Δεν Βρέθηκε
          </h2>
          <p className="text-app-text-secondary max-w-md mx-auto">
            Η σελίδα που αναζητάτε ενδέχεται να έχει καταργηθεί, 
            να έχει αλλάξει όνομα ή να είναι προσωρινά μη διαθέσιμη.
          </p>
        </div>
      </div>
      
      {/* Action Buttons - Only "Go Home" button pointing to kronoseco.gr */}
      <div 
        className={`transition-all duration-1000 delay-700 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ 
          transform: `translate(${mousePosition.x * -5}px, ${mousePosition.y * -5}px)`,
          transition: 'transform 0.1s ease-out, opacity 1s, translate 1s'
        }}
      >
        <a 
          href="https://kronoseco.gr"
          className="bg-app-bg-tertiary text-app-text-primary border border-app-border-primary rounded-md py-2.5 px-6 hover:bg-app-hover-bg transition-colors relative overflow-hidden group inline-block"
        >
          <span className="relative z-10">Αρχική Σελίδα</span>
          <span className="absolute inset-0 bg-app-border-primary/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
        </a>
      </div>
      
      {/* Custom footer */}
      <div className={`mt-16 text-center text-app-text-muted text-sm transition-all duration-1000 delay-900 ${isAnimated ? 'opacity-100' : 'opacity-0'}`}>
        <p>© {new Date().getFullYear()} • Βοηθήστε μας να βρούμε αυτή τη σελίδα</p>
      </div>
      
      {/* Hidden easter egg text that appears on hover */}
      <div 
        className="fixed bottom-4 right-4 text-app-text-muted text-xs opacity-0 hover:opacity-70 transition-opacity cursor-default"
        title="Βρήκατε ένα μυστικό!"
      >
        Ακόμα και η σελίδα 404 μας είναι καλύτερη από τις αρχικές σελίδες των περισσότερων ιστοσελίδων
      </div>
    </div>
  );
};

export default NotFound; 