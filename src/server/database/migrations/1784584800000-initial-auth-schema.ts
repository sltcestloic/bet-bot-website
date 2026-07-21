import type { MigrationInterface, QueryRunner } from 'typeorm'

export class InitialAuthSchema1784584800000 implements MigrationInterface {
  name = 'InitialAuthSchema1784584800000'

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" varchar(32) NOT NULL,
        "username" varchar(64) NOT NULL,
        "display_name" varchar(128) NOT NULL,
        "avatar_hash" varchar(255),
        "discriminator" varchar(4) NOT NULL DEFAULT '0',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `)
    await queryRunner.query(`
      CREATE TABLE "auth_sessions" (
        "token_hash" char(64) NOT NULL,
        "user_id" varchar(32) NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "last_activity_at" timestamptz NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_auth_sessions_token_hash" PRIMARY KEY ("token_hash"),
        CONSTRAINT "FK_auth_sessions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `)
    await queryRunner.query('CREATE INDEX "IDX_auth_sessions_expires_at" ON "auth_sessions" ("expires_at")')
    await queryRunner.query(`
      CREATE TABLE "oauth_login_attempts" (
        "state_hash" char(64) NOT NULL,
        "browser_token_hash" char(64) NOT NULL,
        "return_to" varchar(2048) NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_oauth_login_attempts_state_hash" PRIMARY KEY ("state_hash")
      )
    `)
    await queryRunner.query('CREATE INDEX "IDX_oauth_login_attempts_expires_at" ON "oauth_login_attempts" ("expires_at")')
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "oauth_login_attempts"')
    await queryRunner.query('DROP TABLE "auth_sessions"')
    await queryRunner.query('DROP TABLE "users"')
  }
}
