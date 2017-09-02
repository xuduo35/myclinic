var yaopinlist = require('./yaopin.json');

for (var i = 0; i < yaopinlist.length; i++) {
    yaopinlist[i].unit = yaopinlist[i].specification.substr(yaopinlist[i].specification.length - 1, yaopinlist[i].specification.length - 1);
}

console.log(JSON.stringify(yaopinlist, ' ', 2));
