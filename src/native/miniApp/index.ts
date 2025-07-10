import { AppManager } from '@native/AppManager';
import { miniAppTpl } from './tpl';
import { JSCore } from '@native/jscore';
import { Bridge } from '@native/bridge';
import { mergePageConfig } from './utils';
import type { Application } from '@native/application';
import type { BridgeParams, IMessage, NavigateToParams, OpenMiniAppOpts, OpenPageParams } from '@native/types/common';
import { queryPath, sleep } from '../utils/util';

export class MiniApp {
  /* 小程序appId */
  appId: string;
  /* 小程序App信息 */
  app: OpenMiniAppOpts;
  /* application实例 */
  parent: Application | null = null;
  /* 小程序页面根节点 */
  el: HTMLElement;
  /**
   * 小程序 app 配置
   */
  appConfig: Record<string, any> | null = null;
  /* 小程序webview的挂载节点 */
  webviewContainer: HTMLElement | null = null;
  /**
   * webview 页面切换动画是否结束
   */
  webviewAnimaEnd: boolean = true;
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
    // 注册jscore消息监听，处理小程序全局事件
    this.jscore.addEventListener('message', this.jscoreMessageHandler.bind(this));
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
    this.jscore?.init();

    // 模拟读取小程序配置文件信息
    const configPath = `/${this.app.appId}/config.json`;
    const res = await fetch(configPath).then(res => res.text());
    this.appConfig = JSON.parse(res);

    // 创建 js bridge，构建起 logic worker -> ui worker 通信
    const entryPagePath = this.app.path || this.appConfig!.app.entryPagePath;
    const pageConfig = this.appConfig!.modules?.[entryPagePath];
    const entryPageBridge = await this.createBridge({
      jscore: this.jscore,
      isRoot: true,
      appId: this.app.appId,
      pagePath: this.app.path,
      pages: this.appConfig!.app?.pages,
      query: this.app.query,
      scene: this.app.scene,
      configInfo: mergePageConfig(this.appConfig!.app, pageConfig),
    });
    this.bridgeList.push(entryPageBridge);

    // 开始出发小程序应用初始化
    entryPageBridge.start();

    this.hideLaunchScreen();
  }

  async createBridge(opts: BridgeParams) {
    const bridge = new Bridge(opts);
    bridge.parent = this;
    // 初始化bridge
    await bridge.init();
    return bridge;
  }

  onPresentIn() {
    // 触发当前页面的 onShow
    const currentBridge = this.bridgeList[this.bridgeList.length - 1];
    currentBridge && currentBridge.appShow();
    currentBridge && currentBridge.pageShow();
  }

  onPresentOut() {
    // 触发当前页面的onHide
    const currentBridge = this.bridgeList[this.bridgeList.length - 1];
    currentBridge && currentBridge.appHide();
    currentBridge && currentBridge.pageHide();
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

  jscoreMessageHandler(msg: IMessage) {
    const { type, body } = msg;

    if (type !== 'triggerWXApi') {
      return;
    }
    const { apiName, params } = body;
    this[apiName]?.(params);
  }
  // 通知回logic侧触发回调
  createCallback(callbackId: string) {
    const self = this;
    return function(...args: any) {
      self.jscore.postMessage({
        type: 'triggerCallback',
        body: {
          callbackId,
          args
        }
      })
    }
  }

  navigateTo(params: NavigateToParams) {
    const { url, success } = params;
    const { pagePath, query } = queryPath(url);
    const successCallback = success ? this.createCallback(success) : undefined;
    
    this.openPage({
      pagePath: pagePath.replace(/^\//g, ''),
      query,
      onSuccess: successCallback
    });
  }

  async navigateBack() {
    if (this.bridgeList.length < 2 || !this.webviewAnimaEnd) return;

    this.webviewAnimaEnd = false;
    const currentBridge = this.bridgeList.pop()!;
    const preBridge = this.bridgeList[this.bridgeList.length - 1];
    
    // 当前页面推出
    currentBridge.webview!.el.classList.add('wx-native-view--before-enter');
		currentBridge.webview!.el.classList.add('wx-native-view--enter-anima');
    // 触发当前页面的destory
    currentBridge.destroy();
    
    // 上一个页面推入
    preBridge.webview!.el.classList.remove('wx-native-view--slide-out');
		preBridge.webview!.el.classList.add('wx-native-view--instage');
		preBridge.webview!.el.classList.add('wx-native-view--enter-anima');
    // 触发上一个页面的生命周期函数
		preBridge.pageShow && preBridge.pageShow();
    await sleep(540);
		this.webviewAnimaEnd = true;

    // 页面进入后移除动画相关class
		preBridge.webview!.el.classList.remove('wx-native-view--enter-anima');
		preBridge.webview!.el.classList.remove('wx-native-view--instage');
		currentBridge.webview!.el.parentNode?.removeChild(currentBridge.webview!.el);
  }

  async openPage(opts: OpenPageParams) {
    if (!this.webviewAnimaEnd) {
      return;
    }
    this.webviewAnimaEnd = false;
    const { pagePath, query, onSuccess } = opts;

    // 创建新的bridge
    const pageConfig = this.appConfig!.modules[pagePath];
    const bridge = await this.createBridge({
      pagePath,
      query,
      scene: this.app.scene,
      jscore: this.jscore,
      isRoot: false,
      appId: this.app.appId,
      pages: this.appConfig!.app.pages,
      configInfo: mergePageConfig(this.appConfig!.app, pageConfig),
    });
    // 获取前一个bridge，以及其webview
    const preBridge = this.bridgeList[this.bridgeList.length - 1];
    const preWebview = preBridge.webview!;
    this.bridgeList.push(bridge);
    this.bridges[bridge.id] = bridge;

    // 触发bridge的初始化逻辑，此时不需要在初始化 worker
    bridge.start(false);

    bridge.webview!.el.style.zIndex = `${this.bridgeList.length + 1}`;
    bridge.webview?.el.classList.add('wx-native-view--before-enter');
    await sleep(20);
    
    // 上一个页面推出
    preWebview.el.classList.remove('wx-native-view--instage');
		preWebview.el.classList.add('wx-native-view--linear-anima');
		preWebview.el.classList.add('wx-native-view--slide-out');
    preBridge.pageHide?.();
    // 新页面推入
		bridge.webview!.el.classList.add('wx-native-view--instage');
		bridge.webview!.el.classList.add('wx-native-view--enter-anima');
    await sleep(540);

    // 移除相关动画
    this.webviewAnimaEnd = true;
    preWebview.el.classList.remove('wx-native-view--linear-anima');
		bridge.webview!.el.classList.remove('wx-native-view--before-enter');
		bridge.webview!.el.classList.remove('wx-native-view--enter-anima');
		bridge.webview!.el.classList.add('wx-native-view--instage');
    onSuccess && onSuccess();
  }
}
