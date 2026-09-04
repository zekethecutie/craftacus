import { status as queryStatus } from 'minecraft-server-util';

export async function getBedrockStatus(config, store) {
  const state = store.guild('global');
  state.status ||= {};
  const now = new Date();
  if (!config.bedrockHost) return { state: 'not-configured', players: null, version: null, uptimeMs: null };
  try {
    const result = await queryStatus(config.bedrockHost, config.bedrockPort, { timeout: 3500 });
    const last = state.status.onlineSince ? new Date(state.status.onlineSince) : now;
    state.status.onlineSince = last.toISOString();
    state.status.lastCheckedAt = now.toISOString();
    state.status.lastOnlineAt = now.toISOString();
    await store.save();
    return { state: 'online', players: result.players?.online ?? 0, maxPlayers: result.players?.max ?? null, version: result.version || null, uptimeMs: Math.max(0, now - last) };
  } catch {
    state.status.lastCheckedAt = now.toISOString();
    state.status.lastOfflineAt = now.toISOString();
    state.status.onlineSince = null;
    await store.save();
    return { state: 'offline', players: null, version: null, uptimeMs: null };
  }
}
export function humanDuration(ms) {
  if (ms == null) return 'Not available';
  const total = Math.floor(ms / 1000); const days = Math.floor(total / 86400); const hours = Math.floor((total % 86400) / 3600); const mins = Math.floor((total % 3600) / 60);
  return days ? `${days}d ${hours}h ${mins}m` : hours ? `${hours}h ${mins}m` : `${mins}m`;
}
