import { FindMyIp } from "./util/FindMyIp";

class ConfigClass
{
  // Chat where bot will send notifications
  public AdminChat = Number.parseInt(process.env.defaultchat || "", 10) as number;

  public isProduction()
  {
    return process.env.NODE_ENV === "production";
  }

  public isDev()
  {
    return !this.isProduction();
  }

  private testEnv = false;

  public setTest()
  {
    this.testEnv = true;
  }

  public isTest()
  {
    return this.testEnv;
  }

  public basePath(): string
  {
    return __dirname;
  }

  public projectPath(): string
  {
    return __dirname + "/..";
  }

  public dataPath(): string
  {
    return __dirname + "/../data";
  }

  public port()
  {
    return 3000;
  }

  public async url()
  {
    return `http://:/`;
  }
}

export const Config = new ConfigClass();
