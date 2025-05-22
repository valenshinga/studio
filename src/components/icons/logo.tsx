import { Languages } from 'lucide-react';
import type { SVGProps } from 'react';

export function LinguaCalLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2 p-1" aria-label="Logo de LinguaCal">
      <Languages className="h-8 w-8 text-primary" {...props} />
      <span className="text-xl font-semibold text-primary">LinguaCal</span>
    </div>
  );
}
