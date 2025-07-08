import fse from 'fs-extra';
import { getWorkPath } from '../../env';
import { toVueTemplate } from './toVueTemplate';
import { writeFile } from './writeFile';
import * as vueCompiler from 'vue-template-compiler';
import { compileTemplate } from '@vue/component-compiler-utils';

export function compileWXML(moduleDep: Record<string, any>) {
  const list: any[] = [];
  for (const path in moduleDep) {
    const code = compile(path, moduleDep[path].moduleId);
    list.push({
      path,
      code
    });
  }
  writeFile(list);
}

function compile(path: string, moduleId) {
  const fullPath = `${getWorkPath()}/${path}.wxml`;
  const wxmlContent = fse.readFileSync(fullPath, 'utf-8');
  // 先把 wxml 文件转化为 vue 模版文件内容
  const vueTemplate = toVueTemplate(wxmlContent);
  const compileResult = compileTemplate({
    source: vueTemplate,
    compiler: vueCompiler as any,
    filename: ''
  });
  return `
    modDefine('${path}', function() {
      ${compileResult.code}
      Page({
        path: '${path}',
        render: render,
        usingComponents: {},
        scopedId: 'data-v-${moduleId}'
      });
    })
  `;
}