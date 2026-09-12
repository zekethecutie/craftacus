import test from 'node:test';
import assert from 'node:assert/strict';
import { canManageClanMember, memberActionMessage, normalizeClanTag } from '../src/clans.js';

test('normalizeClanTag keeps short uppercase alphanumeric tags', () => {
  assert.equal(normalizeClanTag(' ab-craftein! '), 'ABCRA');
  assert.equal(normalizeClanTag('x'), 'X');
});

test('only owners and officers can manage clan members', () => {
  assert.equal(canManageClanMember({ actorRank: 'owner', action: 'invite' }), true);
  assert.equal(canManageClanMember({ actorRank: 'officer', action: 'rank' }), true);
  assert.equal(canManageClanMember({ actorRank: 'member', action: 'remove' }), false);
});

test('the clan owner is protected from rank and removal actions', () => {
  assert.equal(canManageClanMember({ actorRank: 'owner', targetIsOwner: true, action: 'rank' }), false);
  assert.equal(canManageClanMember({ actorRank: 'owner', targetIsOwner: true, action: 'remove' }), false);
});

test('member action messaging distinguishes a missing member', () => {
  assert.equal(memberActionMessage({ action: 'remove', targetName: 'A', clanName: 'B', found: false }), 'A is not currently a member of **B**.');
  assert.equal(memberActionMessage({ action: 'rank', targetName: 'A', clanName: 'B', found: true }), 'Updated A in **B**.');
});
