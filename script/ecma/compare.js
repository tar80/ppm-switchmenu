//!*script
/**
 * Open the switch-menu configuration file and append a preset to the table
 *
 * @version 1.0
 * @arg 0 preset menu name
 */

'use strict';

/* Initial */
// Read module
const st = PPx.CreateObject('ADODB.stream');
let module = function (filepath) {
  st.Open;
  st.Type = 2;
  st.Charset = 'UTF-8';
  st.LoadFromFile(filepath);
  const data = st.ReadText(-1);
  st.Close;

  return Function(' return ' + data)();
};

// Load module
const util = module(PPx.Extract('%*getcust(S_ppm#global:module)\\util.js'));
module = null;

const user_menu = ((args = PPx.Arguments()) => {
  const len = args.length;

  if (len < 1) {
    util.error('arg');
  }

  const path = args.item(0);
  const notExists = util.reply.call({name: 'exists'}, 'path', path);

  if (notExists !== '') {
    util.quitMsg(`Not exist\n${path}`);
  }

  const name = PPx.Extract(`%*name(C,${path})`);
  return {name: name, path: path};
})();

const default_menu_path = (() => {
  const lines = util.lines(user_menu.path);
  const reg = /^;\s*(PLUGIN)[\s=]+(.+)/;
  const result = lines.data[0].replace(reg, '$1=$2').split('=');

  if (result[0] !== 'PLUGIN' || result[1] === undefined) {
    util.quitMsg('Not identify the location of the default preset-menu');
  }

  return `${util.getc(`S_ppm#plugins:${result[1]}`)}\\switchmenu\\${user_menu.name}`;
})();

PPx.Execute(`*execute ,%*getcust(S_ppm#user:compare) "${user_menu.path}" "${default_menu_path}"`);
