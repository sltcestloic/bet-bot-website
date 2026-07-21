const requiredVariables = [
  'APP_ORIGIN',
  'DISCORD_CLIENT_ID',
  'DISCORD_CLIENT_SECRET',
  'DATABASE_URL',
  'SESSION_COOKIE_SECRET',
] as const

export function validateEnvironment(input: Record<string, unknown>) {
  const environment = { ...input }

  for (const variable of requiredVariables) {
    if (typeof environment[variable] !== 'string' || !environment[variable]) {
      throw new Error(`${variable} is required`)
    }
  }

  const appOrigin = new URL(environment.APP_ORIGIN as string)
  if (!['http:', 'https:'].includes(appOrigin.protocol) || appOrigin.pathname !== '/') {
    throw new Error('APP_ORIGIN must be an HTTP origin without a path')
  }
  environment.APP_ORIGIN = appOrigin.origin

  if ((environment.SESSION_COOKIE_SECRET as string).length < 32) {
    throw new Error('SESSION_COOKIE_SECRET must contain at least 32 characters')
  }

  environment.NODE_ENV = environment.NODE_ENV || 'development'
  environment.SERVER_PORT = environment.SERVER_PORT || '3001'
  environment.DATABASE_SSL = environment.DATABASE_SSL || 'false'

  if (!['true', 'false'].includes(environment.DATABASE_SSL as string)) {
    throw new Error('DATABASE_SSL must be true or false')
  }

  return environment
}
