function shortUser(userId?: string) {
  return (userId ?? "g").replace(/[^a-z0-9]/gi, "").slice(0, 10) || "g";
}

export function eventId(userId?: string) {
  return `e_${shortUser(userId)}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`;
}

export function markEventId(userId: string, profileId: string, action: string, movieId: string) {
  return `m_${shortUser(userId)}_${profileId}_${action}_${movieId}`.slice(0, 120);
}

export function sessionId() {
  return `s_${Date.now().toString(36)}`;
}
