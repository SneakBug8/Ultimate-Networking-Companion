export class NetworkingChange
{
  public name: string = "";
  public type: "Init" | "Done" | "Sent" | "Offline" | undefined;

  public constructor(name: string, type: "Init" | "Done" | "Sent" | "Offline" | undefined)
  {
    this.name = name;
    this.type = type;
  }
}