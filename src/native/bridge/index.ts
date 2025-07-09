
import { uuid } from '@native/utils/util';
import { Webview } from '@native/webview';
import type { JSCore } from "@native/jscore";
import type { MiniApp } from "@native/miniApp";
import type { BridgeParams, IMessage } from "@native/types/common";

export class Bridge {
  /**
   * bridge id
   */
  id: string;

  /**
   * bridge 关联的 webview ui线程
   */
  webview: Webview | null = null;

  /**
   * bridge 关联的 jscore 逻辑线程
   */
  jscore: JSCore;

  /**
   * 小程序App实例
   */
  parent: MiniApp | null = null;

  opts: BridgeParams;

  /**
   * 记录bridge加载状态
   */
  status: number = 0;

  constructor(opts: BridgeParams) {
    this.id = `bridge_${uuid()}`;
    this.opts = opts;
    this.jscore = opts.jscore;
    this.jscore.addEventListener('message', this.jscoreMessageHandler.bind(this));
  }

  jscoreMessageHandler(message: IMessage) {
    console.log('接收到来自于逻辑线程的消息: ', message);
    const { type, body } = message;
    // 判断 bridgeId 是否对应
    if (body.bridgeId !== this.id) return;
    switch (type) {
      case 'logicResourceLoaded':
        this.status++;
        this.createApp(); // 逻辑线程和UI准备好之后就可以开始创建App了
        break;
      case 'appIsCreated':
        this.status++;
        this.notifyMakeInitialData(); // 通知逻辑线程初始化小程序渲染数据
        break;
      case 'initialDataReady':
        this.status++;
        this.setInitialData(body); // 把逻辑线程的初始化数据设置给UI线程，UI线程开始渲染页面
        break;
      case 'updateModule':
        this.updateModule(body); // 逻辑线程调用setData 更新数据，通知UI渲染
    }
  }

  uiMessageHandler(message: IMessage) {
    console.log('接收到来自UI线程的消息: ', message);
    const { type, body } = message;
    switch (type) {
      case 'uiResourceLoaded':
        this.status++;
        this.createApp();
        break;
      case 'moduleCreated':
        this.uiInstanceCreated(body);
        break;
      case 'moduleMounted':
        this.uiInstanceMounted(body);
        break;
      case 'pageScroll':
        this.pageScroll(body);
        break;
      case 'triggerEvent':
        this.triggerEvent(body);
        break;
    }
  }

  async init() {
    this.webview = await this.createWebview();
    this.webview.addEventListener('message', this.uiMessageHandler.bind(this));
  }

  /**
   * 创建当前bridge关联的webview渲染线程
   */
  createWebview() {
    return new Promise<Webview>((resolve) => {
      const webview = new Webview({
        configInfo: this.opts.configInfo,
        isRoot: this.opts.isRoot,
      });
      webview.parent = this;
      webview.init(() => {
        resolve(webview);
      });
      // 将webview添加到miniApp的webview容器节点中
      this.parent?.webviewContainer?.appendChild(webview.el);
    });
  }

  /**
   * bridge 通知逻辑线程和UI线程加载小程序资源
   */
  start(loadLogicSource = true) {
    // 通知UI线程加载资源
    this.webview?.postMessage({
      type: 'loadResource',
      body: {
        appId: this.opts.appId,
        pagePath: this.opts.pagePath,
      }
    });
    
    // 初始化触发一次小程序逻辑资源加载
    if (loadLogicSource) {
      this.jscore.postMessage({
        type: 'loadResource',
        body: {
          appId: this.opts.appId,
          bridgeId: this.id,
          pages: this.opts.pages,
        }
      });
    } else {
      this.status++;
    }
  }

  // 通知逻辑线程创建小程序App实例
  createApp() {
    // 只有logic和ui线程的loadResource 都完毕后，才能开始创建，此时status会变成2
    if (this.status !== 2) return;
    console.log('create app start.');

    this.jscore.postMessage({
      type: 'createApp',
      body: {
        bridgeId: this.id,
        scene: this.opts.scene,
        pagePath: this.opts.pagePath,
        query: this.opts.query,
      }
    });
  }

  notifyMakeInitialData() {
    this.jscore.postMessage({
      type: 'makePageInitialData',
      body: {
        bridgeId: this.id,
        pagePath: this.opts.pagePath,
      }
    });
  }

  setInitialData(data) {
    const { initialData } = data;
    this.webview?.postMessage({
      type: 'setInitialData',
      body: {
        initialData,
        bridgeId: this.id,
        pagePath: this.opts.pagePath,
      }
    });
  }

  updateModule(payload) {
    const { id, data } = payload;
    this.webview?.postMessage({
      type: 'updateModule',
      body: {
        id,
        data,
      }
    })
  }

  uiInstanceCreated(payload) {
    const { path, id } = payload;
    this.jscore.postMessage({
      type: 'createInstance',
      body: {
        id,
        path,
        bridgeId: this.id,
        query: this.opts.query,
      }
    });
  }

  uiInstanceMounted(payload) {
    const { id } = payload;
    this.jscore.postMessage({
      type: 'moduleMounted',
      body: { id }
    });
  }

  pageScroll(payload) {
    const { id, scrollTop } = payload;
    this.jscore.postMessage({
      type: 'pageScroll',
      body: {
        id,
        scrollTop,
      }
    });
  }

  appShow() {
    if (this.status < 2) {
      return;
    }
    // 向逻辑线程发送app显示的消息
    this.jscore.postMessage({
      type: 'appShow',
      body: {}
    });
  }

  appHide() {
    if (this.status < 2) {
      return;
    }
    // 向逻辑线程发送app显示的消息
    this.jscore.postMessage({
      type: 'appHide',
      body: {}
    });
  }

  pageShow() {
    if (this.status < 2) {
      return;
    }
    // 向逻辑线程发送app显示的消息
    this.jscore.postMessage({
      type: 'pageShow',
      body: {
        bridgeId: this.id,
      }
    });
  }

  pageHide() {
    if (this.status < 2) {
      return;
    }
    // 向逻辑线程发送app显示的消息
    this.jscore.postMessage({
      type: 'pageHide',
      body: {
        bridgeId: this.id,
      } 
    });
  }

  triggerEvent(payload) {
    const { id, methodName, paramsList } = payload;
    this.jscore.postMessage({
      type: 'triggerEvent',
      body: {
        id,
        methodName,
        paramsList
      }
    })
  }
}