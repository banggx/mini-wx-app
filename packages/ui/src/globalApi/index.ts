import loader from '@/loader';
import { modDefine, modRequire } from 'shared';
import type { UIPageModuleInfo } from '@/types/common';

class GlobalApi {
  init() {
    // 创建一个JSBridge对象，里面会添加通信相关的API
    (window as any).JSBridge = {};
    window.modDefine = modDefine;
    window.modRequire = modRequire;
    window.Page = (moduleInfo: UIPageModuleInfo) => {
      loader.createPageModule(moduleInfo);
    }
  }
}

export default new GlobalApi();