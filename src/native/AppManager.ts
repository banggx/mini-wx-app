import { queryPath } from './utils/util';
import { getMiniAppInfo } from '@/service';
import { MiniApp } from './miniApp';
import type { Application } from '@native/application';
import type { AppInfo } from './types/common';

export class AppManager {
  // 管理所有创建的小程序
  static appStack: MiniApp[] = [];
  
  /**
   * 打开小程序App
   * @param opts 小程序参数
   * @param wx 客户端应用管理类，主要用来实现小程序页面的最终挂载
   */
  static async openApp(opts: AppInfo, wx: Application) {
    const { appId, path, scene } = opts;
    // 1. 解析 path 上的query 参数
    const { pagePath, query } = queryPath(path);
    // 2. 通过接口获取小程序的详细信息
    const { appName, logo } = await getMiniAppInfo(appId);
    // 3. 创建小程序App实例
    const miniApp = new MiniApp({
      appId,
      scene,
      logo,
      query,
      path: pagePath,
      name: appName,
    });
    this.appStack.push(miniApp);
    wx.presentView(miniApp);
  }
  
  /**
   * 关闭小程序App
   */
  static closeApp(miniApp: MiniApp) {
    miniApp.parent?.dismissView({
      destroy: false,
    });
  }
} 