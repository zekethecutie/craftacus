export function createWelcomeState() {
  return { joinLastAt: 0, joinRecentMemberIds: [], verifiedLastAt: 0, verifiedMemberIds: [] };
}

export function shouldSendVerifiedWelcome(welcome, memberId, now, cooldownMs = 10 * 60_000) {
  const state = { ...createWelcomeState(), ...(welcome || {}) };
  const verified = new Set(state.verifiedMemberIds || []);
  if (verified.has(memberId)) return { send: false, state };
  if (state.verifiedLastAt && now - state.verifiedLastAt < cooldownMs) {
    verified.add(memberId);
    state.verifiedMemberIds = [...verified].slice(-100);
    return { send: false, state };
  }
  verified.add(memberId);
  state.verifiedLastAt = now;
  state.verifiedMemberIds = [...verified].slice(-100);
  return { send: true, state };
}
