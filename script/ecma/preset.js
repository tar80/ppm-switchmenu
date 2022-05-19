//!*script
/**
 * Open the switch-menu configuration file and append a preset to the table
 *
 * @version 1.0
 * @arg 0 Table name
 * @arg 1 If nonzero dry run
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
const util = module(PPx.Extract('%*getcust(S_ppm#global:module)\\util.js'))
module = null;

PPx.Execute('*wait 200,2');

const g_args = ((args = PPx.Arguments()) => {
  const len = args.length;

  if (len < 1) {
    util.error('arg');
  }

  return {
    name: args.item(0),
    dryrun: len > 1 ? args.item(1) | 0 : 0
  };
})();

const cache_dir = util.getc('S_ppm#global:cache');
const table = ((name = g_args.name, cache = cache_dir) => {
  const path = `${cache}\\switchmenu\\${name}.cfg`;

  const notExists = util.reply.call({name: 'exists'}, 'path', path);

  if (notExists !== '') {
    PPx.Quit(1);
  }

  const cmdline = `*setcust @%*getcust(S_ppm#global:cache)\\switchmenu\\${name}.cfg%:*execute ,%%M_ppmSwitch`;

  return {
    prop: name,
    value: cmdline
  };
})();

const lines = ((cache = cache_dir, t = table, dryrun = g_args.dryrun) => {
  const path = `${cache}\\config\\ppm-switchmenu.cfg`;
  const result = util.lines(path);
  const index = result.data.findIndex((v) => /^[^\s]+SwitchMenu\s=.+/.test(v));
  const ele = `&;9:${t.prop}\t= ${t.value}`;

  if (index === -1) {
    dryrun !== 0 && PPx.Echo('Not found preset SwitchMenu');
    PPx.Quit(1);
  }

  result.data.splice(index, 0, ele);
  return {filepath: path, data: result.data, newline: result.newline};
})();

g_args.dryrun
  ? PPx.Echo(lines.data.join(lines.newline))
  : util.write.apply({newline: lines.newline, filepath: lines.filepath}, lines.data);
