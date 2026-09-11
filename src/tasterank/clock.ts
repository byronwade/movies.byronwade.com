export function minutesUntilBed(now = new Date()) {
  const h = now.getHours() + now.getMinutes() / 60;
  if (h < 6) return 110;
  const bed = 23 + 10 / 60;
  const left = (bed - h) * 60;
  return Math.round(Math.max(45, Math.min(220, left)));
}

export function fitsTonight(runtimeMin: number, left: number) {
  return runtimeMin <= left + 15;
}

export function clockLine(runtimeMin: number, left: number) {
  if (runtimeMin <= left - 20) return `Fits tonight · ${runtimeMin}m`;
  if (runtimeMin <= left + 12) return `Close to bedtime · ${runtimeMin}m`;
  return `${runtimeMin - Math.round(left)}m past bedtime`;
}
