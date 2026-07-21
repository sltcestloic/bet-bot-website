import { IsOptional, IsString, MaxLength } from 'class-validator'

export class DiscordCallbackDto {
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  code?: string

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  state?: string

  @IsOptional()
  @IsString()
  @MaxLength(256)
  error?: string
}
