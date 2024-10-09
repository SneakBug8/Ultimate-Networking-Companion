import { Connection } from "../Database";
import { MIS_DT } from "../util/MIS_DT";

export class User
{
  public Id: undefined | number;
  public username: string=  "";
  public passwordHash: string | undefined
  public chatId: number | undefined;

  public MIS_DT = MIS_DT.GetExact();
  public UPDATED_DT = MIS_DT.GetExact();
  public LAST_SEEN = MIS_DT.GetExact();

  public static async GetById(id: number)
  {
    return await UsersRepository().where("Id", id).first();
  }

  public static async GetByUsername(username: string)
  {
    return await UsersRepository().where("name", username).first();
  }

  public static async GetByChat(chatId: number)
  {
    return await UsersRepository().where("chatId", chatId).first();
  }

  public static async GetUsers()
  {
    return await UsersRepository().select();
  }

  public static async Insert(contact: User)
  {
    contact.UPDATED_DT = MIS_DT.GetExact();
    await UsersRepository().insert(contact);
  }

  public static async Update(user: User)
  {
    user.UPDATED_DT = MIS_DT.GetExact();
    await UsersRepository().where("Id", user.Id).update(user);
  }
}

export const UsersRepository = () => Connection<User>("Users");
