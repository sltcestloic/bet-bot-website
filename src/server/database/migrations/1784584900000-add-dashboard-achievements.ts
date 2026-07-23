import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddDashboardAchievements1784584900000 implements MigrationInterface {
  name = 'AddDashboardAchievements1784584900000'

  async up(queryRunner: QueryRunner) {
    await queryRunner.query(`
      CREATE TABLE "dashboard_achievements" (
        "user_id" varchar(32) NOT NULL,
        "guild_id" varchar(20) NOT NULL,
        "season_key" varchar(20) NOT NULL,
        "key" varchar(64) NOT NULL,
        "best_value" double precision NOT NULL,
        "pending" boolean NOT NULL DEFAULT false,
        "pending_title" varchar(128),
        "pending_detail" varchar(255),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_dashboard_achievements" PRIMARY KEY ("user_id", "guild_id", "season_key", "key"),
        CONSTRAINT "FK_dashboard_achievements_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `)
  }

  async down(queryRunner: QueryRunner) {
    await queryRunner.query('DROP TABLE "dashboard_achievements"')
  }
}
