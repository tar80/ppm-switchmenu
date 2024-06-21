/* @file Add a new menu item
 * @arg 0 {number} - If non-zero, edit the specified SwitchMenu configuration file
 */

import fso, {copyFile} from '@ppmdev/modules/filesystem.ts';
import {isEmptyStr} from '@ppmdev/modules/guard.ts';
import {readLines, writeLines} from '@ppmdev/modules/io.ts';
import {useLanguage} from '@ppmdev/modules/data.ts';
import {pathSelf} from '@ppmdev/modules/path.ts';
import {ppm} from '@ppmdev/modules/ppm.ts';
import {langAdd} from './mod/language.ts';
import {safeArgs} from '@ppmdev/modules/argument.ts';
import debug from '@ppmdev/modules/debug.ts';

const {scriptName, parentDir} = pathSelf();
const lang = langAdd[useLanguage()];
const [errorlevel, itemName] = ppm.getinput({title: `${scriptName} ${lang.title}`, k: '*completelist -module:off'});

if (errorlevel !== 0 || isEmptyStr(itemName)) {
  PPx.Quit(1);
}

const ppmcache = ppm.global('ppmcache');
const userMenuPath = `${ppmcache}\\switchmenu\\${itemName}.cfg`;
const editor = ppm.getcust('S_ppm#user:editor')[1];

if (!fso.FileExists(userMenuPath)) {
  const sourcePath = `${parentDir}\\..\\template\\newmenu.cfg`;
  copyFile(sourcePath, userMenuPath);
  PPx.Execute(`${editor} ${userMenuPath}`);
  PPx.Quit(1);
}

const main = (): void => {
  const path = `${ppmcache}\\config\\ppm-switchmenu.cfg`;
  const [error, data] = readLines({path});

  if (error) {
    ppm.echo(scriptName, data);
    PPx.Quit(-1);
  }

  const menuItems = getMenuItems(data.lines);

  if (menuItems.length === 0) {
    ppm.echo(scriptName, `${itemName} ${lang.hasMenu}`);
    PPx.Quit(1);
  }

  const [lineNumber, contents] = createCmdline(menuItems);
  data.lines.splice(lineNumber, 0, ...contents);
  writeLines({path, data: data.lines, overwrite: true});

  const [isEdit] = safeArgs(false);

  if (isEdit) {
    if (ppm.question(scriptName, lang.edit)) {
      PPx.Execute(`${editor} "${path}"`);
      const ok = ppm.question(scriptName, lang.register);
      ok && PPx.Execute('*script %sgu"ppm"\\dist\\pluginRegister.js,ppm-switchmenu,set,user');
    }
  }
};

type MenuItem = {lnum: number; prefix: string};
const getMenuItems = (data: string[]): typeof items => {
  const rgx = /^&?(\d+):.+/;
  const items: MenuItem[] = [];

  for (let i = 0, k = data.length; i < k; i++) {
    if (data[i].indexOf('-M_ppmSwitch') === 0) {
      for (; i < k; i++) {
        const line = data[i];

        if (line.indexOf('}') === 0) {
          return items;
        }

        if (~line.toLowerCase().indexOf(itemName.toLowerCase())) {
          return [];
        }

        if (rgx.test(line)) {
          items.push({lnum: i, prefix: line.replace(rgx, '$1')});
        }
      }
    }
  }

  return items;
};

const createCmdline = (items: MenuItem[]): [number, string[]] => {
  debug.log(JSON.stringify(items));
  const prefix = Number(items[items.length - 2].prefix);
  const lines = [
    `&${prefix + 1}:${itemName}\t= *setcust @%sgu'ppmcache'\\switchmenu\\${itemName}.cfg`,
    `\t[/setcursor]=`,
    `\t[/setcheck]=${prefix}`,
    '\t[/restart]'
  ];
  const lnum = items[items.length - 1].lnum;

  return [lnum, lines];
};

main();
