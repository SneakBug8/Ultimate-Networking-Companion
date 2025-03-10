
import * as express from "express";
import { WebAuthService } from "../users/WebAuthService";

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

  public static async WebAuthWrapper(req: express.Request) {
    const token = req.cookies.token;

    if (token) {
      const user = await WebAuthService.TryAuthToken(token);

      if (user) {
        return user;
      }
    }

    throw new Error("Unauthenticated user was allowed to access protected methods");
  }
}
