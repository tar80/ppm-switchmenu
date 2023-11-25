/* @file Compare preset menu differences */

import fso from '@ppmdev/modules/filesystem.ts';
import {isEmptyStr, isError} from '@ppmdev/modules/guard.ts';
import {readLines} from '@ppmdev/modules/io.ts';
import {useLanguage} from '@ppmdev/modules/data.ts';
import {pathSelf} from '@ppmdev/modules/path.ts';
import {ppm} from '@ppmdev/modules/ppm.ts';
import {expandSource} from '@ppmdev/modules/source.ts';
import {langCompare} from './mod/language.ts';

const {scriptName} = pathSelf();
const lang = langCompare[useLanguage()];
const [errorlevel, userMenuPath] = ppm.getinput({
  message: `${ppm.global('ppmcache')}\\switchmenu\\`,
  title: `${scriptName} ${lang.title}`,
  select: 'l',
  autoselect: true,
  k: '*completelist'
});

if (errorlevel !== 0 || isEmptyStr(userMenuPath)) {
  PPx.Quit(1);
} else if (!fso.FileExists(userMenuPath)) {
  ppm.echo(scriptName, `${userMenuPath} ${lang.notExists}`);
  PPx.Quit(1);
}

const [error, data] = readLines({path: userMenuPath});

if (isError(error, data)) {
  ppm.echo(scriptName, data);
  PPx.Quit(-1);
}

const rgx = /^;\s*(PLUGIN)[\s=]+(.+)/;
const [key, pluginName] = data.lines[0].replace(rgx, '$1=$2').split('=');

if (key !== 'PLUGIN' || pluginName == null) {
  ppm.echo(scriptName, lang.couldNotGet);
  PPx.Quit(-1);
}

const repo = expandSource(pluginName);

if (!repo) {
  ppm.echo(scriptName, lang.failedToGet);
  PPx.Quit(-1);
}

const menuName = userMenuPath.replace(/.*\\(.+\.cfg)$/i, '$1');
const defMenuPath = `${repo.path}\\switchmenu\\${menuName}`;
const diffTool = PPx.Extract('%*getcust(S_ppm#user:compare)');
const paths = ~diffTool.indexOf(',')
  ? `"""${userMenuPath}"" ""${defMenuPath}"""`
  : `"${userMenuPath}" "${defMenuPath}"`;

ppm.execute('', `${diffTool} ${paths}`);
