

## Field-level boundary

Website application submissions use `applicantName`, `contact`, `pathway`, `message`, and UTC `createdAt`. Craftacus Discord applications use `guild_id`, `discord_user_id`, `gamertag`, `region`, `reason`, `status`, and reviewer metadata in Neon. These are separate records and must not be merged by display name alone.

Website showcase profiles are public only after owner-controlled publication and archive decisions. Craftacus `craftein_profiles` remains minimal and private by default; a Discord role never publishes a website profile automatically. Website notices and Discord staff announcements are also separate sources of truth, with private moderation logs on each service.

Website owner access is Manus OAuth plus the database-backed `admin` role guard. Craftacus staff access is guild permission/role based. Neither service should copy credentials or sensitive submissions into public channels.
