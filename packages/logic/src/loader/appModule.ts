import type { AppModuleInfo } from '@/types/common';

/**
 * App 模块: 小程序的 app.js 文件执行时，会创建一个 AppModule 实例。
 * 
 * App({
 *  onLaunch: (options) => {
 *    console.log('App onLaunch', options);
 *  },
 *  onShow: (options) => {
 *    console.log('App onShow', options);
 *  },
 * });
 */
export class AppModule {
  type: string = 'app';
  /**
   * App 模块配置信息
   */
  moduleInfo: AppModuleInfo;

  constructor(moduleInfo: AppModuleInfo) {
    this.moduleInfo = moduleInfo;
  }
}