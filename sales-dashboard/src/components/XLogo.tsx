interface XLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function XLogo({ size = 'md', className = '' }: XLogoProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-10 h-10'
  };

  return (
    <svg 
      className={`${sizeClasses[size]} ${className}`} 
      viewBox="0 0 100 100" 
      fill="none"
    >
      {/* X Putih */}
      <path 
        d="M20 20 L50 50 L80 20 L80 30 L55 55 L80 80 L80 90 L50 60 L20 90 L20 80 L45 55 L20 30 Z" 
        fill="white"
      />
      {/* X Putih (overlay untuk ketebalan) */}
      <path 
        d="M25 25 L50 50 L75 25 L75 35 L55 55 L75 75 L75 85 L50 60 L25 85 L25 75 L45 55 L25 35 Z" 
        fill="white" 
        fillOpacity="0.9"
      />
    </svg>
  );
} 