import { program } from 'commander';
import { build } from './commander/build';

const version = require('../package.json').version;

program.version(version)
  .usage('[command] [options]');

program.command('build [path]')
  .description('编译小程序')
  .action(build);

program.parse(process.argv);