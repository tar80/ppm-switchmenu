//!*script
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
    name: args.item(0),
    dryrun: len > 1 ? args.item(1) | 0 : 0
  };
})(PPx.Arguments());

var cache_dir = util.getc('S_ppm#global:cache');
var table = (function (name, cache) {
  var path = cache + '\\switchmenu\\' + name + '.cfg';

  var notExists = util.reply.call({name: 'exists'}, 'path', path);

  if (notExists !== '') {
    PPx.Quit(1);
  }

  var cmdline =
    '*setcust @%*getcust(S_ppm#global:cache)\\switchmenu\\' +
    name +
    '.cfg%:*execute ,%%M_ppmSwitch';

  return {
    prop: name,
    value: cmdline
  };
})(g_args.name, cache_dir);

var lines = (function (cache, t) {
  var path = cache + '\\config\\ppm-switchmenu.cfg';
  var result = util.lines(path);
  var index = (function () {
    var thisLine;
    var reg = /^[^\s]+SwitchMenu\s=.+/;

    for (var i = 0, l = result.data.length; i < l; i++) {
      thisLine = result.data[i];

      if (reg.test(thisLine)) {
        return i;
      }
    }
  })();
  var ele = '&;9:' + t.prop + '\t= ' + t.value;

  result.data.splice(index, 0, ele);
  return {filepath: path, data: result.data, newline: result.newline};
})(cache_dir, table);

g_args.dryrun
  ? PPx.Echo(lines.data.join(lines.newline))
  : util.write.apply({newline: lines.newline, filepath: lines.filepath}, lines.data);
