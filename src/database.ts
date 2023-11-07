import { knex as knexSetup, Knex } from 'knex'
import { env } from './env'

export const databaseConfig: Knex.Config = {
  client: 'sqlite',
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}
export const knex = knexSetup(databaseConfig)