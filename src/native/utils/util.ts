export function queryPath(path: string) {
  const [pagePath, paramsStr] = path.split('?')[1];
  const result: Record<string, any> = {
    query: {},
    pagePath,
  };

  if (!paramsStr) {
    return result;
  }

  let paramList = paramsStr.split('&');

  paramList.forEach((param) => {
    let key = param.split('=')[0];
    let value = param.split('=')[1];

    result.query[key] = value;
  });

  return result;
}

export function sleep(time: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}