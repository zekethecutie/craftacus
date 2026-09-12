import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDiscordText } from '../src/discord.js';

test('normalizeDiscordText converts literal escaped newlines to real line breaks', () => {
  assert.equal(normalizeDiscordText('one\\n\\ntwo'), 'one\n\ntwo');
});

test('normalizeDiscordText preserves existing line breaks and ordinary copy', () => {
  assert.equal(normalizeDiscordText('one\n\ntwo'), 'one\n\ntwo');
  assert.equal(normalizeDiscordText('plain text'), 'plain text');
});
