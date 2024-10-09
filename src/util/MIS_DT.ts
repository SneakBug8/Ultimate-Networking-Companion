import dateFormat = require("dateformat");

export class MIS_DT
{
  public static GetDay()
  {
    const mis_dt = new Date(Date.now());
    mis_dt.setHours(0);
    mis_dt.setMinutes(0);
    mis_dt.setSeconds(0);
    mis_dt.setMilliseconds(0);
    return mis_dt.getTime();
  }

  public static GetHour()
  {
    const mis_dt = new Date(Date.now());
    mis_dt.setMinutes(0);
    mis_dt.setSeconds(0);
    mis_dt.setMilliseconds(0);
    return mis_dt.getTime();
  }

  public static GetExact()
  {
    const mis_dt = new Date(Date.now());
    return mis_dt.getTime();
  }

  public static Various(date: Date)
  {
    return date.getTime();
  }

  public static RoundToDay(mis_dt: Date)
  {
    mis_dt.setHours(0);
    mis_dt.setMinutes(0);
    mis_dt.setSeconds(0);
    mis_dt.setMilliseconds(0);
    return mis_dt.getTime();
  }

  public static OneSecond()
  {
    return 1000;
  }

  public static OneMinute()
  {
    return 60 * 1000;
  }

  public static OneHour()
  {
    return 60 * 60 * 1000;
  }

  public static OneDay()
  {
    return 24 * 60 * 60 * 1000;
  }

  public static OneWeek()
  {
    return 7 * 24 * 60 * 60 * 1000;
  }

  public static FormatDate(mis_dt: number)
  {
    return dateFormat(new Date(mis_dt), "dd.mm.yyyy");
  }

  public static FormatTime(mis_dt: number)
  {
    return dateFormat(new Date(mis_dt), "HH:MM");
  }

  public static FormatMonth(mis_dt: number)
  {
    return dateFormat(new Date(mis_dt), "mm.yyyy");
  }
}