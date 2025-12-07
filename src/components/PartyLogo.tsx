import { cn } from '@/lib/utils';

interface PartyLogoProps {
  src: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
  xl: 'w-24 h-24',
};

const PartyLogo = ({ src, alt, size = 'md', className }: PartyLogoProps) => {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center shrink-0',
        'rounded-xl overflow-visible',
        'bg-white dark:bg-white',
        'shadow-sm dark:shadow-none',
        'ring-1 ring-border/10 dark:ring-white/20',
        sizeClasses[size],
        className
      )}
    >
      <img
        src={src}
        alt={alt}
        className={cn(
          'w-[85%] h-[85%]',
          'object-contain',
          'select-none',
          'drop-shadow-sm'
        )}
        style={{
          imageRendering: 'auto',
        }}
        draggable={false}
      />
    </div>
  );
};

export default PartyLogo;
