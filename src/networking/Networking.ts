import { MessageWrapper } from "../MessageWrapper";
import * as fs from "fs";
import * as path from "path";

import { Config } from "../config";
import { Server, setWaitingForValue, setWaitingForValuePure } from "..";
import TelegramBot = require("node-telegram-bot-api");
import { shortNum } from "../util/EqualString";
import { NetworkingContact, NetworkingContactsRepository } from "./NetworkingContact";
import { NetworkingCommunication } from "./NetworkingCommunication";
import { MIS_DT } from "../util/MIS_DT";
import { Scheduler } from "../util/Scheduler";
import { stat } from "fs-extra";
import { NetworkingHistory } from "./NetworkingHistory";

class NetworkingClass
{
  private readonly howmanyperday = 1;
  private readonly whattimeofaday = 12;

  private getKeyboard(): TelegramBot.KeyboardButton[][]
  {
    return [
      [{ text: "/networking done" }, { text: "/networking init" }, { text: "/networking list" }],
      [{ text: "/networking add" }, { text: "/networking remove" }, { text: "/networking stats" }],
      [{ text: "/networking done (...)" }, { text: "/networking init (...)" }, { text: "/networking send (...)" }],
      [/*{ text: "/networking offline" },*/ { text: "/networking undo" }, { text: "/exit" }],
    ];
  }

  private yesNoKeyboard(): TelegramBot.KeyboardButton[][]
  {
    return [
      [{ text: "yes" }, { text: "no" }],
    ];
  }

  private reply(msg: MessageWrapper, text: string)
  {
    msg.reply(text, this.getKeyboard());
  }

  public async Init()
  {
    Scheduler.Schedule(this.whattimeofaday, async () =>
    {
      const now = new Date();
      await this.NetworkingSend();

      if (now.getDay() - 1 === 4) {
        await this.WeeklyReview();
      }
    });
  }

  private async GetRecentContacts()
  {
    let res = "";

    const applicableContacts = await NetworkingCommunication.GetRecentCommsToComplete();

    if (applicableContacts.length) {
      res += `---\n`;
    }

    for (const contact of applicableContacts) {
      if (contact.Initiated > 0) {
        res += `Unfinished initiated contact with ${contact.Contact} (${new Date(contact.CREATED_DT).toDateString()})\n`;
      }
      else if (contact.Sent > 0) {
        res += `Uninitiated contact with ${contact.Contact} (${new Date(contact.CREATED_DT).toDateString()})\n`;
      }
    }

    return res;
  }

  private async NetworkingSend()
  {
    const now = new Date(Date.now());
    // this.data.lastSend = now.getDay();
    // this.data.totaldays++;

    let res = `Your networking for today:\n`;

    const previds = new Array<number>();
    let i = 0;
    const contacts = await NetworkingContact.GetContacts();

    while (i < this.howmanyperday) {
      const active = contacts.filter((x :  NetworkingContact) => x.active);
      const randomind = Math.floor(Math.random() * active.length);

      if (previds.includes(randomind) && previds.length !== active.length) { continue; }

      previds.push(randomind);

      res += await this.formatName(active[randomind].name) + "\n";
      this.CreateCommunicationForContact(active[randomind].name);

      i++;
    }

    res += await this.GetRecentContacts();

    Server.SendMessage(res);
  }

  private async WeeklyReview()
  {
    let res = `Networking for weekends:\n`;

    const pick = await NetworkingContact.GetActive();

    const previds = new Array<number>();

    let i = 0;

    while (i < 5 && pick.length) {
      const randomind = Math.floor(Math.random() * pick.length);

      if (previds.includes(randomind) && previds.length !== pick.length) { continue; }

      previds.push(randomind);

      res += await this.formatName(pick[randomind].name) + "\n";
      i++;
    }

    Server.SendMessage(res);
  }

  public async CreateCommunicationForContact(name: string)
  {
    const contact = await NetworkingContact.GetContact(name);
    if (!contact) {
      return "No such contact";
    }

    const comm = new NetworkingCommunication(contact.name);
    const rc = await NetworkingCommunication.Insert(comm);

    await NetworkingHistory.writeChange(contact.name, 0, rc.Id);

    return rc;
  }

  public async RaiseDoneForStat(name: string)
  {
    const contact = await NetworkingContact.GetContact(name);
    if (!contact) {
      return "No such contact";
    }

    const comms = await NetworkingCommunication.GetWithContactUnfinished(contact.name);
    let updatedcommunication : NetworkingCommunication | null = null;

    if (comms.length) {
      for (const currcomm of comms) {
        if (currcomm.Done) {
          continue;
        }
        updatedcommunication = await this.SetCommunicationDone(currcomm);

        break;
      }
    }
    else {
      return "No record to raise Done";
    }

    return {contact, updatedcommunication};
  }

