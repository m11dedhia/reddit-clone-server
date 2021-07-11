import { MikroORM } from "@mikro-orm/core";
import { Post } from "./entities/Post";
import path from 'path';
import { User } from "./entities/User";

export default {
  migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  dbName: process.env.DB_NAME ? process.env.DB_NAME : 'reddit-clone',
  user: process.env.DB_USER ? process.env.DB_USER : 'megh',
  password: process.env.DB_PASS ? process.env.DB_PASS : 'megh123',
  type: 'postgresql',
  debug: process.env.NODE_ENV !== 'production',
  entities: [Post, User]
} as Parameters<typeof MikroORM.init>[0];