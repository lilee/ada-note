import { defineConfig } from 'drizzle-kit'

const { LOCAL_DB_PATH } = process.env

export default defineConfig(
  LOCAL_DB_PATH
    ? {
        dialect: 'sqlite',
        schema: './src/db/schema.ts',
        driver: 'better-sqlite',
        dbCredentials: {
          url: LOCAL_DB_PATH,
        },
      }
    : {
        dialect: 'sqlite',
        out: 'drizzle',
        schema: 'src/db/schema.ts',
        driver: 'd1-http',
        dbCredentials: {
          accountId: '63e762044ee0ce290fce2b24b78b5d16',
          databaseId: '0b14893f-3b15-4cd5-8c23-444206272764',
          token: 'VK2GoKw_aptpRlXjJy09DGBQuHMyfEwv6YkzwSLQ',
        },
      }
)