  public async SetCommunicationDone(comm: NetworkingCommunication)
  {
    comm.Done = 1;
    comm.DONE_DT = MIS_DT.GetExact();
    await NetworkingCommunication.Update(comm);
    await NetworkingHistory.writeChange(comm.Contact, 2, comm?.Id || 0);
    return comm;
  }

  public async RaiseInitForStat(name: string)
  {
    const contact = await NetworkingContact.GetContact(name);
    if (!contact) {
      return "No such contact";
    }
    const comms = await NetworkingCommunication.GetWithContactUninitiated(contact.name);

    let updatedcommunication : NetworkingCommunication | null = null;

    if (comms.length) {
      for (const currcomm of comms) {
        if (currcomm.Initiated) {
          continue;
        }
        updatedcommunication = await this.SetCommunicationInitiated(currcomm);
        break;
      }
    }
    else {
      return "No record to raise Initiated";
    }

    return { contact, updatedcommunication};
  }

  public async SetCommunicationInitiated(comm: NetworkingCommunication)
  {
    comm.Initiated = 1;
    comm.INITIATED_DT = MIS_DT.GetExact();
    await NetworkingCommunication.Update(comm);
    await NetworkingHistory.writeChange(comm.Contact, 1, comm?.Id || 0);

    return comm;
  }

  private async undo(msg: MessageWrapper)
  {
    if (!msg.checkRegex(new RegExp("yes"))) {
      return this.reply(msg, "Aborted");
    }

    const lastchange = await NetworkingHistory.getLast();

    if (!lastchange) { return "No changes history"; }

    // Change modern communication
    if (lastchange.CommunicationId) {
      const comm = await NetworkingCommunication.GetById(lastchange.CommunicationId);

      if (comm) {
        return msg.reply(await this.undoComm(comm));
      }
    }

    // Change old communication
    const contact = await NetworkingContact.GetContact(lastchange.Contact);
    if (!contact) {
      return "No such contact";
    }
    if (lastchange.Type === 0) {
      const comms = await NetworkingCommunication.GetWithContact(contact.name);
      for (const currcomm of comms) {
        if (currcomm.Id) {
          await NetworkingCommunication.Delete(currcomm.Id);
          await NetworkingHistory.delete(lastchange);
          break;
        }
      }

      return `Undone sending ${stat.name}`;
    }
    else if (lastchange.Type === 1) {
      const comms = await NetworkingCommunication.GetWithContact(contact.name);
      for (const currcomm of comms) {
        if (currcomm.Initiated) {
          currcomm.Initiated = 0;
          await NetworkingCommunication.Update(currcomm);
          await NetworkingHistory.delete(lastchange);
          break;
        }
      }

      return `Undone initiating ${stat.name}`;
    }
    else if (lastchange.Type === 2) {
      const comms = await NetworkingCommunication.GetWithContact(contact.name);
      for (const currcomm of comms) {
        if (currcomm.Done) {
          currcomm.Done = 0;
          await NetworkingCommunication.Update(currcomm);
          await NetworkingHistory.delete(lastchange);
          break;
        }
      }

      return `Undone doing ${contact.name}`;
    }
    /*else if (lastchange.Type === 3) {
      await OfflineNetworking.RemoveEntry(lastchange.Contact);
      await NetworkingHistory.delete(lastchange);

      return "Removed offline networking";
    }*/

    return `Unexpected error`;
  }

  public async undoComm(comm: NetworkingCommunication)
  {
    if (!comm.Id) {
      return "No communication id";
    }

    const lastchanges = await NetworkingHistory.getWithComm(comm.Id);

    if (!lastchanges.length) {
      return "No such changes";
    }

    const lastchange = lastchanges[0];

    const contact = await NetworkingContact.GetContact(comm.Contact);
    if (!contact) {
      return "No such contact";
    }

    if (lastchange.Type === 0) {
      await NetworkingCommunication.Delete(comm.Id);

      await NetworkingHistory.delete(lastchange);
      return `Undone sending ${contact.name}`;
    }
    else if (lastchange.Type === 1) {
      comm.Initiated = 0;
      await NetworkingCommunication.Update(comm);

      await NetworkingHistory.delete(lastchange);
      return `Undone initiating ${contact.name}`;
    }
    else if (lastchange.Type === 2) {
      comm.Done = 0;
      await NetworkingCommunication.Update(comm);
      await NetworkingHistory.delete(lastchange);
      return `Undone doing ${contact.name}`;
    }

    return "Unexpected error";
  }

