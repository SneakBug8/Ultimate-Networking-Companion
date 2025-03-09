import { Connection } from "../Database";
import { MIS_DT } from "../util/MIS_DT";

export class NetworkingHistory
{
  public static async writeChange(userId: number, contact: string, type: number, commid: number | undefined = undefined)
  {
    const r = new NetworkingHistory(contact, type, commid);
    r.userId = userId;
    await NetworkingEntriesRepository().insert(r);
  }

  public static async getLast(userId: number)
  {
    return NetworkingEntriesRepository().select()
    .where("userId", userId).orderBy("MIS_DT", "desc").first();
  }

  public static async getWithComm(commid: number)
  {
    return NetworkingEntriesRepository().select().where("CommunicationId", commid);
  }

  public static async delete(e: NetworkingHistory)
  {
    return NetworkingEntriesRepository().where("Id", e.Id).del();
  }

  public static async popLast(userId: number)
  {
    const r = await NetworkingEntriesRepository()
    .where("userId", userId).select().orderBy("MIS_DT", "desc").first();

    if (!r) {
      return undefined;
    }

    await NetworkingEntriesRepository().where("Id", r.Id).delete();
    return r;
  }

  public Id: number | undefined;
  public Contact: string;
  public CommunicationId: number|undefined;
  public Type: number;
  public MIS_DT: number = MIS_DT.GetExact();

  public userId: number = 0;

  public constructor(contact: string, type: number, commid: number|undefined)
  {
    this.Contact = contact;
    this.Type = type;
    this.CommunicationId = commid;
  }
}

export const NetworkingEntriesRepository = () => Connection<NetworkingHistory>("NetworkingHistory");

export enum NetworkingHistoryTypes
{
  Sent = 1,
  Init = 2,
  Done = 3,
  Offline = 4
}
