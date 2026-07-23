export function getDiscordAvatarUrl(discordId: string, avatarHash: string | null | undefined) {
  if (avatarHash) return `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.png?size=128`
  const defaultAvatarIndex = Number((BigInt(discordId) >> 22n) % 6n)
  return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`
}
