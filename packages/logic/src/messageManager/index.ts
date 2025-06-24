/**
 * MessageManager class
 * 小程序逻辑引擎监听原生层消息通知
 * 
 * - message: Message 通信对象
 * - init(): void 消息监听注册
 */
import message, { type Messgae } from '@/message';
import loader from '@/loader';
import runtimeManager from '@/runtimeManager';
import callback from '@/callback';

class messageManager {
  message: Messgae;

  constructor() {
    this.message = message;
  }

  init() {
    this.message.receive('loadResource', this.loadResource.bind(this));
    this.message.receive('createApp', this.createApp.bind(this));
    this.message.receive('appShow', this.appShow.bind(this));
    this.message.receive('pageShow', this.pageShow.bind(this));
    this.message.receive('appHide', this.appHide.bind(this));
    this.message.receive('pageHide', this.pageHide.bind(this));
    this.message.receive('makePageInitialData', this.makePageInitialData.bind(this));
    this.message.receive('createInstance', this.createPage.bind(this));
    
    this.message.receive('moduleMounted', this.moduleMounted.bind(this));
    this.message.receive('pageScroll', this.pageScroll.bind(this));
    this.message.receive('pageUnload', this.pageUnload.bind(this));

    this.message.receive('triggerEvent', this.triggerEvent.bind(this));
    this.message.receive('triggerCallback', this.triggerCallback.bind(this));
  }

  private loadResource(data) {
    // native 层通知加载小程序逻辑代码
    const { appId, bridgeId, pages } = data;
    loader.loadResources({
      appId,
      pages,
    });
    this.message.send({
      type: 'logicResourceLoaded',
      body: {
        bridgeId,  // 带上bridgeId
      }
    });
  }
  
  private createApp(data) {
    const { bridgeId, scene, pagePath, query } = data;
    // 创建小程序 App 运行实例
    runtimeManager.createApp({
      scene,
      pagePath,
      query,
    });
    // 发送消息给原生层，告知app创建完毕
    this.message.send({
      type: 'appIsCreated',
      body: {
        bridgeId
      }
    })
  }

  private appShow() {
    // 触发小程序app 实例 show 事件
    runtimeManager.appShow();
  }

  private pageShow(data) {
    const { bridgeId } = data;
    runtimeManager.pageShow({ id: bridgeId });
  }

  private appHide() {
    runtimeManager.appHide();
  }

  private pageHide(data){
    const { bridgeId } = data;
    runtimeManager.pageHide({ id: bridgeId });
  }

  // 创建小程序页面实例
  private createPage(data) {
    runtimeManager.createPage(data);
  }

  // 获取小程序页面初始化data数据，用于初始渲染页面
  private makePageInitialData(data) {
    const { bridgeId, pagePath } = data;
    const initialData = loader.getInitialDataByPagePath(pagePath);
    this.message.send({
      type: 'initialDataReady',
      body: {
        bridgeId,
        initialData,
      }
    });
  }

  private moduleMounted(data) {
    // 页面挂载完毕通知事件，触发页面逻辑 ready 周期函数
    runtimeManager.pageReady(data);
  }

  private pageScroll(data) {
    // 触发页面滚动事件
    runtimeManager.pageScroll(data);
  }

  // 页面卸载
  private pageUnload(data) {
    const { bridgeId } = data;
    runtimeManager.pageUnload({ id: bridgeId });
  }

  // 页面出发js逻辑事件
  private triggerEvent(data) {
    runtimeManager.triggerEvent(data);
  }

  // native 层出发逻辑引擎回调
  // 这里主要是因为message消息通信没法传递函数，回调函数的触发通过一个id来触发
  private triggerCallback(data) {
    const { callbackId, args } = data;
    callback.triggerCallback(callbackId, args);
  }
}

export default new messageManager();