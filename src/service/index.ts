import { apps } from '@/constants/app';

interface MiniAppInfo {
	appName: string;
	logo: string;
}

export function getMiniAppInfo(appId: string) {
  return new Promise<MiniAppInfo>((resolve) => {
    const appInfo = apps.find(item => item.appId === appId);
    resolve({
      appName: appInfo?.name!,
      logo: appInfo?.logo!
    });
  });
}