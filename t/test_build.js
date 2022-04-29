﻿//!*script
/**
 * Dry run build config
 *
 */

var plugin = (function () {
  var pwd = PPx.Extract('%*name(D,"%FD")');
  var name = PPx.Extract('%*name(C,"' + pwd + '")');
  var path = PPx.Extract('%*getcust(S_ppm#plugins:' + name + ')');
  var delete_flag = false;

  if (path === '') {
    delete_flag = true;
    PPx.Execute('*setcust S_ppm#plugins:' + name + '=' + pwd);
  }

  return {name: name, flag: delete_flag};
})();

PPx.Extract('%*script(%*getcust(S_ppm#global:ppm)\\script\\jscript\\build.js,' + plugin.name + ',def,1)');

if (plugin.flag === true) {
  PPx.Execute('*deletecust S_ppm#plugins:' + plugin.name);
}

