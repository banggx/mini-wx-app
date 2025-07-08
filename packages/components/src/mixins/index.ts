function toCamelCase(attr: string) {
  return attr.toLowerCase().replace(/-(.)/g, function (_, group) {
    return group.toUpperCase();
  });
}

// 处理 data-* 数据属性
function makeAttrParams(attrs: Record<string, any>) {
  const result = {};
  
  for (const attr in attrs) {
    if (!/^data-/.test(attr)) {
      continue;
    }
    
    const theAfter = attr.replace(/^data-/, '');
    const transAttr = toCamelCase(theAfter);
    result[transAttr] = attrs[attr];
  }

  return result;
}

export const miniAppMixin = {
  created() {
    for (let attr in (this as any).$attrs) {
      if (!/^bind/.test(attr)) {
        continue;
      }
      
      if (!(this as any).$attrs[attr]) {
        continue;
      }

      const eventName = attr.replace(/^bind/, '');
      const { methodName, params } = (this as any).$attrs[attr];
      // 这个会由 ui 线程创建Vue渲染实例的时候进行注入，用户获取到对应 bridge id
      const { id } = (this as any).$vnode.context._bridgeInfo;

      (this as any).$on(eventName, (sysParams) => {
        // 构造小程序事件参数对象
        const _event = {
          detail: {
            ...sysParams,
          },
          currentTarget: {
            dataset: makeAttrParams((this as any).$attrs)
          }
        };
        const paramsList = params.map(param => {
          if (param === '$event') {
            return _event;
          }
          return param;
        });
        
        if (!paramsList.length) {
          paramsList.push(_event);
        }
        
        window.JSBridge.onReceiveUIMessage({
          type: 'triggerEvent',
          body: {
            methodName,
            id,
            paramsList
          }
        });
      });
    }
  }
};