  private async formatName(name: string)
  {
    let res = `${name}`;

    const offline = await NetworkingCommunication.GetOfflineForContact(name) as any;
    const c = await NetworkingContact.GetContact(name);
    const stat = await NetworkingCommunication.GetContactStat(name);

    /*if (contact.active) {
      res += ` (d${contact.done} / i${contact.initiated} / t${contact.totalsent}, offline${offline})`;
    }
    else {
      res += ` (disabled, d${contact.done} / i${contact.initiated} / t${contact.totalsent}, offline${offline})`;
    }
    res += `\n`;*/

    if (c?.active) {
      res += ` (d${stat?.Done || 0} / i${stat?.Initiated || 0} / t${stat?.Sent || 0},`
        + ` offline${offline && offline.c || 0})`;
    }
    else {
      res += ` (disabled, d${stat?.Done || 0} / i${stat?.Initiated || 0} / t${stat?.Sent || 0},`
        + ` offline${offline && offline.c || 0})`;
    }
    res += `\n`;
    return res;
  }

  private async ShortStatistics()
  {
    const stats = await NetworkingCommunication.GetStats();
    const done = stats && stats.Done || 0;
    const init = stats && stats.Initiated || 0;
    const sent = stats && stats.Sent || 0;

    return `Current statistics: `
      + `d${done} / i${init} / t${sent} `
      + `(d${Math.round(done * 100 / sent)}% / i${Math.round(init * 100 / sent)}%)`;
  }

  private async FullStatistics()
  {
    const stats = await NetworkingCommunication.GetStats();
    const done = stats && stats.Done || 0;
    const init = stats && stats.Initiated || 0;
    const sent = stats && stats.Sent || 0;
    const days = await NetworkingCommunication.GetTotalDays();

    const offline = await NetworkingCommunication.GetOfflineStats() as any;

    return (await this.ShortStatistics()) +
    `\nOffline contacts: ${offline && offline.c || 0}` +
      `\nAverage contacts per day: ${shortNum(init / days)}` +
      `\nAverage answers per day: ${shortNum(done / days)}`;
  }

  public async AddContact(name: string)
  {
    const existing = await NetworkingContact.GetContact(name);

    if (existing) {
      existing.active = true;

      NetworkingContact.Update(existing);
      return `Reactivated ${name}.`;
    }

    const contact = new NetworkingContact(name);
    await NetworkingContact.Insert(contact);

    return `Added ${name} to your networking contacts.`;
  }

  private CommunicationDatedFormat(updatedcommunication : NetworkingCommunication | undefined | null) {
    if (updatedcommunication && updatedcommunication.CREATED_DT) {
      return MIS_DT.FormatDate(updatedcommunication.CREATED_DT);
    }
    else {
      return "null";
    }
  }

