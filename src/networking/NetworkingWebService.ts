import { WebApi } from "../api/web";
import { Color } from "../util/Color";
import { MIS_DT } from "../util/MIS_DT";
import * as express from "express";
import { NetworkingCommunication } from "./NetworkingCommunication";
import { NetworkingContact } from "./NetworkingContact";
import { WebHelper } from "../util/WebHelper";
import { NetworkingService } from "./Networking";

export class NetworkingWebClass
{
  public Init()
  {
    WebApi.app.get("/", (req, res) => res.render("networking/dashboard"));
    WebApi.app.get("/networking", (req, res) => res.render("networking/dashboard"));

    WebApi.app.get("/networking/chart", (req, res) => res.render("networking/chart"));
    WebApi.app.get("/networking/monthly", (req, res) => res.render("networking/monthly"));
    WebApi.app.get("/networking/cumulative", (req, res) => res.render("networking/cumulative"));
    WebApi.app.get("/networking/data", (req, res) => res.render("networking/data"));
    WebApi.app.get("/networking/contacts", (req, res) => res.render("networking/contacts"));

    WebApi.app.get("/networking/communications", (req, res) => res.render("networking/communications"));
    WebApi.app.get("/api/networking/communications/list", this.onGetNetworkingCommunications);
    WebApi.app.get("/api/networking/communications/card", this.onGetNetworkingCard);
    WebApi.app.post("/api/networking/communications/add", this.onAddCommunication);
    WebApi.app.post("/api/networking/communications/update", this.onUpdateCommunication);
    WebApi.app.post("/api/networking/communications/raise", this.onRaiseCommunication);
    WebApi.app.post("/api/networking/communications/drop", this.onDropCommunication);

    WebApi.app.get("/api/networking/contacts/list", this.OnGetContacts);
    WebApi.app.post("/api/networking/contacts/add", this.OnAddContact);
    WebApi.app.post("/api/networking/contacts/update", this.OnUpdateContact);
    WebApi.app.post("/api/networking/contacts/disable", this.OnDisableContact);

    WebApi.app.get("/api/networking/entries", this.OnNetworkingData);
    WebApi.app.get("/api/networking/chart", this.OnNetworkingChart);
    WebApi.app.get("/api/networking/monthly", this.OnNetworkingMonthly);
    WebApi.app.get("/api/networking/cumulative", this.OnNetworkingChartCumulative);
  }

  private async OnAddContact(req: express.Request, res: express.Response)
  {
    const name = req.body.name;

    if (!name) {
      WebHelper.Error(res, "Bad content");
      return;
    }

    const c = new NetworkingContact(name);

    await NetworkingContact.Insert(c);

    WebHelper.Success(res, "Successfuly inserted");
  }

  private async OnUpdateContact(req: express.Request, res: express.Response)
  {
    const contact = req.body.contact as NetworkingContact;

    if (!contact || !contact.Id) {
      WebHelper.Error(res, "Bad content");
      return;
    }

    const existingcontact = await NetworkingContact.GetById(contact.Id);

    if (!existingcontact) {
      WebHelper.Error(res, "No such contact");
      return;
    }

    if (contact.name != existingcontact.name) {
      const comms = await NetworkingCommunication.GetWithContact(existingcontact.name);

      for (const comm of comms) {
        comm.Contact = contact.name;
        await NetworkingCommunication.Update(comm);
      }
    }

    await NetworkingContact.Update(contact);

    WebHelper.Success(res, "Successfuly updated");
  }

  private async OnDisableContact(req: express.Request, res: express.Response)
  {
    const name = req.body.name;

    console.log(req.body);

    if (!name) {
      WebHelper.Error(res, "Bad content");
      return;
    }

    const c = await NetworkingContact.GetContact(name);

    if (!c) {
      WebHelper.Error(res, "No such contact");
      return;
    }

    c.active = !c.active;

    await NetworkingContact.Update(c);

    WebHelper.Success(res, "Successfuly updated");
  }

  public async OnGetContacts(req: express.Request, res: express.Response)
  {
    const contacts = await NetworkingContact.GetContacts();
    const stats = await NetworkingCommunication.GetContactsStats();
    const offline = await NetworkingCommunication.GetContactOfflineStats();
    res.json({ contacts, stats, offline });
  }

  private async onAddCommunication(req: express.Request, res: express.Response)
  {
    const name = req.body.name;

    if (!name) {
      WebHelper.Error(res, "Bad content");
      return;
    }

    const r = await NetworkingService.CreateCommunicationForContact(name);

    if (typeof r === "string") {
      WebHelper.Error(res, "Unknown error");
      return;
    }

    WebHelper.Success(res, "Successfuly created");
  }

  private async onUpdateCommunication(req: express.Request, res: express.Response)
  {
    const comm = req.body.communication as NetworkingCommunication;

    if (!comm || !comm.Id) {
      WebHelper.Error(res, "Bad content"); return;
    }

    const c = await NetworkingCommunication.GetById(comm.Id);

    if (!c) {
      WebHelper.Error(res, "No such communication"); return;
    }

    c.title = comm.title;
    c.description = comm.description;
    c.type = comm.type;

    await NetworkingCommunication.Update(c);

    WebHelper.Success(res, "Successfuly updated");
  }

