export function getProgressFillStyle(percent: number) {
  const safe = Math.max(0, Math.min(100, percent));
  const gradient =
    safe >= 50
      ? 'linear-gradient(90deg, #3D9DF3 0%, #1500FF 100%)'
      : 'linear-gradient(90deg, #F46767 0%, #3D9DF3 100%)';
  return {
    width: `${safe}%`,
    background: gradient,
  };
}