  public async Process(message: MessageWrapper)
  {
    if (message.checkRegex(/\/networking add/)) {
      setWaitingForValue(`Please, write name who to add.`,
        async (msg) =>
        {
          const name = msg.message.text;

          if (!name) { return; }

          this.reply(message, await this.AddContact(name));
        });
      return;
    }
    if (message.checkRegex(/\/networking init$/)) {
      const lastcontact = await NetworkingCommunication.GetLastContact();
      if (!lastcontact) {
        return this.reply(message, `No last user to mark done.`);
      }

      const res = await this.RaiseInitForStat(lastcontact.Contact);
      if (typeof res === "string") {
        return this.reply(message, res);
      }

      this.reply(message, `Marked interaction with ${res.contact.name} dated ${this.CommunicationDatedFormat(res.updatedcommunication)} as initiated.\n` +
            await this.ShortStatistics());

      return;
    }
    if (message.checkRegex(/\/networking done$/)) {
      const lastcontact = await NetworkingCommunication.GetLastContact();
      if (!lastcontact) {
        return this.reply(message, `No last user to mark done.`);
      }

      const res = await this.RaiseDoneForStat(lastcontact.Contact);
      if (typeof res === "string") {
        return this.reply(message, res);
      }

      this.reply(message, `Marked interaction with ${res.contact.name} dated ${this.CommunicationDatedFormat(res.updatedcommunication)} as done.\n` +
            await this.ShortStatistics());

      return;
    }
    if (message.checkRegex(/\/networking list/)) {
      let res = "";

      const contacts = await NetworkingContact.GetContacts();
      const statsMap = new Map<NetworkingContact, {
        Sent?: number | undefined;
        Initiated?: number | undefined;
        Done?: number | undefined;
      }>();

      for (const x of contacts) {
        const xstats = await NetworkingCommunication.GetContactStat(x.name);
        statsMap.set(x, xstats);
      }

      const sorted = contacts.sort((x : NetworkingContact, y : NetworkingContact) =>
      {
        if (y.active !== x.active) {
          return (y.active) ? 1 : -1;
        }

        const xstats = statsMap.get(x);
        const ystats = statsMap.get(y);

        if (!xstats) {
          return 1;
        }
        if (!ystats) {
          return -1;
        }

        if (ystats.Sent !== xstats.Sent) {
          return (ystats.Sent || 0) - (xstats.Sent || 0);
        }
        if (ystats.Initiated !== xstats.Initiated) {
          return (ystats.Initiated || 0) - (xstats.Initiated || 0);
        }
        return (ystats.Done || 0) - (xstats.Done || 0);
      });

      for (const contact of sorted) {
        res += await this.formatName(contact.name);
      }

      const active = await NetworkingContact.GetActive();

      res += `---\n`;
      res += `Average cycle ${active.length / this.howmanyperday} days.`;

      this.reply(message, res);
      return;
    }
    if (message.checkRegex(/^\/networking done \(...\)/)) {
      setWaitingForValue(`Please, write name who to mark as done.`,
        async (msg) =>
        {
          const name = msg.message.text;

          if (!name) { return; }

          const res = await this.RaiseDoneForStat(name);
          if (typeof res === "string") {
            return this.reply(message, res);
          }

          this.reply(message, `Marked interaction with ${res.contact.name} dated ${this.CommunicationDatedFormat(res.updatedcommunication)} as done.\n` +
            await this.ShortStatistics());
        });
      return;
    }
    if (message.checkRegex(/^\/networking init \(...\)/)) {
      setWaitingForValue(`Please, write name who to mark as initiated.`,
        async (msg) =>
        {
          const name = msg.message.text;

          if (!name) { return; }

          const res = await this.RaiseInitForStat(name);
          if (typeof res === "string") {
            return this.reply(message, res);
          }

          this.reply(message, `Marked interaction with ${res.contact.name} dated ${this.CommunicationDatedFormat(res.updatedcommunication)} as initiated.\n` +
            await this.ShortStatistics());
        });
      return;
    }
    if (message.checkRegex(/^\/networking send \(...\)/)) {
      setWaitingForValue(`Please, write name who to mark as sent.`,
        async (msg) =>
        {
          const name = msg.message.text;

          if (!name) { return; }

          const res = await this.CreateCommunicationForContact(name);
          if (typeof res === "string") {
            return this.reply(message, res);
          }
          this.reply(message, `Created non-regular interaction with ${res.Contact}.\n` +
            await this.ShortStatistics());
        });
      return;
    }
    if (message.checkRegex(/^\/networking offline/)) {
      /*setWaitingForValue(`Please, write name who to mark as communicated offline.`,
        async (msg) =>
        {
          const name = msg.message.text;

          if (!name) { return; }

          const res = await OfflineNetworking.AddEntry(name);
          if (typeof res === "string") {
            return this.reply(message, res);
          }
        });*/
      return;
    }
    if (message.checkRegex(/^\/networking remove/)) {
      setWaitingForValue(`Please, write name who to remove.`,
        async (msg) =>
        {
          const name = msg.message.text;

          if (!name) { return; }

          let newstatus: boolean;

          const c = await NetworkingContact.GetContact(name);
          if (c) {
            newstatus = !c.active;
            c.active = newstatus;
            await NetworkingContact.Update(c);
          }
          else {
            return this.reply(message, "No such contact");
          }

          if (!newstatus) {
            this.reply(message, `Deactivated ${name} in your networking contacts.`);
          }
          else {
            this.reply(message, `Reactivated ${name} in your networking contacts.`);
          }
        });

      return;
    }
    
    if (message.checkRegex(/^\/networking undo/)) {
      message.reply("Are you sure you want to undo?", this.yesNoKeyboard());
      return setWaitingForValuePure(this.undo.bind(this));
    }
    if (message.checkRegex(/^\/networking test contacts stats/)) {
      const contacts = await NetworkingContact.GetContacts();

      let res = "";
      for (const contact of contacts) {
        const stat = await NetworkingCommunication.GetContactStat(contact.name);
        res += `\n${contact.name}\n`;

        res += JSON.stringify(stat);
      }

      this.reply(message, res);

      return;
    }
    if (message.checkRegex(/^\/networking unfinished/)) {
      this.reply(message, await this.GetRecentContacts());

      return;
    }
    if (message.checkRegex(/^\/networking force/)) {
      this.NetworkingSend();

      return;
    }
    if (message.checkRegex(/^\/networking stats/)) {
      this.reply(message, await this.FullStatistics());

      return;
    }
    if (message.checkRegex(/^\/networking/)) {
      this.reply(message, `Networking module.\n` +
        `Networking dashboard: ${await Config.url()}networking\n`
        + await this.ShortStatistics());
      return;
    }
    return false;
  }
}
export const NetworkingService = new NetworkingClass();
