var yaopin = require('./yaopin.raw.json');
var yaopinspecs = require('./yaopinspecs.json');
var _ = require('lodash');

function getEveryPrice(standard, stdprice) {
  var prices ={};
  var details, std;

  standard = _(standard).trim();

  if (
    (standard.indexOf('(') >= 0) ||
    (standard.indexOf(')') >= 0) ||
    (standard.indexOf(';') >= 0)
    ){
    // 去掉括号里的内容: "(5:2)mg:1ml/支", "(10万iu/g)5g/支""
    standard = standard.replace(/^.+\)/, "");
    // 带分号的只留:后面的部分: "250ml;25g:25g/瓶"
    standard = standard.replace(/^.+:/, "");
  }

  if (standard == '') {
    return {};
  }

  details = standard.split('/');

  for (var j = 0; j < details.length; j++) {
    var remain = stdprice;
    var stds = details[j].split('*');
    var lastlevel = 1;

    for (var i = stds.length - 1; i >= 0; i--) {
      (function(item, level) {
        var stdss = item.split(':');

        for (var i = 0; i < stdss.length; i++) {
          if (stdss[i].indexOf('%') >= 0) {
            continue;
          }

          var numberstr = stdss[i].replace(/[^0-9.]/ig, "");
          var number = ((numberstr == "") ? 1 : parseFloat(numberstr));
          var unit = stdss[i].replace(/[0-9.]/ig, "");

          if ((unit == "ml支") || (unit == "ml瓶")){
            prices['ml'] = {
              number: number * level,
              price: (remain/number).toFixed(2)
            };
            prices[unit.replace('ml', '')] = {
              number: level,
              price: remain.toFixed(2)
            };
          } else {
            prices[unit] = {
              number: number * level,
              price: (remain/number).toFixed(2)
            };

            if (["份", "包", "听", "吸", "喷", "支", "板", "枚", "片", "瓶", "盒", "粒", "袋", "贴"].indexOf(unit) >= 0) {
              lastlevel = prices[unit]['number'];
            }
          }
        }
      })(stds[i], lastlevel);

      remain = remain / lastlevel;
    }
  }

  // 不标准的规格
  if (Object.keys(prices).indexOf('undefined') >= 0) {
    return {};
  }

  if (Object.keys(prices).indexOf('100ml') >= 0) {
    return {};
  }

  //console.log(Object.keys(prices).join("\n"));

  return prices;
}

for (var i = 0; i < yaopin.length; i++) {
  yaopin[i].stdprice = 0.0;
  yaopin[i].remain = 0;
  yaopin[i].prices = getEveryPrice(yaopin[i].standard, yaopin[i].stdprice);
}

for (var i = 0; i < yaopin.length; i++) {
  var specidx = _.findIndex(yaopinspecs, function(item) {
    var tradename = item.specifications[0][1].replace(/^.+商品名称：/, "");
    return ((yaopin[i].name == item.name) && yaopin[i].tradename == tradename);
  });

  if (specidx >= 0) {
    yaopin[i].link = yaopinspecs[specidx].link;
    yaopin[i].spec = "";
    yaopinspecs[specidx].specifications.map(function(item) {
      yaopin[i].spec += item[0] + "\n" + item[1] + "\n";
    });

    yaopin[i].stdprice = 0;
  }
}

for (var i = 0; i < yaopin.length; i++) {
  if (typeof yaopin[i].link != 'undefined') {
    continue;
  }

  var specidx = _.findIndex(yaopinspecs, function(item) {
    var tradename = item.specifications[0][1].replace(/^.+商品名称：/, "");
    return (yaopin[i].name == item.name);
  });

  if (specidx >= 0) {
    yaopin[i].link = yaopinspecs[specidx].link;
    yaopin[i].spec = "";
    yaopinspecs[specidx].specifications.map(function(item) {
      yaopin[i].spec += item[0] + "\n" + item[1] + "\n";
    });
  }
}

console.log(JSON.stringify(yaopin, ' ', 2));
