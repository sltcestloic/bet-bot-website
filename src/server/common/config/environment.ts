const requiredVariables = [
  'APP_ORIGIN',
  'DISCORD_CLIENT_ID',
  'DISCORD_CLIENT_SECRET',
  'DATABASE_URL',
  'BOT_DATABASE_URL',
  'SESSION_COOKIE_SECRET',
  'ADMIN_DISCORD_ID',
] as const

export function validateEnvironment(input: Record<string, unknown>) {
  const environment = { ...input }

  for (const variable of requiredVariables) {
    assertRequiredString(environment, variable)
  }

  const appOrigin = validateAppOrigin(environment.APP_ORIGIN as string)
  validateBotDatabaseUrl(environment.BOT_DATABASE_URL as string)
  validateAdminDiscordId(environment.ADMIN_DISCORD_ID as string)
  validateSessionSecret(environment.SESSION_COOKIE_SECRET as string)
  environment.APP_ORIGIN = appOrigin
  environment.NODE_ENV = environment.NODE_ENV || 'development'
  environment.SERVER_PORT = environment.SERVER_PORT || '3001'
  environment.DATABASE_SSL = environment.DATABASE_SSL || 'false'
  validateDatabaseSsl(environment.DATABASE_SSL as string)
  return environment
}

function assertRequiredString(environment: Record<string, unknown>, variable: (typeof requiredVariables)[number]) {
  if (typeof environment[variable] !== 'string' || !environment[variable]) throw new Error(`${variable} is required`)
}

function validateAppOrigin(value: string) {
  const appOrigin = new URL(value)
  if (!['http:', 'https:'].includes(appOrigin.protocol) || appOrigin.pathname !== '/') {
    throw new Error('APP_ORIGIN must be an HTTP origin without a path')
  }
  return appOrigin.origin
}

function validateBotDatabaseUrl(value: string) {
  const botDatabaseUrl = new URL(value)
  if (botDatabaseUrl.pathname !== '/bet_bot') {
    throw new Error('BOT_DATABASE_URL must select the bet_bot database')
  }
}

function validateAdminDiscordId(value: string) {
  if (!/^\d{17,20}$/.test(value)) throw new Error('ADMIN_DISCORD_ID must be a Discord snowflake')
}

function validateSessionSecret(value: string) {
  if (value.length < 32) throw new Error('SESSION_COOKIE_SECRET must contain at least 32 characters')
}

function validateDatabaseSsl(value: string) {
  if (!['true', 'false'].includes(value)) throw new Error('DATABASE_SSL must be true or false')
}
