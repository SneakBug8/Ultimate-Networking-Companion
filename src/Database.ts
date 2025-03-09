import { Config } from "./config";
import knex from "knex";

export const Connection = knex({
  client: "sqlite3",
  connection: {
      filename: Config.dataPath() + "/db.db",
  },
  useNullAsDefault: true,
});