  private async onRaiseCommunication(req: express.Request, res: express.Response)
  {
    const id = req.body.id;

    if (!id) {
      WebHelper.Error(res, "Bad content"); return;
    }

    const c = await NetworkingCommunication.GetById(id);

    if (!c) {
      WebHelper.Error(res, "No such communication"); return;
    }

    if (!c.Initiated) {
      await NetworkingService.SetCommunicationInitiated(c);
    }
    else if (!c.Done) {
      await NetworkingService.SetCommunicationDone(c);
    }

    WebHelper.Success(res, "Successfuly updated");
  }

  private async onDropCommunication(req: express.Request, res: express.Response)
  {
    const id = req.body.id;

    if (!id) {
      WebHelper.Error(res, "Bad content"); return;
    }

    const c = await NetworkingCommunication.GetById(id);

    if (!c) {
      WebHelper.Error(res, "No such communication"); return;
    }

    if (c.Done) {
      c.Done = 0;
    }
    else if (c.Initiated) {
      c.Initiated = 0;
    }

    await NetworkingCommunication.Update(c);

    WebHelper.Success(res, "Successfuly undone");
  }

  public async onGetNetworkingCommunications(req: express.Request, res: express.Response)
  {
    const communications = await NetworkingCommunication.GetWebList();
    res.json({ communications });
  }

  public async onGetNetworkingCard(req: express.Request, res: express.Response)
  {
    const communications = await NetworkingCommunication.GetWebList();

    const data = {} as any;

    if (communications[0] && communications[0].CREATED_DT > MIS_DT.GetDay()) {
      data.today = communications[0];

      if (communications[1] && communications[1].CREATED_DT > MIS_DT.GetDay() - MIS_DT.OneDay()) {
        data.yesterday = communications[1];
      }
    }
    else if (communications[0] && communications[0].CREATED_DT > MIS_DT.GetDay() - MIS_DT.OneDay()) {
      data.yesterday = communications[0];
    }

    const contacts = await NetworkingContact.GetActive();

    data.contactscount = contacts.length;

    const firstDay = new Date(MIS_DT.GetExact() - MIS_DT.OneDay() * 30);
    const lastDay = new Date(MIS_DT.GetExact());

    const entries = await NetworkingCommunication.GetBetweenDates(firstDay.getTime(),
      lastDay.getTime());

    data.createdsum = entries.reduce((p, c) => p + c.Sent, 0);
    data.initiatedsum = entries.reduce((p, c) => p + c.Initiated, 0);
    data.donesum = entries.reduce((p, c) => p + c.Done, 0);

    res.json(data);
  }

  public async OnNetworkingData(req: express.Request, res: express.Response)
  {
    const entries = await NetworkingCommunication.GetLastMonth();

    res.json(entries);
  }

  public async OnNetworkingChart(req: express.Request, res: express.Response)
  {
    const entries = await NetworkingCommunication.GetLastMonth();

    const crarr = new Array<number>();
    const inarr = new Array<number>();
    const doarr = new Array<number>();

    for (let i = MIS_DT.GetDay() - MIS_DT.OneDay() * 30; i <= MIS_DT.GetDay(); i += MIS_DT.OneDay()) {
      const created = entries.filter((x) => x.Sent && MIS_DT.RoundToDay(new Date(x.CREATED_DT)) === i);
      const initiated = entries.filter((x) => x.Initiated && MIS_DT.RoundToDay(new Date(x.INITIATED_DT)) === i);
      const done = entries.filter((x) => x.Done && MIS_DT.RoundToDay(new Date(x.DONE_DT)) === i);

      crarr.push(created.length);
      inarr.push(initiated.length);
      doarr.push(done.length);
    }

    const datasets = new Array<object>();

    datasets.push({
      label: "Sent",
      data: crarr,
      borderColor: Color.GetColor(0),
    });
    datasets.push({
      label: "Initiated",
      data: inarr,
      borderColor: Color.GetColor(1),
    });
    datasets.push({
      label: "Done",
      data: doarr,
      borderColor: Color.GetColor(2),
    });

    const labels = [];

    for (let i = MIS_DT.GetDay() - MIS_DT.OneDay() * 30; i <= MIS_DT.GetDay(); i += MIS_DT.OneDay()) {
      labels.push(MIS_DT.FormatDate(i));
    }

    res.json({ datasets, labels });
  }

