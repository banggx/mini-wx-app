/**
 * messageManager class
 * ui层消息处理
 * 
 * - message: Message 通信对象
 * - init(): void 消息监听注册
 */
import message, { type Messgae } from '@/message';
import loader from '@/loader';
import runtimeManager from '@/runtimeManager';

class messageManager {
  message: Messgae;

  constructor() {
    (window as any).message = message;
    this.message = message;
  }

  init() {
    this.message.receive('loadResource', this.loadResource.bind(this));
    this.message.receive('setInitialData', this.setInitialData.bind(this));
    this.message.receive('updateModule', this.updateModule.bind(this));
  }

  private loadResource(data) {
    const { appId, pagePath } = data;
    loader.loadResources({ appId, pagePath }).then(() => {
      this.message.send({
        type: 'uiResourceLoaded',
        body: {}
      })
    });
  }

  private setInitialData(data) {
    const { bridgeId, pagePath, initialData } = data;
    // 初始话数据有了之后就可以开始渲染页面了
    loader.setInitialData(initialData)
    runtimeManager.startRender({
      pagePath,
      bridgeId
    });
  }

  updateModule(data) {
    runtimeManager.updateModule(data);
  }
}

export default new messageManager(); 