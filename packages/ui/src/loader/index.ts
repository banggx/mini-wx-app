/**
 * ui线程资源加载器
 */
import { PageModule } from './pageModule';
import type { UIPageModuleInfo } from '@/types/common';

interface LoaderResourceOpts {
  appId: string;
  pagePath: string;
}

class Loader {
  staticModules: Record<string, PageModule> = {};

  // 加载小程序页面资源
  loadResources(opts: LoaderResourceOpts) {
    const { appId, pagePath } = opts;
    // 拼接模版资源loader路径
    const viewResourcePath = `http://localhost:1420/${appId}/view.js`;
    const styleResourcePath = `http://localhost:1420/${appId}/style.css`;
    
    return Promise.all([
      this.loadStyleFile(styleResourcePath),
      this.loadScriptFile(viewResourcePath)
    ]).then(() => {
      window.modRequire(pagePath);
    });
  }

  loadStyleFile(path: string) {
    return new Promise<void>((resolve) => {
      const link = document.createElement('link');
      link.rel = "stylesheet";
      link.href = path;
      link.onload = () => resolve();
    
      document.head.appendChild(link);
    })
  }

  loadScriptFile(path: string) {
    return new Promise<void>((resolve) => {
      const script = document.createElement('script');
      script.src = path;
      script.onload = () => resolve();
    
      document.body.appendChild(script);
    })
  }

  // 创建小程序页面 PageModule 模块
  createPageModule(moduleInfo: UIPageModuleInfo) {
    const pageModule = new PageModule(moduleInfo);
    const { path } = moduleInfo;
    this.staticModules[path] = pageModule;
  }

  // 设置渲染数据
  setInitialData(initialData: Record<string, any>) {
    for (const [path, data] of Object.entries(initialData)) {
      const pageModule = this.staticModules[path];
      if (!pageModule) {
        continue;
      }
      pageModule.setInitialData(data);
    }
  }

  // 获取指定路径下的module
  getModuleByPath(path: string) {
    return this.staticModules[path];
  }
}

export default new Loader(); 
