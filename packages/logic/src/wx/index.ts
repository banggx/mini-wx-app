/**
 * 全局 wx 实例
 */
import message from '@/message';
import callback from '@/callback';
import navigation from '@/navigation';

class Weixin {
  navigateTo(opts) {
    const { url, success } = opts;
    const successId = callback.saveCallback(success);
    message.send({
      type: 'triggerWXApi',
      body: {
        apiName: 'navigateTo',
        params: {
          url,
          success: successId
        }
      }
    });
  }

  navigateBack(opts) {
    message.send({
      type: 'triggerWXApi',
      body: {
        apiName: 'navigateBack',
        params: {},
      },
    });
  }

  navigateToMiniProgram(opts) {
    const { appId, path } = opts;
    message.send({
      type: 'triggerWXApi',
      body: {
        apiName: 'navigateToMiniProgram',
        params: {
          appId,
          path,
        },
      },
    });
  }

  showToast(opts) {
    const currentPageInfo = navigation.getCurrentPageInfo();
    message.send({
      type: 'showToast',
      body: {
        bridgeId: currentPageInfo.bridgeId,
        params: opts,
      }
    })
  }
}

export default new Weixin();
