/**
 * 模块加载其，用于实现小程序逻辑代码的 require 加载逻辑
 * 
 * 这里小程序的js文件都会被包装成一个个 modDefine 调用，被注册成一个模块
 */
const defineCache: Record<string, any> = {};  // 缓存已定义的模块
const requireCache: Record<string, any> = {}; // 缓存已加载的模块
const loadingModules: Record<string, any> = {};

// 模块定义函数
export function modDefine(id: string, factory: any) {
  if (!defineCache[id]) {
    const modules = {
      id: id,
      dependencies: [],
      factory: factory
    };
    defineCache[id] = modules;
  }
}

// 模块加载函数
export function modRequire(id: string) {
  if (loadingModules[id]) {
    return {}; // 直接返回，尽管它可能还没有完全被加载
  }

  if (!requireCache[id]) {
    const mod = defineCache[id];
    if (!mod) throw new Error("No module defined with id " + id);

    const modules = {
      exports: {}
    };
    loadingModules[id] = true;
    const factoryArgs = [modRequire, modules.exports, modules];

    mod.factory.apply(null, factoryArgs);
    requireCache[id] = modules.exports;
    delete loadingModules[id];
  }

  return requireCache[id].exports;
}