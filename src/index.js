import { Client, GatewayIntentBits, Partials, REST, Routes, SlashCommandBuilder, ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
import { loadConfig } from './config.js';
import { openState } from './state.js';
import { createDatabase } from './db.js';
import { BRAND, CHANNELS, DESCRIPTION, FOUNDING_SEASON, INTERESTS, LINKS, LORE, LORE_DOCS, RULES } from './content.js';
import { getBedrockStatus, humanDuration } from './bedrock.js';
import { cleanText, embed, logAction, modOnly } from './discord.js';

const config = loadConfig();
const store = await openState(config.dataDir);
const db = createDatabase(config);
if (db) await db.init();
const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers].filter((x) => x !== GatewayIntentBits.GuildMembers || config.enableMemberEvents);
const client = new Client({ intents, partials: [Partials.GuildMember] });

const commands = [
  new SlashCommandBuilder().setName('setup').setDescription('Create or repair the Craftein server structure').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  new SlashCommandBuilder().setName('accept-rules').setDescription('Acknowledge the Craftein rules and enter the community'),
  new SlashCommandBuilder().setName('verify').setDescription('Save a minimal self-reported Bedrock community profile').addStringOption(o => o.setName('gamertag').setDescription('Bedrock gamertag, if comfortable').setRequired(false)).addStringOption(o => o.setName('region').setDescription('Region or time zone').setRequired(false)).addStringOption(o => o.setName('voice').setDescription('Text-first, optional voice, or prefer not to say').setRequired(false)),
  new SlashCommandBuilder().setName('profile').setDescription('View your saved community profile'),
  new SlashCommandBuilder().setName('whitelist-apply').setDescription('Submit a minimal whitelist application').addStringOption(o => o.setName('gamertag').setDescription('Your Bedrock gamertag').setRequired(true)).addStringOption(o => o.setName('region').setDescription('Region or time zone').setRequired(true)).addBooleanOption(o => o.setName('age_eligible').setDescription('Confirm that you meet the established 16+ requirement').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('What would you like to do in Craftein?').setRequired(true)),
  new SlashCommandBuilder().setName('applications').setDescription('List pending whitelist applications').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  new SlashCommandBuilder().setName('application-review').setDescription('Review a whitelist application').addIntegerOption(o => o.setName('id').setDescription('Application ID').setRequired(true)).addStringOption(o => o.setName('decision').setDescription('Decision').setRequired(true).addChoices({ name: 'Approve', value: 'approved' }, { name: 'Reject', value: 'rejected' })).addStringOption(o => o.setName('note').setDescription('Optional private review note').setRequired(false)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  new SlashCommandBuilder().setName('status').setDescription('Check the configured Bedrock Dedicated Server status'),
  new SlashCommandBuilder().setName('season').setDescription('Read about the current Founding Season'),
  new SlashCommandBuilder().setName('lore').setDescription('Open the private Craftein lore documentation menu'),
  new SlashCommandBuilder().setName('roles').setDescription('Open the private optional interest-role picker'),
  new SlashCommandBuilder().setName('doc').setDescription('Open a Craftein document').addStringOption(o => o.setName('topic').setDescription('Document topic').setRequired(true).addChoices({ name: 'Rules', value: 'rules' }, { name: 'Lore', value: 'lore' }, { name: 'Application', value: 'application' }, { name: 'Links', value: 'links' })),
  new SlashCommandBuilder().setName('apply').setDescription('Open the Craftein Bedrock application'),
  new SlashCommandBuilder().setName('help').setDescription('See the short list of useful Craftacus commands'),
  new SlashCommandBuilder().setName('announce').setDescription('Post a staff announcement').addStringOption(o => o.setName('message').setDescription('Announcement text').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  new SlashCommandBuilder().setName('warn').setDescription('Issue a documented warning').addUserOption(o => o.setName('member').setDescription('Member').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  new SlashCommandBuilder().setName('timeout').setDescription('Temporarily timeout a member').addUserOption(o => o.setName('member').setDescription('Member').setRequired(true)).addIntegerOption(o => o.setName('minutes').setDescription('1–40320 minutes').setRequired(true).setMinValue(1).setMaxValue(40320)).addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  new SlashCommandBuilder().setName('purge').setDescription('Delete recent messages in this channel').addIntegerOption(o => o.setName('amount').setDescription('1–100 messages').setRequired(true).setMinValue(1).setMaxValue(100)).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
].map(c => c.toJSON());

const categorySpecs = [
  ['START HERE', 'start'], ['COMMUNITY', 'community'], ['THE WORLD', 'world'], ['CREATIVE AND CONTRIBUTION', 'creative'], ['PARTNERSHIPS AND PROMOTION', 'partnerships'], ['VOICE', 'voice'], ['STAFF', 'staff']
];
const roleSpecs = [
  ['Craftein Team', 0x7c3aed, false], ['Community Guide', 0x9b5de5, false], ['Verified Explorer', BRAND.color, false], ['Founding Member', 0xf59e0b, false],
  ...INTERESTS.map(([name]) => [name, 0x6d28d9, true])
];
const privateGroups = new Set(['community', 'world', 'creative', 'partnerships', 'voice']);

function onboardingRows() {
  return [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('show-rules').setLabel('Read the rules').setStyle(ButtonStyle.Secondary)), new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('accept-rules').setLabel('Accept and enter Craftein').setStyle(ButtonStyle.Success))];
}
function loreMenu() { return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId('lore-menu').setPlaceholder('Open a lore document').addOptions(Object.entries(LORE_DOCS).map(([value, doc]) => ({ label: doc.label, description: doc.description, value })))); }
function rolePicker() {
  return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId('interest-roles').setPlaceholder('Choose optional interests').setMinValues(0).setMaxValues(Math.min(INTERESTS.length, 8)).addOptions(INTERESTS.map(([label, description]) => ({ label, description, value: label }))));
}
function panel(kind) {
  if (kind === 'welcome') return { embeds: [embed('Welcome to Craftein', `${DESCRIPTION}\n\nCraftein is in its Founding Season. You can simply play, build a life, and decide how much of the wider world you want to help shape. Lore, voice, creation, and volunteering are optional.`)], components: onboardingRows() };
  if (kind === 'rules') return { embeds: [embed('Rules and safety', RULES.map((r, i) => `**${i + 1}.** ${r}`).join('\n\n'))], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('accept-rules').setLabel('I understand — enter Craftein').setStyle(ButtonStyle.Success))] };
  if (kind === 'how') return { embeds: [embed('How Craftein works', `**Bedrock survival.** Craftein is a Minecraft Bedrock SMP built around player choice, settlements, civilizations, trade, events, and shared respect.\n\n**Text-first by design.** VCMC/proximity voice is optional. No one has to speak, share personal details, create content, roleplay, or volunteer.\n\n**Founding Season.** New settlements are forming and the world’s history is still being written. English is the shared documentation language; perfect grammar is not required.`)] };
  if (kind === 'apply') return { embeds: [embed('Apply to Craftein', `The main path is for players who meet the established **16+** and **Minecraft Bedrock** requirements. Review is handled by the Craftein team; please do not expect an automatic timeline or approval promise.\n\n[Open the Craftein application](${LINKS.application})\n\nOptional paths: [Creator collaboration](${LINKS.creator}) · [Builders and world editors](${LINKS.builder}) · [Lore and worldbuilding](${LINKS.lore}) · [Events](${LINKS.events}) · [Technical contribution](${LINKS.development})\n\nYou do not need to volunteer, create content, use voice, or participate in lore to belong.`)] };
  if (kind === 'creator') return { embeds: [embed('Creator collaboration', `Craftein welcomes thoughtful collaboration without requiring a large audience, expensive equipment, or a polished channel. Collaboration is voluntary, respectful, and never a reason to spam members.\n\n[Creator Collaboration Program](${LINKS.creator})`)] };
  if (kind === 'partnership') return { embeds: [embed('Partnership policy', `Partnerships are staff-reviewed. We look for relevant, safe, active, respectful communities and useful collaboration—not invite farming. Do not dump raw invites or mass-DM members.\n\nUse [partnership applications](${LINKS.events}) only when you can explain your community, moderation approach, audience, representative contact, and proposed collaboration.`)] };
  if (kind === 'lore') return { embeds: [embed('Craftein lore archive', 'Lore is optional. Use this menu to open a private entry; your selection will only be shown to you.')], components: [loreMenu()] };
  return { embeds: [embed('Craftein', DESCRIPTION)] };
}
async function ensureRole(guild, name, color, managed) { let role = guild.roles.cache.find(r => r.name === name); if (!role) role = await guild.roles.create({ name, color, mentionable: managed, reason: 'Craftein idempotent setup' }); return role; }
async function ensureChannel(guild, name, type, parent, overwrites) { let channel = guild.channels.cache.find(c => c.name === name && c.type === type); if (!channel) channel = await guild.channels.create({ name, type, parent, permissionOverwrites: overwrites, reason: 'Craftein idempotent setup' }); else if (parent && channel.parentId !== parent) await channel.setParent(parent); return channel; }
async function setupGuild(guild) {
  const s = store.guild(guild.id);
  const everyone = guild.roles.everyone;
  const verified = await ensureRole(guild, 'Verified Explorer', BRAND.color, false);
  const roles = { verified: verified.id };
  for (const [name, color, selectable] of roleSpecs) { const role = await ensureRole(guild, name, color, selectable); roles[name.toLowerCase().replaceAll(' ', '_')] = role.id; }
  s.roles = { ...s.roles, ...roles };
  const cats = {};
  for (const [name, key] of categorySpecs) { let cat = guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name === name); if (!cat) cat = await guild.channels.create({ name, type: ChannelType.GuildCategory, reason: 'Craftein idempotent setup' }); cats[key] = cat.id; }
  s.categories = { ...s.categories, ...cats };
  const channelIds = {};
  for (const [group, names] of Object.entries(CHANNELS)) for (const name of names) {
    const text = !['voice'].includes(group) && !['Community Voice', 'Craftein Voice 1', 'Craftein Voice 2'].includes(name);
    const overwrites = group === 'staff' ? [{ id: everyone.id, deny: [PermissionFlagsBits.ViewChannel] }] : privateGroups.has(group) ? [{ id: everyone.id, deny: [PermissionFlagsBits.ViewChannel] }, { id: verified.id, allow: [PermissionFlagsBits.ViewChannel] }] : undefined;
    const ch = await ensureChannel(guild, name.toLowerCase().replaceAll(' ', '-'), text ? ChannelType.GuildText : ChannelType.GuildVoice, cats[group], overwrites);
    channelIds[`${group}:${name}`] = ch.id;
  }
  s.channels = { ...s.channels, ...channelIds };
  const panels = [['start:welcome', 'welcome'], ['start:rules-and-safety', 'rules'], ['start:how-craftein-works', 'how'], ['start:apply-to-craftein', 'apply'], ['world:lore-and-discoveries', 'lore'], ['creative:creator-collab', 'creator'], ['partnerships:partnership-info', 'partnership']];
  for (const [key, kind] of panels) { const ch = guild.channels.cache.get(s.channels[key]); if (!ch?.isTextBased()) continue; const existing = s.messages[key] ? await ch.messages.fetch(s.messages[key]).catch(() => null) : null; const msg = existing ? await existing.edit(panel(kind)) : await ch.send(panel(kind)); s.messages[key] = msg.id; }
  await store.save();
  return { roles, channels: channelIds };
}

