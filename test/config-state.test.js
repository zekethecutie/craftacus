import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import fs from 'node:fs/promises';
import path from 'node:path';
import { loadConfig } from '../src/config.js';
import { openState } from '../src/state.js';

test('loadConfig rejects absent or placeholder tokens', () => {
  assert.throws(() => loadConfig({ DISCORD_CLIENT_ID: '123' }), /DISCORD_TOKEN is required/);
  assert.throws(() => loadConfig({ DISCORD_TOKEN: 'replace-with-a-new-token-after-revoking-any-exposed-token', DISCORD_CLIENT_ID: '123' }), /does not look like/);
});

test('loadConfig validates ports and returns safe defaults', () => {
  const cfg = loadConfig({ DISCORD_TOKEN: 'x'.repeat(60), DISCORD_CLIENT_ID: '123', BEDROCK_PORT: '19132', ENABLE_MEMBER_EVENTS: 'false' });
  assert.equal(cfg.bedrockPort, 19132);
  assert.equal(cfg.enableMemberEvents, false);
  assert.equal(cfg.guildId, null);
  assert.throws(() => loadConfig({ DISCORD_TOKEN: 'x'.repeat(60), DISCORD_CLIENT_ID: '123', BEDROCK_PORT: '99999' }), /valid TCP/);
});

test('state is isolated by guild and writes atomically', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'craftacus-'));
  const store = await openState(dir);
  store.guild('one').members.alice = { acceptedAt: 'now' };
  store.guild('two').members.alice = { acceptedAt: 'later' };
  await store.save();
  const raw = JSON.parse(await fs.readFile(path.join(dir, 'state.json'), 'utf8'));
  assert.equal(raw.guilds.one.members.alice.acceptedAt, 'now');
  assert.equal(raw.guilds.two.members.alice.acceptedAt, 'later');
  assert.equal(raw.guilds.one.members.alice.acceptedAt === raw.guilds.two.members.alice.acceptedAt, false);
});

import { createWelcomeState, shouldSendVerifiedWelcome } from '../src/welcome.js';

test('verified welcome is first-transition only and independent from raw join state', () => {
  const state = { ...createWelcomeState(), joinLastAt: 1_000_000, joinRecentMemberIds: ['member-a'] };
  const first = shouldSendVerifiedWelcome(state, 'member-b', 2_000_000);
  assert.equal(first.send, true);
  const duplicate = shouldSendVerifiedWelcome(first.state, 'member-b', 2_000_001);
  assert.equal(duplicate.send, false);
  const cooldown = shouldSendVerifiedWelcome(first.state, 'member-c', 2_000_002);
  assert.equal(cooldown.send, false);
  assert.deepEqual(cooldown.state.joinRecentMemberIds, ['member-a']);
});