  public async OnNetworkingChartCumulative(req: express.Request, res: express.Response)
  {
    const entries = await NetworkingCommunication.GetLastMonth();
    const preventries = await NetworkingCommunication.GetBetweenDates(
      MIS_DT.GetDay() - MIS_DT.OneDay() * 60,
      MIS_DT.GetDay() - MIS_DT.OneDay() * 30
    );

    const crarr = new Array<number>();
    const inarr = new Array<number>();
    const doarr = new Array<number>();

    const prevcrarr = new Array<number>();
    const previnarr = new Array<number>();
    const prevdoarr = new Array<number>();

    let crsum = 0;
    let insum = 0;
    let dosum = 0;

    let prevcrsum = 0;
    let previnsum = 0;
    let prevdosum = 0;

    for (let i = MIS_DT.GetDay() - MIS_DT.OneDay() * 30; i <= MIS_DT.GetDay(); i += MIS_DT.OneDay()) {
      const created = entries.filter((x) => x.Sent && MIS_DT.RoundToDay(new Date(x.CREATED_DT)) === i);
      const initiated = entries.filter((x) => x.Initiated && MIS_DT.RoundToDay(new Date(x.INITIATED_DT)) === i);
      const done = entries.filter((x) => x.Done && MIS_DT.RoundToDay(new Date(x.DONE_DT)) === i);

      crsum += created.length;
      insum += initiated.length;
      dosum += done.length;

      crarr.push(crsum);
      inarr.push(insum);
      doarr.push(dosum);

      const prevcreated = preventries.filter((x) => x.Sent &&
        MIS_DT.RoundToDay(new Date(x.CREATED_DT)) === i - MIS_DT.OneDay() * 30);
      const previnitiated = preventries.filter((x) => x.Initiated &&
        MIS_DT.RoundToDay(new Date(x.INITIATED_DT)) === i - MIS_DT.OneDay() * 30);
      const prevdone = preventries.filter((x) => x.Done &&
        MIS_DT.RoundToDay(new Date(x.DONE_DT)) === i - MIS_DT.OneDay() * 30);

      prevcrsum += prevcreated.length;
      previnsum += previnitiated.length;
      prevdosum += prevdone.length;

      prevcrarr.push(prevcrsum);
      previnarr.push(previnsum);
      prevdoarr.push(prevdosum);
    }

    const datasets = new Array<object>();

    datasets.push({
      label: "Sent",
      data: crarr,
      borderColor: Color.GetColor(0),
    });
    datasets.push({
      label: "Initiated",
      data: inarr,
      borderColor: Color.GetColor(1),
    });
    datasets.push({
      label: "Done",
      data: doarr,
      borderColor: Color.GetColor(2),
    });

    datasets.push({
      label: "Sent Prev Period",
      data: prevcrarr,
      borderColor: Color.GetAlphaColor(0),
    });
    datasets.push({
      label: "Initiated Prev Period",
      data: previnarr,
      borderColor: Color.GetAlphaColor(1),
    });
    datasets.push({
      label: "Done Prev Period",
      data: prevdoarr,
      borderColor: Color.GetAlphaColor(2),
    });

    const labels = [];

    for (let i = MIS_DT.GetDay() - MIS_DT.OneDay() * 30; i <= MIS_DT.GetDay(); i += MIS_DT.OneDay()) {
      labels.push(MIS_DT.FormatDate(i));
    }

    res.json({ datasets, labels });
  }

  public async OnNetworkingMonthly(req: express.Request, res: express.Response)
  {
    const date = new Date(MIS_DT.GetDay());

    const crarr = new Array<number>();
    const inarr = new Array<number>();
    const doarr = new Array<number>();

    const labels = [];

    // Jan - 0th month

    for (let i = date.getMonth() - 12; i <= date.getMonth(); i++) {
      const y = date.getFullYear();

      const firstDay = new Date(y - (i < 0 ? 1 : 0), (i + 12) % 12, 1);
      const lastDay = new Date(y - (i < 0 ? 1 : 0), (i + 12) % 12 + 1, 0);

      console.log(`First day - ${MIS_DT.FormatDate(firstDay.getTime())} + ${firstDay.getTime()}`);
      console.log(`Last day - ${MIS_DT.FormatDate(lastDay.getTime())} + ${lastDay.getTime()}`);

      const entries = await NetworkingCommunication.GetBetweenDates(firstDay.getTime(),
        lastDay.getTime());

      const crsum = entries.reduce((p, c) => p + c.Sent, 0);
      const insum = entries.reduce((p, c) => p + c.Initiated, 0);
      const dosum = entries.reduce((p, c) => p + c.Done, 0);
      crarr.push(crsum);
      inarr.push(insum);
      doarr.push(dosum);

      labels.push(MIS_DT.FormatMonth(firstDay.getTime()));
      console.log(`Month ${i} - ${MIS_DT.FormatMonth(firstDay.getTime())}`);
    }

    const datasets = new Array<object>();

    datasets.push({
      label: "Sent",
      data: crarr,
      borderColor: Color.GetColor(0),
    });
    datasets.push({
      label: "Initiated",
      data: inarr,
      borderColor: Color.GetColor(1),
    });
    datasets.push({
      label: "Done",
      data: doarr,
      borderColor: Color.GetColor(2),
    });

    res.json({ datasets, labels });
  }
}

export const NetworkingWeb = new NetworkingWebClass();
