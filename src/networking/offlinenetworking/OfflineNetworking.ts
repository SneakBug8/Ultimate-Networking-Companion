/*import { Connection } from "../../Database";
import {  Networking } from "../Networking";
import { NetworkingChange } from "../NetworkingChange";
import { NetworkingContact } from "../NetworkingContact";
import { NetworkingHistory } from "../NetworkingHistory";
import { OfflineNetworkingEntry } from "./OfflineNetworkingEntry";

export class OfflineNetworking
{
  public static async AddEntry(name: string)
  {
    const contact = await NetworkingContact.GetContact(name);

    if (!contact) {
      return "No such contact";
    }

    const entry = new OfflineNetworkingEntry();
    entry.name = contact.name;

    await NetworkingHistory.writeChange(contact.name, 3);

    await OfflineNetworkingEntriesRepository().insert(entry);
    return `Successfully added offline networking entry with ${entry.name}`;
  }

  public static async GetContactsStats()
  {
    return OfflineNetworkingEntriesRepository().groupBy("name").count({
      c: "Id"
    }).select("name");
  }

  public static async Count(name: string)
  {
    const contact = await NetworkingContact.GetContact(name);

    if (!contact) {
      return 0;
    }

    const res = await OfflineNetworkingEntriesRepository().where("name", contact.name).count();

    return Object.values(res[0])[0];
  }

  public static async RemoveEntry(name: string)
  {
    const contact = await NetworkingContact.GetContact(name);

    if (!contact) {
      return "No such contact";
    }

    const entries = await OfflineNetworkingEntriesRepository().where("name", contact.name).orderBy("MIS_DT", "desc");

    if (!entries.length) {
      return "No suitable entries";
    }

    const entry = entries[0];

    if (entry.Id) {
      await OfflineNetworkingEntriesRepository().where("Id", entry.Id).delete();
      return `Successfully removed offline networking entry with ${entry.name}`;
    }

    return `No suitable entry`;
  }
}

export const OfflineNetworkingEntriesRepository = () => Connection<OfflineNetworkingEntry>("OfflineNetworkingEntries");
*/
