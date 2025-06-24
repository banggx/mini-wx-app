import { modDefine, modRequire } from './amd';
import loader from '@/loader';
import type { AppModuleInfo, PageModuleInfo, PageModuleCompileInfo } from '@/types/common';

class GlobalApi {
  init() {
    globalThis.App = (moduleInfo: AppModuleInfo) => {
      loader.createAppModule(moduleInfo);
    }

    globalThis.Page = (moduleInfo: PageModuleInfo, compileInfo: PageModuleCompileInfo) => {
      loader.createPageModule(moduleInfo, compileInfo);
    }

    globalThis.modDefine = modDefine;
    globalThis.modRequire = modRequire; 
  }
}

export default new GlobalApi(); 