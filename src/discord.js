import { EmbedBuilder, PermissionsBitField } from 'discord.js';
import { BRAND } from './content.js';

export const STAFF = new PermissionsBitField([PermissionsBitField.Flags.ManageGuild, PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.ModerateMembers]);
export const modOnly = (interaction) => interaction.memberPermissions?.has(STAFF) || false;
export const embed = (title, description, color = BRAND.color) => new EmbedBuilder().setTitle(title).setDescription(description).setColor(color).setTimestamp();
export function channelByIdOrName(guild, ids = {}, key, name) {
  const byId = ids[key] && guild.channels.cache.get(ids[key]);
  return byId || guild.channels.cache.find(c => c.name === name);
}
export async function logAction(guild, config, title, fields) {
  const channel = config.modLogChannelId ? guild.channels.cache.get(config.modLogChannelId) : guild.channels.cache.find(c => c.name === 'mod-log');
  if (!channel?.isTextBased()) return false;
  await channel.send({ embeds: [new EmbedBuilder().setTitle(title).addFields(fields).setColor(BRAND.color).setTimestamp()] });
  return true;
}
export function cleanText(value, max = 500) { return String(value ?? '').trim().slice(0, max) || 'Not provided'; }
