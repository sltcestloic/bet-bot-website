export type BaseEntity = {
  id: string;
  createdAt: Date;
};

export type Entity<T> = {
  [K in keyof T]: T[K];
} & BaseEntity;

export type User = Entity<{
  discordId: string;
  guildId: string;
  username: string;
  balance: number;
  last_active: Date;
  lastdaily: number;
  streak: number;
  role: 'ADMIN' | 'USER';
}>;

export type Guild = Entity<{
  discordId: string;
  name: string;
  iconUrl: string;
}>;
