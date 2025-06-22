import { sleep } from '@native/utils/util';
import type { MiniApp } from '@native/miniApp';

export class Application {
  /* 应用的根容器 */
  el: HTMLElement;
  /* 应用页面挂载节点 */
  window: HTMLElement | null = null;
  /* 存储应用的视图列表 */
  views: MiniApp[] = [];
  /* 页面加载状态: 用于避免在一个小程序加载阶段再加载别的 */
  done: boolean = true;
  
  constructor(el: HTMLElement) {
    this.el = el;
    this.init();
  }
  
  init() {
    // 创建应用页面的挂载节点，并添加到根容器中
    this.window = document.createElement('div');
    this.window.classList.add('wx-native-window');
    this.el.appendChild(this.window);
  }
  
  /**
   * 拉起小程序页面
   */
  async presentView(view: MiniApp) {
    if (!this.done) return;
    this.done = false;

    view.parent = this;
    view.el.style.zIndex = `${this.views.length + 1}`;
    // 初始化小程序为止: 将小程序为止调整到屏幕-1屏，再添加划入动画
    view.el.classList.add('wx-native-view--before-present');
    view.el.classList.add('wx-native-view--enter-anima');
    this.window?.appendChild(view.el);
    this.views.push(view);
    view.viewDidLoad();
    await sleep(20);
    // 小程序入场: 调整小程序为止
    view.el.classList.add('wx-native-view--instage');
    await sleep(540);
    this.done = true;
    // 移除初始化样式类
    view.el.classList.remove('wx-native-view--before-present');
    view.el.classList.remove('wx-native-view--enter-anima');
  }
  
  /**
   * 退出小程序
   */
  async dismissView(opts: any = {}) {
    if (!this.done) return;
    this.done = false;
    
    // 推出小程序主要是将当前小程序页面推出
    // 将前一个小程序页面显示出来
    
    // 这里推出小程序可能是直接从页面上把节点直接卸载掉；
    // 或者是直接添加特定的样式，将小程序移入负一屏，这样在下次拉起的时候可以直接复用;
    
    const preView = this.views[this.views.length - 2];
    const currentView = this.views[this.views.length - 1];
    const { destroy = true } = opts;
    
    // 将当前的小程序推出, 添加推出动画
    currentView.el.classList.add('wx-native-view--enter-anima');
    preView?.el.classList.add('wx-native-view--enter-anima');
    preView?.el.classList.add('wx-native-view--before-presenting');
    await sleep(0);
    // 添加推出样式类，及最终推出实际是将小程序页面先移到-1屏
    currentView.el.classList.add('wx-native-view--before-present');
    currentView.el.classList.remove('wx-native-view--instage');
    preView?.el.classList.remove('wx-native-view--presenting');
    await sleep(540);
    this.done = true;
    // 卸载: 从页面上移除掉页面节点
    destroy && this.el!.removeChild(currentView.el);
    this.views.pop();
    preView?.el.classList.remove('wx-native-view--enter-anima');
    preView?.el.classList.remove('wx-native-view--before-presenting');
  }
}