import test from 'node:test';
import assert from 'node:assert/strict';
import { respond } from '../src/interaction.js';

test('respond edits a deferred interaction', async () => {
  const calls = [];
  const interaction = { deferred: true, replied: false, editReply: async payload => { calls.push(['edit', payload]); return 'edited'; } };
  assert.equal(await respond(interaction, { content: 'done' }), 'edited');
  assert.deepEqual(calls, [['edit', { content: 'done' }]]);
});

test('respond follows up on an already replied interaction', async () => {
  const calls = [];
  const interaction = { deferred: false, replied: true, followUp: async payload => { calls.push(['followUp', payload]); return 'followed-up'; } };
  assert.equal(await respond(interaction, { content: 'later' }), 'followed-up');
  assert.deepEqual(calls, [['followUp', { content: 'later' }]]);
});

test('respond creates the initial reply when interaction is untouched', async () => {
  const calls = [];
  const interaction = { deferred: false, replied: false, reply: async payload => { calls.push(['reply', payload]); return 'replied'; } };
  assert.equal(await respond(interaction, { content: 'first' }), 'replied');
  assert.deepEqual(calls, [['reply', { content: 'first' }]]);
});
