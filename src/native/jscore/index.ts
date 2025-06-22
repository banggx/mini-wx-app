import mitt, { Emitter } from 'mitt';
import workerJs from './worker.js?raw'
import type { MiniApp } from "@native/miniApp";
import type { IMessage } from "@native/types/common";

/**
 * JSCore js逻辑执行的逻辑线程
 * 
 * parent: MiniApp 小程序实例
 * worker: Worker 逻辑线程
 * event: Emitter 小程序逻辑线程消息通知
 * 
 * + init(): void 初始化jscore
 * + postMessage(message: any): void 向逻辑线程发送消息
 * + addEventListener(type: string, listener: (event: any) => void): void 监听逻辑线程消息
 */
export class JSCore {
  /**
   * 父级小程序实例
   */
  parent: MiniApp | null = null;
  /**
   * jscore worker实例
   */
  worker: Worker | null = null;
  /**
   * jscore event emitter实例
   */
  event: Emitter<Record<string, any>>;
  constructor() {
    this.event = mitt();
  }

  async init() {
    const jsBlob = new Blob([workerJs], { type: 'text/javascript' });
    const urlObj = URL.createObjectURL(jsBlob);
    this.worker = new Worker(urlObj);
    this.worker.addEventListener('message', (e) => {
      const msg = e.data;
      this.event.emit('message', msg)
    });
  }

  /**
   * 向逻辑线程发送消息
   */
  postMessage(msg: IMessage) {
    this.worker?.postMessage(msg);
  }

  /**
   * 监听逻辑线程消息
   */
  addEventListener<T = any>(type: string, listener: (event: T) => void) {
    this.event.on(type, listener);
  }
}
