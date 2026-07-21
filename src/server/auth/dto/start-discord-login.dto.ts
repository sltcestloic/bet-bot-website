import { IsOptional, IsString, MaxLength } from 'class-validator'

export class StartDiscordLoginDto {
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  returnTo?: string
}
