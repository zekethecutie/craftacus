export function normalizeClanTag(value) {
  return String(value ?? '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
}

export function canManageClanMember({ actorRank, targetIsOwner = false, action }) {
  if (!['owner', 'officer'].includes(actorRank)) return false;
  if (targetIsOwner && action !== 'invite') return false;
  return ['invite', 'rank', 'remove'].includes(action);
}

export function memberActionMessage({ action, targetName, clanName, found }) {
  if (!found) return `${targetName} is not currently a member of **${clanName}**.`;
  if (action === 'rank') return `Updated ${targetName} in **${clanName}**.`;
  if (action === 'remove') return `Removed ${targetName} from **${clanName}**.`;
  return `Invited ${targetName} to **${clanName}**.`;
}
