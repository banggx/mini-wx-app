import { modDefine, modRequire } from 'shared';
import loader from '@/loader';
import wx from '@/wx';
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
    globalThis.wx = wx;
  }
}

export default new GlobalApi(); 