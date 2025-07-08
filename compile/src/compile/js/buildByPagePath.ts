import fse from 'fs-extra';
import path from 'path';
import * as babel from '@babel/core';
import { walkAst } from './walkAst';
import { getWorkPath } from '../../env';

export function buildByPagePath(pagePath, compileResult) {
  const workPath = getWorkPath();
  const pageFullPath = `${workPath}/${pagePath}.js`;
  
  buildByFullPath(pageFullPath, compileResult);
}

export function buildByFullPath(filePath: string, compileResult: any[]) {
  if (hasCompileInfo(filePath, compileResult)) {
    return;
  }

  const jsCode = fse.readFileSync(filePath, 'utf-8');
  const moduleId = getModuleId(filePath);
  const compileInfo = {
    filePath,
    moduleId,
    code: ''
  };
  
  // 编译为 ast: 目的主要是为 Page 调用注入第二个个模块相关的参数，以及深度的递归编译引用的文件
  const ast = babel.parseSync(jsCode);
  walkAst(ast, {
    CallExpression: (node) => {
      if (node.callee.name === 'Page') {
        node.arguments.push({
          type: 'ObjectExpression',
          properties: [ 
            {
              type: 'ObjectProperty',
              method: false,
              key: {
                type: 'Identifier',
                name: 'path',
              },
              computed: false,
              shorthand: false,
              value: {
                type: 'StringLiteral',
                extra: {
                  rawValue: `'${moduleId}'`,
                  raw: `'${moduleId}'`,
                },
                value: `'${moduleId}'`
              }
            }
          ]
        });
      }
      if (node.callee.name === 'require') {
        const requirePath = node.arguments[0].value;
        const requireFullPath = path.resolve(filePath, '..', requirePath);
        const moduleId = getModuleId(requireFullPath);
        
        node.arguments[0].value = `'${moduleId}'`;
        node.arguments[0].extra.rawValue = `'${moduleId}'`;
        node.arguments[0].extra.raw = `'${moduleId}'`;
        
        // 深度递归编译引用的文件
        buildByFullPath(requireFullPath, compileResult);
      }
    }
  });
  
  const {code: codeTrans } = babel.transformFromAstSync(ast, null, {});
  compileInfo.code = codeTrans;
  compileResult.push(compileInfo);
}

// 判断是否编译过了
function hasCompileInfo(filePath, compileResult) {
  for (let idx = 0; idx < compileResult.length; idx++) {
    if (compileResult[idx].filePath === filePath) {
      return true;
    }
  }
  return false;
}

function getModuleId(filePath) {
  const workPath = getWorkPath();
  const after = filePath.split(`${workPath}/`)[1];
  return after.replace('.js', '');
}