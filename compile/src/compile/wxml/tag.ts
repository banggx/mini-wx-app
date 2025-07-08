import { getCssExpressionValue, getFunctionExpressionInfo } from '../../utils';

// 小程序特定的组件
const tagWhiteList = ['view', 'text', 'image', 'swiper-item', 'swiper', 'video'];

export function makeTagStart(opts) {
  const { tag, attrs, startTagStr } = opts;
  
  if (!tagWhiteList.includes(tag)) {
    throw new Error(`Tag "${tag}" is not allowed in miniprogram`);
  }

  const isCloseTag = /\/>/.test(startTagStr);
  // 将tag转化为特定的组件名称，后续针对性的开发组件
  const transTag = `ui-${tag}`;
  const propsStr = getPropsStr(attrs);

  // 拼接字符串
  let transStr = `<${transTag}`;
  if (propsStr.length) {
    transStr += ` ${propsStr}`;
  }

  // 自闭合标签直接闭合返回
  return `${transStr}>${isCloseTag ? `</${transTag}>` : ''}`;
}

export function makeTagEnd(tag) {
  return `</ui-${tag}>`;
}

// [{name: "class", value: "container"}]
function getPropsStr(attrs) {
  const attrsList: any[] = [];
  attrs.forEach((attrInfo) => {
    const { name, value } = attrInfo;
    
    // 如果属性名时 bind 开头，如 bindtap 表示事件绑定
    // 这里转化为特定的属性，后续有组件来触发事件调用
    if (/^bind/.test(name)) {
      attrsList.push({
        name: `v-bind:${name}`,
        value: getFunctionExpressionInfo(value)
      });
      return;
    }

    // wx:if 转化为 v-if  => wx:if="{{status}}" => v-if="status"
    if (name === 'wx:if') {
      attrsList.push({
        name: 'v-if',
        value: getExpression(value)
      });
      return;
    }

    // wx:for 转化为 v-for => wx:for="{{list}}" => v-for="(item, index) in list"
    if (name === 'wx:for') {
      attrsList.push({
        name: 'v-for',
        value: getForExpression(value)
      });
      return;
    }

    // 转化 wx:key => wx:key="id" => v-bind:key="item.id"
    if (name === 'wx:key') {
      attrsList.push({
        name: 'v-bind:key',
        value: `item.${value}`
      });
      return;
    }

    // 转化style样式
    if (name === 'style') {
      attrsList.push({
        name: 'v-bind:style',
        value: getCssRules(value),
      });
      return;
    }

    // 处理动态字符串属性值
    if (/^{{.*}}$/.test(value)) {
      attrsList.push({
        name: `v-bind:${name}`,
        value: getExpression(value),
      });
      return;
    }

    attrsList.push({
      name: name,
      value: value,
    });
  });

  return linkAttrs(attrsList);
}

function linkAttrs(attrsList) {
  const result: string[] = [];
  attrsList.forEach(attr => {
    const { name, value } = attr;
    if (!value) {
      result.push(name);
      return;
    }

    result.push(`${name}="${value}"`);
  });

  return result.join(' ');
}

function getExpression(wxExpression) {
  const re = /\{\{(.+?)\}\}/;
  const matchResult = wxExpression.match(re);
  const result = matchResult ? matchResult[1].trim() : '';
  return result;
}

function getForExpression(wxExpression) {
  const listVariableName = getExpression(wxExpression);
  return `(item, index) in ${listVariableName}`;
}

// 将css样式上的动态字符串转化
function getCssRules(cssRule) {
  const cssCode = cssRule.trim();
  const cssRules = cssCode.split(';');
  const list: string[] = [];
  
  cssRules.forEach(rule => {
    if (!rule) {
      return;
    }

    const [name, value] = rule.split(':');
    const attr = name.trim();
    const ruleValue = getCssExpressionValue(value.trim());

    list.push(`'${attr}':${ruleValue}`)
  });

  return `{${list.join(',')}}`;
}