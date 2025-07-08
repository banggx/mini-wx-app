import fse from 'fs-extra';

interface IPathInfo {
  workPath?: string;
  targetPath?: string;
}

interface IConfigInfo {
  projectInfo?: Record<string, any>;
  appInfo?: Record<string, any>;
  moduleInfo?: Record<string, Record<string, any>>;
}

const pathInfo: IPathInfo = {};
const configInfo: IConfigInfo = {};

export function saveEnvInfo() {
  savePathInfo();
  saveProjectConfig();
  saveAppConfig();
  saveModuleConfig();
}

function savePathInfo() {
  // 小程序编译目录
  pathInfo.workPath = process.cwd();
  // 小程序输出目录
  pathInfo.targetPath = `${pathInfo.workPath}/dist`;
}

function saveProjectConfig() {
  // 小程序项目配置文件
  const filePath = `${pathInfo.workPath}/project.config.json`;
  const projectInfo = fse.readJsonSync(filePath);
  configInfo.projectInfo = projectInfo;
}

function saveAppConfig() {
  // 小程序 app.json 配置文件
  const filePath = `${pathInfo.workPath}/app.json`;
  const appInfo = fse.readJsonSync(filePath);
  configInfo.appInfo = appInfo;
}

function saveModuleConfig() {
  // 处理每个页面的页面配置: pages/xx/xx.json
  const { pages } = configInfo.appInfo!;
  configInfo.moduleInfo = {};
  pages.forEach(pagePath => {
    const pageConfigFullPath = `${pathInfo.workPath}/${pagePath}.json`;
    const pageConfig = fse.readJsonSync(pageConfigFullPath);
    configInfo.moduleInfo![pagePath] = pageConfig;
  });
}

// 获取输出路径
export function getTargetPath() {
  return pathInfo.targetPath!;
}

// 获取项目编译路径
export function getWorkPath() {
  return pathInfo.workPath!;
}

// 获取app配置
export function getAppConfigInfo() {
  return configInfo.appInfo!;
}

// 获取页面模块配置
export function getModuleConfigInfo() {
  return configInfo.moduleInfo;
}

// 获取小程序AppId
export function getAppId() {
  return configInfo.projectInfo!.appid;
}