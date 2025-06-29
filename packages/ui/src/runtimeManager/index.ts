/**
 * RuntimeManager class
 * 渲染线程运行管理器
 * 
 * page: Vue页面实例
 * pageId: 页面实例ID
 * firstRender(): void; 首次渲染
 */
import loader from '@/loader';
import message from '@/message';
import type { UIRenderOpts } from '@/types/common';

class RuntimeManager {
  page: any = null;
  // 对应 bridgeId; 用于后面和bridge层通信
  pageId: string = '';
  /**
   * ui线程的实例映射: 这里我们先使用页面的渲染函数 render 来渲染。后面这里使用 Vue 来渲染页面后，这里会变成Vue实例
   */
  uiInstance: Record<string, any> = {};

  startRender(opts: UIRenderOpts) {
    const { pagePath, bridgeId } = opts;
    this.pageId = bridgeId;
    // 获取挂载的根节点，这里后面会使用Vue来渲染我们的页面，这里先直接生成HTML内容然后挂上去
    const root = document.querySelector('#root') as HTMLElement;
    
    // 加载页面模块信息
    const pageModule = loader.getModuleByPath(pagePath);
    
    message.send({
      type: 'moduleCreated',
      body: {
        path: pagePath,
        id: this.pageId,
      }
    });
    // 直接先调用render执行，将data传入渲染出页面节点
    const pageRender = pageModule.moduleInfo.render;
    const html = pageRender(pageModule.data);
    root.innerHTML = html;
    message.send({
      type: 'moduleMounted',
      body: {
        id: this.pageId,
      }
    });
    // 临时方案
    this.uiInstance[this.pageId] = {
      root,
      render: pageRender,
    };
    // 模拟发送事件
    (window as any).triggerEvent = (methodName: string, ...args: any[]) => {
      message.send({
        type: 'triggerEvent',
        body: {
          id: this.pageId,
          methodName,
          paramsList: args,
        }
      });
    };
    const self = this;
    // 监听页面滚动触发给logic层
    root.addEventListener('scroll', function () {
      message.send({
        type: 'pageScroll',
        body: {
          id: self.pageId,
          scrollTop: root.scrollTop,
        }
      });
    });
  }

  updateModule(opts) {
    const { id, data } = opts;
    const { root, render } = this.uiInstance[id];
    const html = render(data);
    root.innerHTML = html;
  }
}

export default new RuntimeManager();