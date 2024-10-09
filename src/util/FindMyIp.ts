import axios from "axios";

export class FindMyIp
{
  public static async Ipify()
  {
    const res = await axios.get(
      `https://api.ipify.org?format=json`);

    return res.data?.ip;
  }
}