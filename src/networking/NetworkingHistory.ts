import { Connection } from "../Database";
import { MIS_DT } from "../util/MIS_DT";

export class NetworkingHistory
{
  public static async writeChange(contact: string, type: number, commid: number | undefined = undefined)
  {
    const r = new NetworkingHistory(contact, type, commid);
    await NetworkingEntriesRepository().insert(r);
  }

  public static async getLast()
  {
    return NetworkingEntriesRepository().select().orderBy("MIS_DT", "desc").first();
  }

  public static async getWithComm(commid: number)
  {
    return NetworkingEntriesRepository().select().where("CommunicationId", commid);
  }

  public static async delete(e: NetworkingHistory)
  {
    return NetworkingEntriesRepository().where("Id", e.Id).del();
  }

  public static async popLast()
  {
    const r = await NetworkingEntriesRepository().select().orderBy("MIS_DT", "desc").first();

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
