export interface IMessage {
  type: string;
  body: any;
}

// view 页面的模块结构
export interface UIPageModuleInfo {
  path: string;
  render: (data: Record<string, any>) => string;
  usingComponents?: Record<string, string>;
  scopedId?: string;
}

export interface UIRenderOpts {
  pagePath: string;
  bridgeId: string;
}