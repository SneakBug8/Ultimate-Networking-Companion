import { Connection } from "../Database";
import { MIS_DT } from "../util/MIS_DT";

export class UserToken
{
  public Id: undefined | number;
  public userId: number = 0;
  public token: string | undefined;
  public LIVEUNTIL = MIS_DT.GetExact() + MIS_DT.OneDay() * 7;
  public MIS_DT = MIS_DT.GetExact();
  public UPDATED_DT = MIS_DT.GetExact();

  public static async GetById(id: number)
  {
    return await UserTokenRepository().where("Id", id).first();
  }

  public static async GetByUserID(userId: number)
  {
    return await UserTokenRepository().where("userId", userId).select();
  }

  public static async GetByToken(token: string)
  {
    return await UserTokenRepository().where("token", token).first();
  }

  public static async GetTokens()
  {
    return await UserTokenRepository().select();
  }

  public static async Insert(token: UserToken)
  {
    token.UPDATED_DT = MIS_DT.GetExact();
    await UserTokenRepository().insert(token);
  }

  public static async Update(token: UserToken)
  {
    token.UPDATED_DT = MIS_DT.GetExact();
    await UserTokenRepository().where("Id", token.Id).update(token);
  }
}

export const UserTokenRepository = () => Connection<UserToken>("UserTokens");
