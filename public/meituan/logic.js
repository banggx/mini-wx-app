/** 小程序编译后的js逻辑代码 */
modDefine('pages/home/index', function (require, module, exports) {
  Page({
    data: {
      text: '首页',
      number: 10,
    },
    onLoad: function () {
      console.log('首页 onLoad')
    },
    onShow: function () {
      console.log('首页 onShow')
    },
    onReady: function () {
      console.log('首页 onReady')
    },
    tapHandler() {
      this.setData({
        number: this.data.number + 10
      })
    }
  }, {
    path: 'pages/home/index'
  });
});

modDefine('app', function (require, module, exports) {
  App({
    onLaunch: function () {
      console.log('app onLaunch')
    },
    globalData: 'I am global data'
  });
});