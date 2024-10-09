export class MapAsync {
    public static async Map<T>(arr: Array<T>, callback: (t: T) => Promise<any>) {
        await Promise.all(arr.map(callback));
        return arr;
    }
}