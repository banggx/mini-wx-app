import { getAppConfigInfo, getWorkPath } from '../../env';
import { buildByPagePath, buildByFullPath } from './buildByPagePath';
import { writeFile } from './writeFile';

export function compileJS() {
  const { pages } = getAppConfigInfo();  
  const workPath = getWorkPath();
  // app.js 文件
  const appJsPath = `${workPath}/app.js`;
  const compileResult = [];

  // 编译页面js文件
  pages.forEach(pagePath => {
    buildByPagePath(pagePath, compileResult);
  });

  // 编译app.js
  buildByFullPath(appJsPath, compileResult);
  writeFile(compileResult);
}