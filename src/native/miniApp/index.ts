import { AppManager } from '@native/AppManager';
import { miniAppTpl } from './tpl';
import type { Application } from '@native/application';
import type { OpenMiniAppOpts } from '@native/types/common';

export class MiniApp {
  /* 小程序appId */
  appId: string;
  /* 小程序App信息 */
  app: OpenMiniAppOpts;
  /* application实例 */
  parent: Application | null = null;
  /* 小程序页面根节点 */
  el: HTMLElement;
  /* 小程序webview的挂载节点 */
  webviewContainer: HTMLElement | null = null;
  
  constructor(opts: OpenMiniAppOpts) {
    this.app = opts;
    this.appId = opts.appId;
    // 创建小程序页面的根节点
    this.el = document.createElement('div');
    this.el.classList.add('wx-native-view');
  }
  
  /* 初始化小程序页面 */
  viewDidLoad() {
    // 初始化小程序页面模版
    this.initMiniAppFrame();
    this.webviewContainer = this.el.querySelector('.wx-mini-app__webviews');
    // 显示小程序加载状态信息
    this.showLaunchScreen();
    // 绑定小程序关闭事件
    this.bindCloseEvent();
  }
  
  initMiniAppFrame() {
    this.el.innerHTML = miniAppTpl;
  }
  
  /**
   * 显示小程序加载状态
   */
  showLaunchScreen() {
    const launchScreen = this.el.querySelector('.wx-mini-app__launch-screen') as HTMLElement;
    const name = this.el.querySelector('.wx-mini-app__name') as HTMLElement;
    const logo = this.el.querySelector('.wx-mini-app__logo-img-url') as HTMLImageElement;

    name.innerHTML = this.app.name;
    logo.src = this.app.logo;
    launchScreen.style.display = 'block';
  }
  
  bindCloseEvent() {
    const closeBtn = this.el.querySelector('.wx-mini-app-navigation__actions-close') as HTMLElement;

    closeBtn.onclick = () => {
      AppManager.closeApp(this);
    };
  }
}
