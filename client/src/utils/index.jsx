var _ = require('lodash');

// 获取url的参数
export const queryString = () => {
    let _queryString = {};
    const _query = window.location.search.substr(1);
    const _vars = _query.split('&');
    _vars.forEach((v, i) => {
        const _pair = v.split('=');
        if (!_queryString.hasOwnProperty(_pair[0])) {
            _queryString[_pair[0]] = decodeURIComponent(_pair[1]);
        } else if (typeof _queryString[_pair[0]] === 'string') {
            const _arr = [ _queryString[_pair[0]], decodeURIComponent(_pair[1])];
            _queryString[_pair[0]] = _arr;
        } else {
            _queryString[_pair[0]].push(decodeURIComponent(_pair[1]));
        }
    });
    return _queryString;
};

export const myParseInt = (str) => {
  var num = parseInt(str);

  if (isNaN(num)) {
    return 0;
  }

  return num;
}

export const myParseFloat = (str) => {
  var num = parseFloat(str);

  if (isNaN(num)) {
    return 0.00;
  }

  return num;
}

export const getEveryPrice = (standard, stdprice) => {
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

export const getBirthdatByIdNo = (iIdNo) => {
    var tmpStr = "";
    var gender = "";
    var strReturn = "";

    iIdNo = iIdNo.replace(/^\s+|\s+$/g, "");

    if (!iIdNo || !/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(iIdNo)) {
        strReturn = "invalid";
        return strReturn;
    }

    if (iIdNo.length == 15) {
        gender = (1 - iIdNo.substr(14, 1) % 2) == '1' ? '女' : '男';

        tmpStr = iIdNo.substring(6, 12);
        tmpStr = "19" + tmpStr;
        tmpStr = tmpStr.substring(0, 4) + "-" + tmpStr.substring(4, 6) + "-" + tmpStr.substring(6);

        return tmpStr;
    } else {
        gender = (1 - iIdNo.substr(16, 1) % 2) == '1' ? 'female' : 'male';

        tmpStr = iIdNo.substring(6, 14);
        tmpStr = tmpStr.substring(0, 4) + "-" + tmpStr.substring(4, 6) + "-" + tmpStr.substring(6);
    }

    var year = tmpStr.substr(0, 4);
    var month = tmpStr.substr(6, 8);
    var day = tmpStr.substr(10, 12);

    var d = new Date(); //当然，在正式项目中，这里应该获取服务器的当前时间
    var monthFloor = ((d.getMonth() + 1) < parseInt(month, 10) || (d.getMonth() + 1) == parseInt(month, 10) && d.getDate() < parseInt(day, 10)) ? 1 : 0;
    var age = d.getFullYear() - parseInt(year,10) - monthFloor;

    console.log(tmpStr + ' ' + gender + ' ' + age);

    return {
        birthdate: tmpStr,
        gender: gender,
        age: age
    };
};

export const gender2str = (gender) => {
  if (gender == 'male') {
    return '男'
  } else if (gender == 'female') {
    return '女'
  } else {
    return "未知"
  }
};