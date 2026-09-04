import fs from 'node:fs/promises';
import path from 'node:path';

const emptyGuild = () => ({ channels: {}, categories: {}, roles: {}, messages: {}, config: {}, members: {}, changelog: [] });

export async function openState(dataDir) {
  await fs.mkdir(dataDir, { recursive: true });
  const file = path.join(dataDir, 'state.json');
  let state = { version: 1, guilds: {} };
  try { state = JSON.parse(await fs.readFile(file, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  state.version = 1;
  state.guilds ||= {};
  for (const guild of Object.values(state.guilds)) Object.assign(guild, emptyGuild(), guild);
  async function save() {
    const tmp = `${file}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(state, null, 2), { mode: 0o600 });
    await fs.rename(tmp, file);
  }
  function guild(guildId) { state.guilds[guildId] ||= emptyGuild(); return state.guilds[guildId]; }
  return { state, guild, save, file };
}
