import { Sleep } from "../util/Sleep";

let requestrepeating = false;

export async function RequestRepeater<T>(fun: () => Promise<T>,
  backup: T | undefined = undefined,
                                         tries = 5): Promise<T>
{
  if (!backup) {
    (backup as any) = {};
  }

  while (requestrepeating) {
    await Sleep(100);
  }

  requestrepeating = true;
  let error;
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fun();
      requestrepeating = false;
      return r;
    }
    catch (e) {
      console.error(`RequestRepeater${i} - ` + e);
      await Sleep(200);
      error = e;
    }
  }

  if (error) {
    // requestrepeating = false;
    // throw error;
    console.error(error);
  }

  requestrepeating = false;
  return backup as any;
}
