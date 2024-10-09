import { Config } from "./config";
import knex from "knex";

/*
export const Connection = knex.knex({
    client: "sqlite3",
    connection: {
        filename: Config.dataPath() + "db.db",
    },
    useNullAsDefault: true,
});*/

export const Statistics = knex({
  client: "sqlite3",
  connection: {
      filename: Config.dataPath() + "/stats.db",
  },
  useNullAsDefault: true,
});
