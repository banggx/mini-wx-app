modDefine('pages/home/index', function (require, module, exports) {
  Page({
    path: 'pages/home/index',
    usingComponents: {},
    render: (data) => {
      return `<div class="container">
        <h1>${data.text}</h1>
        <div class="num">${data.number}</div>
        <button onclick="triggerEvent('tapHandler')">increment</button>
      </div>`
    }
  })
});