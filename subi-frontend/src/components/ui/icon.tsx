
import { forwardRef } from 'react';
import type { LucideProps } from 'lucide-react';

export const Icon = forwardRef<SVGSVGElement, LucideProps>(
  function Icon({ ...props }, ref) {
    return <svg ref={ref} {...props} />;
  }
);
