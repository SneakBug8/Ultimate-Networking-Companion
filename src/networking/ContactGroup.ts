import { Connection } from "../Database";
import { MIS_DT } from "../util/MIS_DT";

export class ContactGroup
{
  public Id: undefined | number;
  public Name: string = "";
  public Description: string = "";

  public Color: string = "#fff";

  public Active: boolean = true;

  public MIS_DT = MIS_DT.GetExact();

  public constructor(name: string)
  {
    this.Name = name;
  }

  public static async GetById(id: number)
  {
    const entries = await ContactGroupsRepository().where("Id", id).select();

    if (entries.length) {
      return entries[0];
    }

    return null;
  }

  public static async GetGroup(name: string)
  {
    const entries = await ContactGroupsRepository().where("Name", "LIKE", `%${name}%`).select();

    if (entries.length) {
      return entries[0];
    }

    return null;
  }

  public static async GetAll()
  {
    const entries = await ContactGroupsRepository().select();

    return entries;
  }

  public static async GetActive()
  {
    const entries = await ContactGroupsRepository().where("Active", 1).select();

    return entries;
  }

  public static async Insert(contact: ContactGroup)
  {
    await ContactGroupsRepository().insert(contact);
  }

  public static async Update(contact: ContactGroup)
  {
    await ContactGroupsRepository().where("Id", contact.Id).update(contact);
  }
}

export const ContactGroupsRepository = () => Connection<ContactGroup>("ContactGroups");
