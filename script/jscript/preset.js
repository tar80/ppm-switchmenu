//!*script
// deno-lint-ignore-file no-var
/**
 * Open the switch-menu configuration file and append a preset to the table
 *
 * @version 1.0
 * @arg 0 Table name
 * @arg 1 If nonzero dry run
 */

/* Initial */
// Read module
var st = PPx.CreateObject('ADODB.stream');
var module = function (filepath) {
  st.Open;
  st.Type = 2;
  st.Charset = 'UTF-8';
  st.LoadFromFile(filepath);
  var data = st.ReadText(-1);
  st.Close;

  return Function(' return ' + data)();
};

// Load module
var util = module(PPx.Extract('%*getcust(S_ppm#global:module)\\util.js'));
module = null;

PPx.Execute('*wait 200,2');

var g_args = (function (args) {
  var len = args.length;

  if (len < 1) {
    util.error('arg');
  }

  return {
    name: args.Item(0),
    dryrun: len > 1 ? args.Item(1) | 0 : 0
  };
})(PPx.Arguments);

var cache_dir = util.getc('S_ppm#global:cache');
var table = (function (name, cache) {
  var path = cache + '\\switchmenu\\' + name + '.cfg';

  var notExists = util.reply.call({name: 'exists'}, 'path', 'file', path);

  if (notExists !== '') {
    PPx.Quit(1);
  }

  var shortcut = name.slice(0, 1).toUpperCase();
  var cmdline =
    '*setcust S_ppm#user:sw_cursor=' + shortcut + '%:*setcust @%*getcust(S_ppm#global:cache)\\switchmenu\\' +
    name +
    '.cfg%:*execute ,%%M_ppmSwitch,' +
    shortcut

  return {
    prop: name,
    value: cmdline
  };
})(g_args.name, cache_dir);

var lines = (function (cache, t, dryrun) {
  var path = cache + '\\config\\ppm-switchmenu.cfg';
  var result = util.readLines(path);

  var switchmenuLine = (function () {
    var thisLine;
    var hasLine = new RegExp(t.prop + '\\s=');
    var reg = /^[^\s]+SwitchMenu\s=.+/;

    for (var i = 0, l = result.data.length; i < l; i++) {
      thisLine = result.data[i];

      if (hasLine.test(thisLine) > 0) {
        PPx.Quit(1);
      }

      if (reg.test(thisLine)) {
        return i;
      }
    }

    return null;
  })();

  var ele = '&9:' + t.prop + '\t= ' + t.value;

  if (switchmenuLine === null) {
    dryrun !== 0 && PPx.report('No "SwitchMenu" line in ppm-switchmenu.cfg');
    PPx.Quit(1);
  }

  result.data.splice(switchmenuLine, 0, ele);
  return {filepath: path, data: result.data, newline: result.newline, index: switchmenuLine};
})(cache_dir, table, g_args.dryrun);

if (g_args.dryrun !== 0) {
  PPx.Echo(lines.data.join(lines.newline));
  PPx.Quit(1);
}

util.write.apply({newline: lines.newline, filepath: lines.filepath}, lines.data);
PPx.Execute(
  '%"ppx-plugin-manager"%Q"Update ppm-switchmenu.cfg. Run *ppmEdit now?%:' +
    '*script %*getcust(S_ppm#global:ppm)\\script\\jscript\\set.js,ppm-switchmenu,user,editor'
);
