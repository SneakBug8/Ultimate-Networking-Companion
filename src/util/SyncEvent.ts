export class SyncEvent
{
  private listeners = new Array<(...args: any[]) => Promise<boolean>>();

  public Subscribe(subscriber: (...args: any[]) => Promise<boolean>)
  {
    this.listeners.push(subscriber);
  }

  public async Emit(...args: any[])
  {
    for (const listener of this.listeners) {
      const r = await listener(...args);
      if (r !== false) {
        return true;
      }
    }
    return false;
  }
}
