import { Connection } from "../Database";
import { MIS_DT } from "../util/MIS_DT";

export class ContactToGroup
{
  public Id: undefined | number;
  public ContactId: undefined | number;
  public GroupId: undefined | number;

  public static async GetContactsInGroup(groupid: number)
  {
    return await ContactToGroupsRepository().where("GroupId", groupid).select();
  }

  public static async GetGroupsOfContact(contactid: number)
  {
    return await ContactToGroupsRepository().where("ContactId", contactid).select();
  }

  public static async GetAll()
  {
    return await ContactToGroupsRepository().select();
  }

  public static async Insert(contact: ContactToGroup)
  {
    await ContactToGroupsRepository().insert(contact);
  }

  public static async Update(contact: ContactToGroup)
  {
    await ContactToGroupsRepository().where("Id", contact.Id).update(contact);
  }
}

export const ContactToGroupsRepository = () => Connection<ContactToGroup>("ContactToGroups");
