import type { HTMLAttributes } from 'react';

import { merge_class_names } from '../../utils/merge_class_names';

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ children, className, ...div_props }: CardProps) {
  return (
    <div className={merge_class_names('ui-card', className)} {...div_props}>
      {children}
    </div>
  );
}
