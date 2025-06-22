
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

  constructor(opts: BridgeParams) {
    this.id = `bridge_${uuid()}`;
    this.opts = opts;
    this.jscore = opts.jscore;
    this.jscore.addEventListener('message', this.jscoreMessageHandler.bind(this));
  }

  jscoreMessageHandler(message: IMessage) {
    console.log('接收到来自于逻辑线程的消息: ', message);
  }

  uiMessageHandler(message: IMessage) {
    console.log('接收到来自UI线程的消息: ', message);
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
}