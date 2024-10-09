export class MapToObject {
  public static Convert(map: Map<any, any>) {
      const obj = [];

      for (const entry of map) {
          obj.push([
              entry[0],
              entry[1],
          ]);
      }

      return obj;
  }
}
