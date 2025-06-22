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