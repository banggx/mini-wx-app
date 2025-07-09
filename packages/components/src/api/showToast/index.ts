import './style.less';

interface ToastInfo {
  dom: HTMLElement | null;
  timer: number | null;
}
const toastInfo: ToastInfo = {
  dom: null,
  timer: null,
}

export function showToast(opts) {
  const title = opts.title;
  const duration = opts.duration || 1500;
  const icon = opts.icon || 'success';
  
  if (!title) return;
  
  // 移除旧的toast
  if (toastInfo.dom) {
    document.body.removeChild(toastInfo.dom);
    toastInfo.dom = null;
    clearTimeout(toastInfo.timer!);
  }

  toastInfo.dom = document.createElement('div');
  toastInfo.dom.classList.add('ui-toast', `ui-toast--${icon}`);
  toastInfo.dom.innerHTML = `<p>${title}</p>`;
  document.body.appendChild(toastInfo.dom);
  document.body.appendChild(toastInfo.dom);
  toastInfo.timer = setTimeout(() => {
    document.body.removeChild(toastInfo.dom!);
  }, duration) as unknown as number;
}