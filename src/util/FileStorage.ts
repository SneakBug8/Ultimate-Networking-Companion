import * as path from "path";
import * as fs from "fs";
import { Config } from "../config";

export class FileStorage
{
  public filename: string;
  private data: any;

  public constructor(filename: string, defaultdata: any)
  {
    this.filename = filename;
    this.data = defaultdata;
  }

  public async Load()
  {
    const datafilepath = path.resolve(Config.dataPath(), this.filename + ".json");

    if (fs.existsSync(datafilepath)) {
      const file = fs.readFileSync(datafilepath);

      this.data = JSON.parse(file.toString());

      console.log(`Read ${this.filename} data.`);
    }
    else {
      console.log(`Created new datafile for ${this.filename}.`);
      this.Save();
    }

    return this.data;
  }

  public async Save()
  {
    const datafilepath = path.resolve(Config.dataPath(), this.filename + ".json");

    const tdata = JSON.stringify(this.data);
    fs.writeFileSync(datafilepath, tdata);
  }
}
