import fse from 'fs-extra';
import { getTargetPath, getAppConfigInfo, getModuleConfigInfo } from '../../env';

export function compileConfigJSON() {
  const distPath = getTargetPath();
  const compileResultInfo = {
    app: getAppConfigInfo(),
    modules: getModuleConfigInfo(),
  };

  fse.writeFileSync(
    `${distPath}/config.json`,
    JSON.stringify(compileResultInfo, null, 2),
  );
}