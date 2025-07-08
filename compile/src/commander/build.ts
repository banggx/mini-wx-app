import fse from 'fs-extra';
import { saveEnvInfo, getTargetPath } from '../env';
import { compileConfigJSON } from '../compile/json';
import { compileWXML } from '../compile/wxml';
import { compileJS } from '../compile/js';
import { compileWxss } from '../compile/wxss';
import { getModuleDeps } from '../toolkit/getModuleDeps';

export async function build(_: string) {
  // 编译环境信息
  saveEnvInfo();
  // 创建输出目录
  const targetPath = getTargetPath();
  if (fse.pathExistsSync(targetPath)) {
    fse.emptyDirSync(targetPath);
  }
  fse.ensureDirSync(targetPath);
  // 编译配置文件
  compileConfigJSON();
  // 编译wxml模版文件
  const moduleDeps = getModuleDeps();
  compileWXML(moduleDeps);
  // 编译js
  compileJS();
  // 编译wxss
  compileWxss(moduleDeps);
}