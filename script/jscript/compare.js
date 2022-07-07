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

var user_menu = (function (args) {
  var len = args.length;

  if (len < 1) {
    util.error('arg');
  }

  var path = args.item(0);
  var notExists = util.reply.call({name: 'exists'}, 'path', 'file', path);

  if (notExists !== '') {
    util.quitMsg('Not exist\n' + path);
  }

  var name = PPx.Extract('%*name(C,' + path + ')');
  return {name: name, path: path};
})(PPx.Arguments());

var default_menu_path = (function () {
  var lines = util.lines(user_menu.path);
  var reg = /^;\s*(PLUGIN)[\s=]+(.+)/;
  var result = lines.data[0].replace(reg, '$1=$2').split('=');

  if (result[0] !== 'PLUGIN' || typeof result[1] === 'undefined') {
    util.quitMsg('Not identify the location of the default preset-menu');
  }

  return util.getc('S_ppm#plugins:' + result[1]) + '\\switchmenu\\' + user_menu.name;
})();

PPx.Execute(
  '*execute ,%*getcust(S_ppm#user:compare) "' + user_menu.path + '" "' + default_menu_path + '"'
);
