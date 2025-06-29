import { uuid } from '@native/utils/util';
import mitt, { Emitter } from 'mitt';
import { webviewTpl } from './tpl';
import type { IMessage, WebviewParams } from "@native/types/common";
import type { Bridge } from "@native/bridge";

export class Webview {
  /**
   * webview id
   */
  id: string;
  /**
   * webview 初始化参数
   */
  opts: WebviewParams;
  /**
   * webview el 元素根
   */
  el: HTMLElement;
  /**
   * 当前webview 的父容器 Bridge
   */
  parent: Bridge | null = null;
  /**
   * 当前webview 对应的iframe
   */
  iframe: HTMLIFrameElement;
  /**
   * ui 渲染线程消息事件
   */
  event: Emitter<Record<string, any>>;

  constructor(opts: WebviewParams) {
    this.opts = opts;
    this.id = `webview_${uuid()}`;
    this.el = document.createElement('div');
    this.el.classList.add('wx-native-view');
    this.el.innerHTML = webviewTpl;
    this.setInitialStyle();
    this.iframe = this.el.querySelector('.wx-native-webview__window') as HTMLIFrameElement;
    this.iframe.name = this.id;
    this.event = mitt();
    this.bindBackEvent();
  }

  /**
   * 初始化webview
   */
  async init(callback: () => void) {
    // 等待frame 加载完成
    await this.frameLoaded();
    const iframeWindow = window.frames[this.iframe.name];
    iframeWindow.JSBridge.onReceiveUIMessage = (message: IMessage) => {
      this.event.emit('message', message);
    }
    callback && callback();
  }

  frameLoaded() {
    return new Promise<void>((resolve) => {
      this.iframe.onload = () => {
        resolve();
      }
    });
  }

  bindBackEvent() {
    const backBtn = this.el.querySelector('.wx-native-webview__navigation-left-btn') as HTMLElement;
    backBtn.onclick = () => {
      console.log('点击返回按钮')
    };
  }

  postMessage(message: IMessage) {
    const iframeWindow = (window.frames as any)[this.iframe.name];
    console.log(iframeWindow)
    if (iframeWindow) {
      iframeWindow.JSBridge.onReceiveNativeMessage(message);
    }
  }

  /**
   * 监听渲染线程消息
   */
  addEventListener<T = any>(type: string, listener: (event: T) => void) {
    this.event.on(type, listener);
  }

  setInitialStyle() {
    const config = this.opts.configInfo;
    const webview = this.el.querySelector('.wx-native-webview') as HTMLElement;
    const pageName = this.el.querySelector('.wx-native-webview__navigation-title') as HTMLElement;
    const navigationBar = this.el.querySelector('.wx-native-webview__navigation') as HTMLElement;
    const leftBtn = this.el.querySelector('.wx-native-webview__navigation-left-btn') as HTMLElement;
    const root = this.el.querySelector('.wx-native-webview__root') as HTMLElement;

    // 根页面的时候不显示左侧返回按钮
    if (this.opts.isRoot) {
      leftBtn.style.display = 'none';
    } else {
      leftBtn.style.display = 'block';
    }

    if (config.navigationBarTextStyle === 'white') {
			navigationBar.classList.add('wx-native-webview__navigation--white');
		} else {
			navigationBar.classList.add('wx-native-webview__navigation--black');
		}

    if (config.navigationStyle === 'custom') {
			webview.classList.add('wx-native-webview--custom-nav');
		}

    // 设置页面背景
    root.style.backgroundColor = config.backgroundColor;
    // 设置导航栏背景
		navigationBar.style.backgroundColor = config.navigationBarBackgroundColor;
    // 设置标题
		pageName.innerText = config.navigationBarTitleText;
  }
}