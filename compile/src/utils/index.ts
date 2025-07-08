export function uuid(len: number = 10) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < len; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

export function getCssExpressionValue(cssText: string) {
  if (!/{{(\w+)}}(\w*)\s*/g.test(cssText)) {
    return `'${cssText}'`;
  }

  // 处理{{}}表达式
  // 例如: '{{name}}abcd' => 转化后为 name+'abcd'
  const result = cssText.replace(/{{(\w+)}}(\w*)\s*/g, (match, p1, p2, offset, string) => {
    let replacement = "+" + p1;
    
    if (offset === 0) {
      replacement = p1;
    }
    if (p2) {
      replacement += "+'" + p2 + "'";
    }
    if (offset + match.length < string.length) {
      replacement += "+' '";
    }
    return replacement;
  });
  return result;
}

// 解析写在wxml上的事件触发函数表达式
// 例如: tapHandler(1, $event, true) => {methodName: 'tapHandler', params: [1, '$event', true]}
export function getFunctionExpressionInfo(eventBuildInfo: string) {
  const trimStr = eventBuildInfo.trim();
  const infoList = trimStr.split('(');
  const methodName = infoList[0].trim();

  let paramsInfo = '';
  if (infoList[1]) {
    paramsInfo = infoList[1].split(')')[0];
  }

  // 特殊处理$event
  paramsInfo = paramsInfo.replace(/\$event/, `'$event'`);
  
  return `{methodName: '${methodName}', params: [${paramsInfo}]}`
}