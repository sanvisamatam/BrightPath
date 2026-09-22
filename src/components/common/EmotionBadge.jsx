import React from 'react';
import { Smile, Frown, Meh, Flame, AlertCircle } from 'lucide-react';
import { EMOTIONS } from '../../services/emotionDetector';

export const EmotionBadge = ({ emotion, showIcon = true, size = 'md' }) => {
  const getBadgeConfig = (emo) => {
    switch (emo) {
      case EMOTIONS.HAPPY:
        return { class: 'badge-happy', icon: Smile, label: 'Happy' };
      case EMOTIONS.SAD:
        return { class: 'badge-sad', icon: Frown, label: 'Sad' };
      case EMOTIONS.NEUTRAL:
        return { class: 'badge-neutral', icon: Meh, label: 'Neutral' };
      case EMOTIONS.ANGRY:
        return { class: 'badge-angry', icon: Flame, label: 'Angry' };
      case EMOTIONS.FRUSTRATED:
        return { class: 'badge-frustrated', icon: AlertCircle, label: 'Frustrated' };
      default:
        return { class: 'badge-neutral', icon: Meh, label: emo || 'Neutral' };
    }
  };

  const config = getBadgeConfig(emotion);
  const IconComponent = config.icon;

  const sizeClass = size === 'lg' ? 'padding: 0.5rem 1.2rem; font-size: 1rem;' : '';

  return (
    <span className={`badge ${config.class}`} style={{ fontSize: size === 'lg' ? '1rem' : undefined }}>
      {showIcon && <IconComponent size={size === 'lg' ? 20 : 16} />}
      <span>{config.label}</span>
    </span>
  );
};

export default EmotionBadge;
