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
const util = module(PPx.Extract('%*getcust(S_ppm#global:module)\\util.js'));
module = null;

const g_args = ((args = PPx.Arguments) => {
  const len = args.length;

  if (len < 1) {
    util.error('arg');
  }

  return {
    name: args.Item(0),
    dryrun: len > 1 ? args.Item(1) | 0 : 0
  };
})();

const cache_dir = util.getc('S_ppm#global:cache');
const table = ((name = g_args.name, cache = cache_dir) => {
  const path = `${cache}\\switchmenu\\${name}.cfg`;

  PPx.Execute(`*execute ,%*getcust(S_ppm#user:editor) ${path}%%&`);

  const notExists = util.reply.call({name: 'exists'}, 'path', 'file', path);

  if (notExists !== '') {
    PPx.Quit(1);
  }

  const shortcut = [...name][0].toUpperCase();
  const cmdline =
    `*setcust S_ppm#user:sw_cursor=${shortcut}\n` +
    '\t*setcust S_ppm#user:sw_check=8\n' +
    `\t*setcust @%*getcust(S_ppm#global:cache)\\switchmenu\\${name}.cfg\n` +
    `\t*execute ,%%M_ppmSwitch,"?c:%*getcust(S_ppm#uset:sw_check);${shortcut}"`;

  return {
    prop: name,
    value: cmdline
  };
})();

const lines = ((cache = cache_dir, t = table, dryrun = g_args.dryrun) => {
  const path = `${cache}\\config\\ppm-switchmenu.cfg`;
  const result = util.readLines(path);
  const hasLine = new RegExp(`${t.prop}\\s=`);

  if (result.data.findIndex((v) => hasLine.test(v)) > 0) {
    PPx.Quit(1);
  }

  const switchmenuLine = result.data.findIndex((v) => /^.*SwitchMenu\s=.+/.test(v));
  const ele = `&9:${t.prop}\t= ${t.value}`;

  if (switchmenuLine === -1) {
    dryrun !== 0 && PPx.report('No "SwitchMenu" line in ppm-switchmenu.cfg');
    PPx.Quit(1);
  }

  result.data.splice(switchmenuLine, 0, ele);
  return {filepath: path, data: result.data, newline: result.newline, index: switchmenuLine};
})();

if (g_args.dryrun !== 0) {
  PPx.Echo(lines.data.join(lines.newline));
  PPx.Quit(1);
}

util.write.apply({newline: lines.newline, filepath: lines.filepath}, lines.data);
PPx.Execute(
  '%"ppx-plugin-manager"%Q"Update ppm-switchmenu.cfg. Run *ppmEdit now?%:' +
    '*script %*getcust(S_ppm#global:ppm)\\script\\jscript\\set.js,ppm-switchmenu,user,editor'
);
