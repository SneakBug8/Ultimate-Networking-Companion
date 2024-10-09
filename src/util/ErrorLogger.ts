export const ErrorLogger = {
  Log(e: any)
  {
    try {
      console.error(JSON.parse(JSON.parse(e)));
    }
    catch (x) {
      console.error(e);
    }
  }
};
