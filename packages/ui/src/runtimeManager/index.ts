/**
 * RuntimeManager class
 * 渲染线程运行管理器
 * 
 * page: Vue页面实例
 * pageId: 页面实例ID
 * startRender(): void; 渲染
 * updateModule(opts): void; 更新模块数据
 */
import { set } from 'lodash';
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
    const vueOptions = this.makeVueOptions({ path: pagePath, bridgeId });
    this.pageId = bridgeId;
    // 获取挂载的根节点，这里后面会使用Vue来渲染我们的页面，这里先直接生成HTML内容然后挂上去
    const root = document.querySelector('#root') as HTMLElement;
    this.page = new (window as any).Vue(vueOptions).$mount();
    root.appendChild(this.page.$el);
    
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
    }, false);
  }

  makeVueOptions(opts) {
    const { path, bridgeId } = opts;
    const pageModule = loader.getModuleByPath(path);
    const self = this;
    const { scopedId } = pageModule.moduleInfo;
    console.log('scopedId: ', scopedId);

    return {
      _scopeId: scopedId,
      data() {
        return {
          ...pageModule.data
        };
      },
      beforeCreate() {
        // 注入bridge 信息
        (this as any)._bridgeInfo = {
          id: bridgeId,
        };
      },
      created() {
        self.uiInstance[bridgeId] = this;
        message.send({
          type: 'moduleCreated',
          body: {
            path,
            id: bridgeId,
          }
        });
      },
      mounted() {
        message.send({
          type: 'moduleMounted',
          body: {
            id: bridgeId
          }
        });
      },
      render: pageModule.moduleInfo.render,
    }
  }

  updateModule(opts) {
    const { id, data } = opts;
    const viewModule = this.uiInstance[id];
    for (const key in data) {
      set(viewModule, key, data[key]);
    }
  }
}

export default new RuntimeManager();