async function register() { const rest = new REST({ version: '10' }).setToken(config.token); const route = config.guildId ? Routes.applicationGuildCommands(config.clientId, config.guildId) : Routes.applicationCommands(config.clientId); await rest.put(route, { body: commands }); }
function requireVerified(interaction) { return Boolean(interaction.member?.roles?.cache?.some(r => r.name === 'Verified Explorer')); }

client.once('ready', async () => { await register(); console.log(`Craftacus online as ${client.user.tag}`); if (config.guildId) { const guild = await client.guilds.fetch(config.guildId); await setupGuild(guild); } });
client.on('guildMemberAdd', async member => { if (!config.enableMemberEvents) return; const channel = member.guild.channels.cache.find(c => c.name === 'welcome' && c.isTextBased()); await channel?.send(`A new traveler has arrived. Start with the rules, then accept them to enter the community. The world is still being written.`); });
client.on('interactionCreate', async interaction => {
  try {
    if (interaction.isButton() && interaction.customId === 'show-rules') return interaction.reply({ embeds: [embed('Rules and safety', RULES.map((r, i) => `**${i + 1}.** ${r}`).join('\\n\\n'))], ephemeral: true });
    if (interaction.isButton() && interaction.customId === 'accept-rules') { const role = interaction.guild.roles.cache.find(r => r.name === 'Verified Explorer'); if (!role || role.position >= interaction.guild.members.me.roles.highest.position) return interaction.reply({ content: 'The Verified Explorer role is not currently assignable. Please ask a server administrator to move Craftacus above it.', ephemeral: true }); await interaction.member.roles.add(role, 'Accepted Craftein rules'); const s = store.guild(interaction.guildId); s.members[interaction.user.id] = { ...(s.members[interaction.user.id] || {}), acceptedAt: new Date().toISOString() }; await store.save(); if (db) await db.markRulesAccepted(interaction.guildId, interaction.user.id, new Date()); await logAction(interaction.guild, config, 'Rules accepted', [{ name: 'Member', value: `${interaction.user.tag} (${interaction.user.id})` }]); return interaction.reply({ content: 'You are in. Welcome to the Founding Season. Text participation is fully welcome; choose any optional interests below.', components: [rolePicker()], ephemeral: true }); }
    if (interaction.isStringSelectMenu() && interaction.customId === 'lore-menu') { const doc = LORE_DOCS[interaction.values[0]]; if (!doc) return interaction.reply({ content: 'That lore entry is unavailable.', ephemeral: true }); return interaction.reply({ embeds: [embed(doc.label, doc.body)] , ephemeral: true }); }
    if (interaction.isStringSelectMenu() && interaction.customId === 'interest-roles') { if (!requireVerified(interaction)) return interaction.reply({ content: 'Accept the rules first.', ephemeral: true }); const selectable = new Set(INTERESTS.map(([name]) => name)); const chosen = new Set(interaction.values); for (const [name] of selectable) { const role = interaction.guild.roles.cache.find(r => r.name === name); if (role && role.position < interaction.guild.members.me.roles.highest.position) { if (chosen.has(name)) await interaction.member.roles.add(role); else await interaction.member.roles.remove(role); } } return interaction.reply({ content: chosen.size ? `Updated optional interests: ${[...chosen].join(', ')}.` : 'Optional interests cleared. Your access and staff/recognition roles were not changed.', ephemeral: true }); }
    if (!interaction.isChatInputCommand()) return;
    const name = interaction.commandName;
    if (name === 'setup') { if (!modOnly(interaction)) return interaction.reply({ content: 'Manage Guild permission is required.', ephemeral: true }); await interaction.deferReply({ ephemeral: true }); await setupGuild(interaction.guild); return interaction.editReply('Craftein setup checked and repaired missing resources without deleting existing channels or messages.'); }
    if (name === 'accept-rules') { const role = interaction.guild.roles.cache.find(r => r.name === 'Verified Explorer'); if (!role) return interaction.reply({ content: 'Run /setup first.', ephemeral: true }); await interaction.member.roles.add(role, 'Accepted Craftein rules'); store.guild(interaction.guildId).members[interaction.user.id] = { acceptedAt: new Date().toISOString() }; await store.save(); if (db) await db.markRulesAccepted(interaction.guildId, interaction.user.id, new Date()); return interaction.reply({ content: 'Rules acknowledged. Welcome to Craftein.', ephemeral: true }); }
    if (['verify', 'profile'].includes(name) && !requireVerified(interaction)) return interaction.reply({ content: 'Please accept the rules first with the button in #rules-and-safety or /accept-rules.', ephemeral: true });
    if (name === 'verify') { const profile = { guildId: interaction.guildId, userId: interaction.user.id, gamertag: cleanText(interaction.options.getString('gamertag'), 64), region: cleanText(interaction.options.getString('region'), 64), voicePreference: cleanText(interaction.options.getString('voice'), 64) }; if (db) await db.upsertProfile(profile); else { const g = store.guild(interaction.guildId); g.members[interaction.user.id] = { ...(g.members[interaction.user.id] || {}), gamertag: profile.gamertag, region: profile.region, voice: profile.voicePreference, updatedAt: new Date().toISOString() }; await store.save(); } return interaction.reply({ content: 'Profile saved. This is a self-reported community profile, not proof of Microsoft/Xbox ownership.', ephemeral: true }); }
    if (name === 'whitelist-apply') {
      if (!db) return interaction.reply({ content: 'Whitelist applications are temporarily unavailable because Neon is not configured. Please use the application form in #apply-to-craftein.', ephemeral: true });
      const gamertag = cleanText(interaction.options.getString('gamertag'), 64);
      const region = cleanText(interaction.options.getString('region'), 64);
      const ageEligible = interaction.options.getBoolean('age_eligible');
      const reason = cleanText(interaction.options.getString('reason'), 800);
      if (!ageEligible) return interaction.reply({ content: 'The established Craftein community requirement is 16+. You cannot submit this application without confirming eligibility.', ephemeral: true });
      const application = await db.createApplication({ guildId: interaction.guildId, userId: interaction.user.id, gamertag, region, ageEligible, bedrockConfirmed: true, reason });
      const reviewChannel = config.applicationReviewChannelId ? interaction.guild.channels.cache.get(config.applicationReviewChannelId) : interaction.guild.channels.cache.find(c => c.name === 'applications-review' && c.isTextBased());
      if (reviewChannel?.isTextBased()) await reviewChannel.send({ embeds: [embed(`Whitelist application #${application.id}`, `**Applicant:** ${interaction.user.tag} (${interaction.user.id})\n**Gamertag:** ${gamertag}\n**Region/time zone:** ${region}\n**16+ confirmed:** Yes\n**Bedrock confirmed:** Yes\n**Reason:** ${reason}\n\nUse the /applications and /application-review commands to process this record.`)] });
      return interaction.reply({ content: `Application #${application.id} submitted for staff review. This is not automatic approval and does not verify Microsoft/Xbox ownership.`, ephemeral: true });
    }
    if (name === 'applications') {
      if (!modOnly(interaction)) return interaction.reply({ content: 'Manage Guild permission is required.', ephemeral: true });
      if (!db) return interaction.reply({ content: 'Neon is not configured; application records are unavailable.', ephemeral: true });
      const rows = await db.listApplications(interaction.guildId);
      if (!rows.length) return interaction.reply({ content: 'There are no pending whitelist applications.', ephemeral: true });
      return interaction.reply({ embeds: [embed('Pending whitelist applications', rows.map(a => `**#${a.id}** · ${a.gamertag} · ${a.region || 'Region not provided'} · <@${a.discord_user_id}>\n${a.reason}`).join('\n\n'))], ephemeral: true });
    }
    if (name === 'application-review') {
      if (!modOnly(interaction)) return interaction.reply({ content: 'Manage Guild permission is required.', ephemeral: true });
      if (!db) return interaction.reply({ content: 'Neon is not configured; application records are unavailable.', ephemeral: true });
      const id = interaction.options.getInteger('id');
      const decision = interaction.options.getString('decision');
      const note = interaction.options.getString('note');
      const application = await db.reviewApplication({ id, guildId: interaction.guildId, status: decision, reviewerId: interaction.user.id, note: cleanText(note, 500) });
      if (!application) return interaction.reply({ content: 'That application was not found in this guild or was already unavailable.', ephemeral: true });
      await logAction(interaction.guild, config, 'Whitelist application reviewed', [{ name: 'Application', value: `#${application.id}` }, { name: 'Decision', value: decision }, { name: 'Reviewer', value: interaction.user.tag }]);
      return interaction.reply({ content: `Application #${application.id} marked ${decision}. The applicant still must accept Discord rules; approval does not bypass onboarding.`, ephemeral: true });
    }
    if (name === 'profile') { const p = db ? await db.getProfile(interaction.guildId, interaction.user.id) : store.guild(interaction.guildId).members[interaction.user.id] || {}; return interaction.reply({ embeds: [embed('Your Craftein profile', `**Bedrock gamertag:** ${p.gamertag || 'Not provided'}\n**Region/time zone:** ${p.region || 'Not provided'}\n**Voice preference:** ${p.voice_preference || p.voice || 'Not provided'}\n\nYou can rerun /verify at any time. This profile is voluntary and minimal.`)], ephemeral: true }); }
    if (name === 'season') return interaction.reply({ embeds: [embed('The Founding Season', FOUNDING_SEASON)] });
    if (name === 'lore') return interaction.reply({ embeds: [embed('Craftein lore archive', 'Lore is optional. Choose an entry to open it privately.')], components: [loreMenu()], ephemeral: true });
    if (name === 'roles') { if (!requireVerified(interaction)) return interaction.reply({ content: 'Accept the rules first.', ephemeral: true }); return interaction.reply({ embeds: [embed('Choose your optional interests', 'You can change these at any time. They do not affect staff, recognition, or community access.')], components: [rolePicker()], ephemeral: true }); }
    if (name === 'apply') return interaction.reply({ content: LINKS.application });
    if (name === 'doc') { const topic = interaction.options.getString('topic'); const map = { rules: RULES.map((r, i) => `**${i + 1}.** ${r}`).join('\n\n'), lore: LORE, application: `[Open the main application](${LINKS.application})`, links: Object.entries(LINKS).map(([k, v]) => `**${k}:** ${v}`).join('\n') }; return interaction.reply({ embeds: [embed(`Craftein ${topic}`, map[topic])] }); }
    if (name === 'help') return interaction.reply({ embeds: [embed('Craftacus help', '`/accept-rules` enter after reading the rules\n`/verify` save a voluntary Bedrock profile\n`/profile` view your profile\n`/apply` open the application\n`/season` read the Founding Season\n`/doc` open rules, lore, application, or links\n`/lore` open optional lore privately\n`/roles` update optional interests privately\n`/status` check the configured Bedrock server\n\nStaff: `/setup`, `/announce`, `/warn`, `/timeout`, `/purge`.')], ephemeral: true });
    if (name === 'status') { const result = await getBedrockStatus(config, store); const body = result.state === 'online' ? `Online and reachable.\n**Players:** ${result.players}/${result.maxPlayers ?? '?'}\n**Version:** ${result.version || 'Unknown'}\n**Observed uptime:** ${humanDuration(result.uptimeMs)}` : result.state === 'not-configured' ? 'Status checking is not configured.' : 'Offline or not reachable right now. The address is intentionally not shown.'; return interaction.reply({ embeds: [embed('Craftein server status', body)] }); }
    if (name === 'announce') { if (!modOnly(interaction)) return interaction.reply({ content: 'Manage Guild permission is required.', ephemeral: true }); const target = interaction.guild.channels.cache.find(c => c.name === 'announcements' && c.isTextBased()) || interaction.channel; const msg = await target.send({ embeds: [embed('Craftein announcement', cleanText(interaction.options.getString('message'), 4000))] }); await logAction(interaction.guild, config, 'Announcement posted', [{ name: 'Staff', value: interaction.user.tag }, { name: 'Message', value: msg.url }]); return interaction.reply({ content: `Posted in ${target}.`, ephemeral: true }); }
    if (name === 'warn') { if (!modOnly(interaction)) return interaction.reply({ content: 'Moderation permission is required.', ephemeral: true }); const member = interaction.options.getMember('member'); const reason = cleanText(interaction.options.getString('reason')); await logAction(interaction.guild, config, 'Member warning', [{ name: 'Moderator', value: interaction.user.tag }, { name: 'Target', value: `${member.user.tag} (${member.id})` }, { name: 'Reason', value: reason }]); return interaction.reply({ content: `Documented a warning for ${member.user.tag}.`, ephemeral: true }); }
    if (name === 'timeout') { if (!modOnly(interaction)) return interaction.reply({ content: 'Moderation permission is required.', ephemeral: true }); const member = interaction.options.getMember('member'); const minutes = interaction.options.getInteger('minutes'); const reason = cleanText(interaction.options.getString('reason')); await member.timeout(minutes * 60_000, reason); await logAction(interaction.guild, config, 'Member timeout', [{ name: 'Moderator', value: interaction.user.tag }, { name: 'Target', value: `${member.user.tag} (${member.id})` }, { name: 'Duration', value: `${minutes} minutes` }, { name: 'Reason', value: reason }]); return interaction.reply({ content: `Timed out ${member.user.tag} for ${minutes} minutes.`, ephemeral: true }); }
    if (name === 'purge') { if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) return interaction.reply({ content: 'Manage Messages permission is required.', ephemeral: true }); const amount = interaction.options.getInteger('amount'); await interaction.channel.bulkDelete(amount, true); await logAction(interaction.guild, config, 'Messages purged', [{ name: 'Moderator', value: interaction.user.tag }, { name: 'Channel', value: interaction.channel.name }, { name: 'Amount requested', value: String(amount) }]); return interaction.reply({ content: `Removed up to ${amount} recent messages.`, ephemeral: true }); }
  } catch (error) { console.error('Interaction error:', error.message); if (interaction.replied || interaction.deferred) await interaction.followUp({ content: 'Craftacus could not complete that safely. Check the bot role hierarchy and permissions.', ephemeral: true }); else await interaction.reply({ content: 'Craftacus could not complete that safely. Check the bot role hierarchy and permissions.', ephemeral: true }); }
});
process.on('SIGTERM', () => client.destroy());
await client.login(config.token);
