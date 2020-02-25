export const easings = {
  LINEAR: (value) => value,
  EASE_OUT: (value, power = 2) => (
    1 - (1 - value) ** power
  ),
}

export const tween = ({
  from = 0,
  to = 1,
  duration = 1000,
  ease = easings.EASE_OUT,
  onUpdate,
  onComplete,
} = {}) => {
  const startTime = performance.now();
  const delta = to - from;

  const update = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = (ease(progress) * delta) + from;

    if (onUpdate) onUpdate(value);

    if (progress < 1)
      requestAnimationFrame(update);
    else if (onComplete)
      onComplete();
  };

  requestAnimationFrame(update);
};

