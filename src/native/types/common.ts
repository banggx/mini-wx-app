import { JSCore } from "@native/jscore";

export interface AppInfo {
  appId: string;
  path: string;
  name?: string;
  logo?: string;
  scene?: number;
  [key: string]: any;
}

export type OpenMiniAppOpts = Required<Omit<AppInfo, 'scene'>> & {
  scene?: number;
}

export interface BridgeParams {
  // 逻辑线程core
  jscore: JSCore;
  // 小程序页面相关的配置
  configInfo: Record<string, any>;
  appId: string;
  pagePath: string;
  pages: string[];
  // 页面query参数
  query?: Record<string, any>;
  scene?: number;
  isRoot?: boolean;
}

export interface WebviewParams {
  // 小程序页面配置参数
  configInfo: Record<string, any>;
  isRoot?: boolean;
}

export interface IMessage {
  type: string;
  body: any;
}

export interface NavigateToParams {
  url: string;
  success?: string;
}

export interface OpenPageParams {
  pagePath: string;
  query?: Record<string, any>;
  onSuccess?: (...args: any[]) => void;
}

export interface OpenMiniProgram {
  appId: string;
  path: string;
}