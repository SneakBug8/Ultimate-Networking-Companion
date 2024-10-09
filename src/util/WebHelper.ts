
import * as express from "express";

export class WebHelper
{
  public static Error(res: express.Response, message: string)
  {
    console.error(message);
    return res.json({ error: message });
  }

  public static Success(res: express.Response, message: string)
  {
    console.log(message);
    return res.json({ message });
  }
}
