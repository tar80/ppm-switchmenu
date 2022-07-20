//!*script
// deno-lint-ignore-file no-var
/**
 * Open the switch-menu configuration file and append a preset to the table
 *
 * @version 1.0
 * @arg 0 Preset menu name
 * @arg 1 Cursor line shortcut key
 */

var NL_CHAR = '\r\n';

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

var g_menu = (function (args) {
  var len = args.length;

  if (len < 1) {
    util.error('arg');
  }

  return {
    name: args.Item(0),
    key: len > 1 ? args.Item(1) : null
  };
})(PPx.Arguments);

var result = [];
var menu_list = util.getc('M_ppmSwitch').split(NL_CHAR);
var marker = util.getc('S_ppm#user:sw_marker') || '<';
var reg = new RegExp('^([^\\s=]+)(\t' + marker + ')?[\\s=]+(.*)');
var del = '@#=#@';

for (var i = 1, l = menu_list.length - 2; i < l; i++) {
  var thisLine = menu_list[i].replace(reg, '$1$2' + del + '$3').split(del);

  if (/^\s/.test(thisLine[0])) {
    continue;
  }

  if (~thisLine[0].indexOf(g_menu.name)) {
    if (!~thisLine[0].indexOf(marker)) {
      result.push(
        '*setcust M_ppmSwitch:' +
          thisLine[0] +
          '\t' +
          marker +
          '=%(' +
          util.getc('M_ppmSwitch:' + thisLine[0]) +
          '%)'
      );

      continue;
    }

    result.push(
      '*setcust M_ppmSwitch:' + thisLine[0] + '=%(' + util.getc('"M_ppmSwitch:' + thisLine[0] + '"') + '%)'
    );
  } else {
    if (~thisLine[0].indexOf(marker)) {
      result.push(
        '*setcust M_ppmSwitch:' +
          thisLine[0].split('\t')[0] +
          '=%(' +
          util.getc('"M_ppmSwitch:' + thisLine[0] + '"') +
          '%)'
      );

      continue;
    }

    result.push(
      '*setcust M_ppmSwitch:' + thisLine[0] + '=%(' + util.getc('M_ppmSwitch:' + thisLine[0]) + '%)'
    );
  }
}

PPx.Execute('*deletecust "M_ppmSwitch"');
PPx.Execute('%OC ' + result.join('%:'));
PPx.Execute('%K"@LOADCUST');
PPx.Execute(
  '*setcust S_ppm#user:sw_cursor=' +
    g_menu.key +
    '%:' +
    '*setcust @%*getcust(S_ppm#global:cache)\\switchmenu\\' +
    g_menu.name +
    '.cfg %:' +
    '*execute ,%%M_ppmSwitch,"' +
    g_menu.key +
    '"'
);
