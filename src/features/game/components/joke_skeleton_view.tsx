import { motion } from 'framer-motion';

import { Card } from '../../../shared/components/ui/card';

export function JokeSkeletonView() {
  return (
    <Card className="game-panel">
      <div className="skeleton-stack" aria-hidden="true">
        <motion.div
          animate={{ opacity: [0.35, 0.8, 0.35] }}
          className="skeleton-line skeleton-wide"
          transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY }}
        />
        <motion.div
          animate={{ opacity: [0.35, 0.7, 0.35] }}
          className="skeleton-line"
          transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }}
        />
        <motion.div
          animate={{ opacity: [0.35, 0.65, 0.35] }}
          className="skeleton-line"
          transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY }}
        />
      </div>
    </Card>
  );
}
