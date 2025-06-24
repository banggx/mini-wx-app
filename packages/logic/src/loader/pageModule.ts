import type { PageModuleInfo, PageModuleCompileInfo } from '@/types/common';

/**
 * Page 页面模块, 小程序的每个页面逻辑代码都会创建一个对应的 PageModule 实例
 * 
 * Page({
 *  data: {
 *    text: 'test'
 *  },
 *  onReady() {
 *    console.log('Page onReady');
 *  },
 *  onShow() {
 *    console.log('Page onShow');
 *  },
 * }, {
 *  path: 'pages/home/index'  // 这个编译配置参数会在编译小程序阶段由编译器注入
 * })
 */
export class PageModule {
  type: string = 'page';
  /**
   * Page 模块配置信息
   */
  moduleInfo: PageModuleInfo;
  /**
   * page 模块编译信息
   */
  compileInfo: PageModuleCompileInfo;

  constructor(moduleInfo: PageModuleInfo, compileInfo: PageModuleCompileInfo) {
    this.moduleInfo = moduleInfo;
    this.compileInfo = compileInfo;
  }

  getInitialData() {
    const moduleData = this.moduleInfo.data || {};
    
    return {
      ...moduleData,
    }
  }
}
