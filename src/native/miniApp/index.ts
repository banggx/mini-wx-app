import { AppManager } from '@native/AppManager';
import { miniAppTpl } from './tpl';
import { JSCore } from '@native/jscore';
import { Bridge } from '@native/bridge';
import type { Application } from '@native/application';
import type { BridgeParams, OpenMiniAppOpts } from '@native/types/common';

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
  /**
   * 当前小程序的 jscore 实例
   * 
   * 一个小程序公用一个唯一的 jscore 实例，用于执行小程序的 js 代码
   */
  jscore: JSCore;
  /**
   * bridge列表
   */
  bridgeList: Bridge[] = [];
  /**
   * bridge ID -> bridge 实例的映射 
   */
  bridges: Record<string, Bridge> = {};
  
  constructor(opts: OpenMiniAppOpts) {
    this.app = opts;
    this.appId = opts.appId;
    this.jscore = new JSCore();
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
    // 小程序初始化
    this.init();
  }

  async init() {
    // 初始化小程序逻辑执行线程
    await this.jscore?.init();

    // 创建 js bridge，构建起 logic worker -> ui worker 通信
    const entryPageBridge = await this.createBridge({
      jscore: this.jscore,
      isRoot: true,
      appId: this.app.appId,
      pagePath: this.app.path,
      pages: [],
      query: this.app.query,
      scene: this.app.scene,
      configInfo: { // 暂时模拟一下美团小程序的页面配置参数
        "navigationBarBackgroundColor": "#ffd200",
        "navigationBarTextStyle": "black",
        "navigationBarTitleText": "美团",
        "backgroundColor": "#fff",
        "usingComponents": {}
      }
    });
    this.bridgeList.push(entryPageBridge);

    this.jscore.postMessage({
      type: 'loadResource',
      body: {
        appId: 'meituan',
        bridgeId: entryPageBridge.id,
        pages: [
          'pages/home/index'
        ]
      }
    })

    this.hideLaunchScreen();
  }

  async createBridge(opts: BridgeParams) {
    const bridge = new Bridge(opts);
    bridge.parent = this;
    // 初始化bridge
    bridge.init();
    return bridge;
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

    this.updateActionColorStyle('black');
    name.innerHTML = this.app.name;
    logo.src = this.app.logo;
    launchScreen.style.display = 'block';
  }
  
  /**
   * 隐藏小程序加载状态
   */
  hideLaunchScreen() {
    const startPage = this.el.querySelector('.wx-mini-app__launch-screen') as HTMLElement;
    startPage.style.display = 'none';
  }

  updateActionColorStyle(color: string) {
    const action = this.el.querySelector('.wx-mini-app-navigation__actions') as HTMLElement;

		if (color === 'white') {
			action.classList.remove('wx-mini-app-navigation__actions--black');
			action.classList.add('wx-mini-app-navigation__actions--white');
		}

		if (color === 'black') {
			action.classList.remove('wx-mini-app-navigation__actions--white');
			action.classList.add('wx-mini-app-navigation__actions--black');
		}
  }

  bindCloseEvent() {
    const closeBtn = this.el.querySelector('.wx-mini-app-navigation__actions-close') as HTMLElement;

    closeBtn.onclick = () => {
      AppManager.closeApp(this);
    };
  }
}
