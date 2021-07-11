import { MikroORM } from "@mikro-orm/core";
import dotenv from 'dotenv';
import microConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
dotenv.config();

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();
  const app = express();
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: () => ({ em: orm.em })
  });

  apolloServer.applyMiddleware({ app });
  app.get('/', (_, res) => {
    res.send('<h1>NOICE</h1>');
  });
  app.listen(process.env.PORT, () => {
    console.log(`App running on port: ${process.env.PORT}`);
  });
}

try {
  main();
} catch (e) {
  console.error(e);
}
