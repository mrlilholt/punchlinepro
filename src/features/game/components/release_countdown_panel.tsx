import { Clock3 } from 'lucide-react';
import { motion } from 'framer-motion';

import { Card } from '../../../shared/components/ui/card';
import { useReleaseCountdownHook } from '../hooks/use_release_countdown_hook';

export function ReleaseCountdownPanel() {
  const { countdownLabel, currentSlotLabel, nextReleaseLabel } = useReleaseCountdownHook();

  return (
    <Card className="release-countdown-panel">
      <div className="release-countdown-header">
        <p className="panel-eyebrow">Next joke release</p>
        <div className="release-countdown-chip">
          <Clock3 aria-hidden="true" size={14} />
          <span>{currentSlotLabel}</span>
        </div>
      </div>
      <div className="release-countdown-body">
        <motion.p
          key={countdownLabel}
          animate={{ opacity: 1, y: 0 }}
          className="release-countdown-clock"
          initial={{ opacity: 0.55, y: 4 }}
          transition={{ duration: 0.18 }}
        >
          {countdownLabel}
        </motion.p>
        <p className="muted-copy">Countdown to the next drop at {nextReleaseLabel}</p>
      </div>
    </Card>
  );
}
