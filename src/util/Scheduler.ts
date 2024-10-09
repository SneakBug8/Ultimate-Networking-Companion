import { IntervalsExecution } from "./IntervalsExecution";

class SchedulerClass
{
  private entries = new Array<IScheduleEntry>();

  public Schedule(h: number, callback: () => Promise<any>, title= "")
  {
    if (!h || !callback) {
      throw Error("Wrong scheduling tried");
    }
    this.entries.push({ hour: h, callback, title: title || callback.name });
  }

  public async Run(h: number)
  {
    for (const entry of this.entries) {
      if (!entry) {
        continue;
      }
      if (h === entry.hour || entry.hour < 0) {
        await entry.callback();
        IntervalsExecution.Execute(entry.title);
      }
    }
  }

  public async Interval()
  {
    const now = new Date(Date.now());
    const executed = await IntervalsExecution.Executed("scheduler");

    if (!executed) {
      await this.Run(now.getHours());
      await IntervalsExecution.Execute("scheduler");
    }
  }
}

interface IScheduleEntry
{
  hour: number;
  callback: () => Promise<void>;
  title: string;
}

export const Scheduler = new SchedulerClass();
