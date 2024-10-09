import { Connection } from "../Database";
import { MIS_DT } from "../util/MIS_DT";

export class NetworkingCommunication
{
  public static async GetLastContact() {
    return NetworkingCommunicationsRepository().select().orderBy("CREATED_DT", "desc").first();
  }
  public static async GetById(id: number)
  {
    return NetworkingCommunicationsRepository().where("Id", id).first();
  }

  public static async GetWithContact(contact: string)
  {
    return NetworkingCommunicationsRepository().where("Contact", contact).select().orderBy("CREATED_DT", "desc");
  }

  public static async GetContactsStats()
  {
    return NetworkingCommunicationsRepository().groupBy("Contact").sum({
      Sent: "Sent", Initiated: "Initiated", Done: "Done"
    }).select("Contact");
  }

  public static async GetContactOfflineStats()
  {
    return NetworkingCommunicationsRepository().where("type", "Offline").groupBy("Contact")
      .select("Contact").count("Id as c");
  }

  public static async GetOfflineStats()
  {
    return NetworkingCommunicationsRepository().where("type", "Offline").count("Id as c").first();
  }

  public static async GetOfflineForContact(name: string)
  {
    return await NetworkingCommunicationsRepository().where("type", "Offline").andWhere("Contact", name).count("Id as c");
  }

  public static async GetStats()
  {
    return (await NetworkingCommunicationsRepository().sum({
      Sent: "Sent", Initiated: "Initiated", Done: "Done"
    }))[0];
  }

  public static async GetContactStat(name: string)
  {
    return (await NetworkingCommunicationsRepository().where("Contact", name).groupBy("Contact").sum({
      Sent: "Sent", Initiated: "Initiated", Done: "Done"
    }))[0];
  }

  public static async GetTotalDays()
  {
    const d = (await NetworkingCommunicationsRepository().min({
      CREATED_DT: "CREATED_DT"
    }))[0];

    if (!d) {
      return 0;
    }

    return (MIS_DT.GetDay() - (d.CREATED_DT || MIS_DT.GetDay())) / MIS_DT.OneDay();
  }

  public static async GetWithContactUnfinished(contact: string)
  {
    return NetworkingCommunicationsRepository().where("Contact", contact).andWhere("Done", 0).select()
      .orderBy("CREATED_DT", "desc");
  }

  public static async GetWithContactUninitiated(contact: string)
  {
    return NetworkingCommunicationsRepository().where("Contact", contact).andWhere("Initiated", 0)
      .select().orderBy("CREATED_DT", "desc");
  }

  public static async GetUnfinished()
  {
    return NetworkingCommunicationsRepository().where("Done", 0).andWhere(function()
    {
      this.where("Sent", 1).orWhere("Initiated", 1);
    }).select();
  }

  public static async GetWebList()
  {
    return NetworkingCommunicationsRepository()
      .where("CREATED_DT", ">=", MIS_DT.GetExact() - MIS_DT.OneDay() * 30).select().orderBy("CREATED_DT", "desc");
  }

  public static async GetRecentCommsToComplete()
  {
    return NetworkingCommunicationsRepository().where("Done", 0)
      .andWhere("CREATED_DT", ">=", MIS_DT.GetExact() - MIS_DT.OneWeek()).andWhere(function()
      {
        this.where("Sent", 1).orWhere("Initiated", 1);
      }).select();
  }

  public static async GetLastMonth()
  {
    return NetworkingCommunicationsRepository()
      .where("CREATED_DT", ">=", MIS_DT.GetDay() - MIS_DT.OneDay() * 30).select();
  }

  public static async GetBetweenDates(from: number, to: number)
  {
    return NetworkingCommunicationsRepository()
      .where("CREATED_DT", ">=", from).andWhere("CREATED_DT", "<", to).select();
  }

  public static async Update(comm: NetworkingCommunication)
  {
    comm.UPDATE_DT = MIS_DT.GetExact();
    console.log(`Updating NetworkingComm id ${comm.Id}`);
    return NetworkingCommunicationsRepository().where("Id", comm.Id).update(comm);
  }

  public static async Insert(comm: NetworkingCommunication)
  {
    console.log(`Creating NetworkingComm with ${comm.Contact}`);
    comm.UPDATE_DT = MIS_DT.GetExact();
    comm.CREATED_DT = MIS_DT.GetExact();

    const r = await NetworkingCommunicationsRepository().insert(comm);
    comm.Id = r[0];
    return comm;
  }

  public static async Delete(id: number)
  {
    console.log(`Deletind NetworkingComm with id ${id}`);
    return NetworkingCommunicationsRepository().where("Id", id).delete();
  }

  public Id: number | undefined;
  public Contact: string;
  public Sent: number = 1;
  public Initiated: number = 0;
  public Done: number = 0;
  public CREATED_DT: number = 0;
  public UPDATE_DT: number = 0;
  public INITIATED_DT: number = 0;
  public DONE_DT: number = 0;
  public title: string = "";
  public description: string = "";
  public type: string = "";

  public constructor(contact: string)
  {
    this.Contact = contact;
  }
}

export const NetworkingCommunicationsRepository = () => Connection<NetworkingCommunication>("NetworkingCommunication");
