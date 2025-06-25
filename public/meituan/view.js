modDefine('pages/home/index', function (require, module, exports) {
  Page({
    path: 'pages/home/index',
    usingComponents: {},
    render: () => {
      return `<div class="conatiner">
        <h1>${this.data.text}</h1>
        <div class="num">${this.data.number}</div>
      </div>`
    }
  })
});