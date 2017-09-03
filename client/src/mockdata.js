import Mock from 'mockjs';
import moment from 'moment';
import { getEveryPrice } from './utils';
var yaopin = require('./yaopin.json');
var yaopinspecs = require('./yaopinspecs.json');
var _ = require('lodash');

Mock.setup({ timeout: '200-600' });

var global_id = 1;
var idgenerator = function() {
    return global_id++;
};

var yaopinexample = [{
  _id: idgenerator(),
  "name": "阿托伐他汀钙片",
  "tradename": "阿乐",
  "standard": "10mg*7片/盒",
  "type": "循环系统药物",
  "unit": "盒",
  "stdprice": 100,
  "remain": 0,
  "prices": {
    "片": {
      "number": 7,
      "price": "100.00"
    },
    "mg": {
      "number": 10,
      "price": "14.29"
    },
    "盒": {
      "number": 1,
      "price": "100.00"
    }
  },
  "usage": '',
  "defaultUnit": "片",
  "link": "http://drugs.dxy.cn/drug/54348.htm",
  "spec": "药品名称:\n通用名称：阿托伐他汀钙片, 英文名称：AtorvastatinCalciumTablets, 商品名称：阿乐\n成份:\n阿托伐他汀钙\n适应症:\n原发性高胆固醇血症患者，包括家族性高胆固醇血症（杂合子型）或混合性高脂血症（相当于Fredrickson分类法的Ⅱa和Ⅱb型）患者，如果饮食治疗和其他非药物治疗疗效不满意，应用本品可治疗其总胆固醇T...\n用法用量:\n病人在开始本品治疗前，应进行标准的低胆固醇饮食控制，在整个治疗期间也应维持合理膳食。应根据低密度脂蛋白胆固醇基线水平、治疗目标和患者的治疗效果进行剂量的个体化调整。常用的起始剂量为10mg，每日一次。...\n不良反应:\n本品最常见的不良反应为便秘、胃肠胀气、消化不良和腹痛，通常在继续用药后缓解。临床试验中低于2%的患者因与本品有关的不良反应而中断治疗。按照惯例，不良事件的估计发生率排序为：常见＞1/100，＜1/...\n禁忌:\n对本品所含的任何成份过敏者禁用。活动性肝病患者、血清转氨酶持续升高超过正常上限3倍且原因不明者、肌病、孕期、哺乳期及任何未采取适当避孕措施的育龄妇女禁用本品。\n注意事项:\n肝脏影响开始治疗前应做肝功能检查并定期复查。患者出现任何提示有肝脏损害的症状或体征时应检查肝功能，转氨酶水平升高的患者应加以监测直至恢复正常。如果转氨酶持续升高超过正常值3倍以上，建议减低剂量或停用本...\n药物相互作用:\n当他汀类药物与环孢菌素、纤维酸衍生物、大环内酯类抗生素（包括红霉素）、康唑类抗真菌药或烟酸合用时，发生肌病的危险性增加。在极罕见情况下，可导致横纹肌溶解，伴有肌球蛋白尿而后继发肾功能不全。因此，应仔细...\n毒理研究:\n阿托伐他汀对大鼠无致癌作用。",
  usefreq: 0,
  lastmod: moment(),
  created: moment(),
},
]

var allcases = [{
    _id: idgenerator(),
    topicid: global_id - 1, // 作为一个Ref, 用来关联复诊
    name: '张三',
    first: false,
    date: moment(),
    idnumber: '360281198204134690',
    gender: 'male',
    age: 30,
    ageUnit: 'year',
    birthdate: moment().subtract('years', 45),
    phone: '15618888888',
    email: 'zhangshan@sina.com',
    address: '福建莆田绿宝石村',
    ethnic: '汉族',
    education: '本科',
    married: 'yes',
    occupation: '农民',
    complaint: '感冒三天',
    curr_complaint: '发烧出汗怕冷',
    past_complaint: '脑梗',
    allergic: '青霉素过敏',
    experience: '既往健康',
    marriage: '婚姻幸福',
    menses: '无',
    family: '父亲高血压',
    physical: '体格检查',
    examination: '辅助检查',
    exampics: [],
    diagnosises: ['上呼吸道感染', '肺心病' , '肾衰竭', '脑梗'],
    medicines: [{
      name: '阿托伐他汀钙片(阿乐)',
      standard: '10mg*7片/盒',
      dose: 3,
      unit: '片',
      price: 1,
      freqdaily: '3',
      days: 7,
      total: 63,
      money: 63,
      prices: {
        "片": {
          "number": 7,
          "price": "100.00"
        },
        "mg": {
          "number": 10,
          "price": "14.29"
        },
        "盒": {
          "number": 1,
          "price": "100.00"
        }
      },
      usage: '',
      created: moment(),
    }],
    pictures: [
        'https://gss2.bdstatic.com/-fo3dSag_xI4khGkpoWK1HF6hhy/baike/w%3D268%3Bg%3D0/sign=9b8ec28343540923aa696478aa63b634/f3d3572c11dfa9ec9c2c6ab768d0f703918fc10b.jpg'
    ],
    feedback: 0,
    fetchflag: false,
    lastmod: moment(),
    created: moment(),
}];

for (var i = 0; i < 100; i++) {
  allcases.push(Object.assign({}, allcases[0]));
  allcases[allcases.length - 1]._id = idgenerator();
  allcases[allcases.length - 1].topicid = allcases[allcases.length - 1]._id;
  allcases[allcases.length - 1].name = allcases[allcases.length - 1].name + i;
  allcases[allcases.length - 1].birthdate = moment().subtract('years', 45).add('months', i);
  allcases[allcases.length - 1].age = moment().diff(allcases[allcases.length - 1].birthdate, 'years');
  allcases[allcases.length - 1].feedback = i % 6;
}

var stockins = [{
  _id: idgenerator(),
  name: '阿托伐他汀钙片',
  tradename: '阿乐',
  standard: '10mg*7片/盒',
  price: 100,
  number: 1,
  created: moment(),
}];

var stockouts = [{
  _id: idgenerator(),
  name: '阿托伐他汀钙片(阿乐)',
  standard: '10mg*7片/盒',
  dose: 3,
  unit: '片',
  price: 1,
  freqdaily: '3',
  days: 7,
  total: 63,
  money: 63,
  created: moment(),
}];

var prescribes = [{
  _id: idgenerator(),
  name: '降脂方',
  desc: '天下降脂第一方',
  medicines: [{
    name: '阿托伐他汀钙片(阿乐)',
    standard: '10mg*7片/盒',
    dose: 3,
    unit: '片',
    price: 1,
    freqdaily: '3',
    days: 7,
    total: 63,
    money: 63,
    prices: {
      "片": {
        "number": 7,
        "price": "100.00"
      },
      "mg": {
        "number": 10,
        "price": "14.29"
      },
      "盒": {
        "number": 1,
        "price": "100.00"
      }
    },
    usage: '',
    created: moment(),
  },],
}];

var notifications = [{
    _id: idgenerator(),
    title: '药品',
    content: "阿托伐他汀钙片(阿乐) - 缺货!",
    created: moment(),
  }
];

var users = [{
  _id: idgenerator(),
  name: 'admin',
  pwd: '123456', // xxx: 数据库里当然是hash过的值
  sess: '',
  avatar: 'https://gss2.bdstatic.com/-fo3dSag_xI4khGkpoWK1HF6hhy/baike/w%3D268%3Bg%3D0/sign=9b8ec28343540923aa696478aa63b634/f3d3572c11dfa9ec9c2c6ab768d0f703918fc10b.jpg',
  casenum: 79,
  picsnum: 337,
  medsnum: 83,
  presnum: 57,
  notinum: 13,
  agerange: [10, 30, 77, 5, 43, 55], // 0~1, 1~6, 7~14, 15~30, 30~50, 50~
  lastmod: moment(),
  created: moment(),
}];

var historys = [{
    _id: idgenerator(),
    topicid: allcases[0]._id, // 关联到病例的初诊病例
    name: '张三',
    date: allcases[0].date,   // 初诊日期
    idnumber: '360281198204134690',
    gender: 'male',
    age: 30,                  // 初诊年龄
    ageUnit: 'year',
    birthdate: moment().subtract('years', 45),
    phone: '15618888888',
    email: 'zhangsan@sina.com',
    address: '福建莆田绿宝石村',
    ethnic: '汉族',
    education: '本科',
    married: 'yes',
    occupation: '农民',
    text: '',                 // 病程记录, 就是一段医生可以编辑的文本
    feedback: 0,
    lastmod: moment(),
    created: moment(),
}];

// 数据库里需要多保存_id, lastmod, created
_.each(yaopin, function(item) {
    item._id = idgenerator();
    item.usage = '',
    item.defaultUnit = Object.keys(item.prices)[0];
    item.usefreq = 0;
    item.lastmod = moment();
    item.created = moment();
});

Mock.mock('/api/case/names', function(req) {
    var body = JSON.parse(req.body);
    var searchkey = body.searchkey || '';
    var msg = {
      names: [],
      cases: []
    };

    for (var i = 0; i < allcases.length; i++) {
      if (allcases[i].name.indexOf(searchkey) < 0) {
        continue;
      }

      if (msg.names.length >= 6) {
        break;
      }

      // 保证唯一
      //if (msg.names.indexOf(allcases[i].name) < 0) {
        msg.names.push(allcases[i].name);
        msg.cases.push(allcases[i]);
      //}
    }

    return {
        status: 0,
        msg: msg
    };
});

Mock.mock('/api/case/list', function(req) {
    var body = JSON.parse(req.body);
    var searchfeedback = body.searchfeedback;
    var searchkey = body.searchkey || ''; // xxx
    var searchtype = body.searchtype || ''; // 'name' || 'gender' || 'complaint' || 'age'
    var pn = body.pn - 1;
    var ps = body.ps;
    var from = ps * pn;
    var index = 0;
    var msg = [];
    var start = 0;
    var end = 0;

    (pn < 0) && (pn = 0);
    (ps < 10) && (ps = 10);

    // if (searchtype == 'gender') {
    //   start = searchkey.start;
    //   end = searchkey.end;
    //   from = moment().subtract('years', end);
    //   to = moment().subtract('years', start);
    // }

    // if (searchtype == 'age') {
    //   start = searchkey.start;
    //   end = searchkey.end;
    //   from = moment().subtract('years', end);
    //   to = moment().subtract('years', start);
    // }

    //gender
    //searchageflag, searchagelow, searchagehigh
    //daterangeflag, daterange

    for (var i = 0; i < allcases.length; i++) {
      if (searchtype == 'name') {
        if (allcases[i].name.indexOf(searchkey) < 0) {
          continue;
        }
      } else if (searchtype == 'idnumber') {
        if (allcases[i].idnumber.indexOf(searchkey) < 0) {
          continue;
        }
      } else if (searchtype == 'phone') {
        if (allcases[i].phone.indexOf(searchkey) < 0) {
          continue;
        }
      } else if (searchtype == 'address') {
        if (allcases[i].address.indexOf(searchkey) < 0) {
          continue;
        }
      } else if (searchtype == 'complaint') {
        if (allcases[i].complaint.indexOf(searchkey) < 0) {
          continue;
        }
      }/* else if (searchtype == 'gender') {
        if (allcases[i].gender != searchkey) {
          continue;
        }
      } else if (searchtype == 'age') {
        if ((allcases[i].birthdate.diff(from) < 0) || (allcases[i].birthdate.diff(to) >= 0)) {
          continue;
        }
      }*/

      if ((index >= from) && (msg.length < ps)) {
        msg.push(allcases[i]);
      }

      index++;
    }

    return {
        status: 0,
        msg: {
            data: msg,
            total: index
        }
    };
});

Mock.mock('/api/case/remove', function(req) {
    var body = JSON.parse(req.body);
    var _id = body._id;
    var msg = [];

    var idx = _.findIndex(allcases, function(item) {
        return (item._id == _id);
    });

    if (idx >= 0) {
        allcases.splice(idx, 1);
    }

    return {
      status: 0,
      msg: {}
    };
});

Mock.mock('/api/case/infoById', function(req) {
    var body = JSON.parse(req.body);
    var _id = body._id;
    var status = 1;
    var msg = {};

    var idx = _.findIndex(allcases, function(item) {
        return (item._id == _id);
    });

    if (idx >= 0) {
        status = 0;
        msg = allcases[idx];
    }

    return {
      status: status,
      msg: msg
    };
});

Mock.mock('/api/case/new', function(req) {
    var body = JSON.parse(req.body);
    var topicid = body.topicid || null; // 复诊topicid不空
    var medicines = body.medicines;

    // xxx: 出药记录移动到/api/fetchlist/complete

    var birthdate = moment();

    if (body.ageUnit == 'year') {
      birthdate.subtract('years', body.age);
    } else if (body.ageUnit == 'month') {
      birthdate.subtract('months', body.age);
    } else if (body.ageUnit == 'day') {
      birthdate.subtract('days', body.age);
    }

    var onecase = {
        _id: idgenerator(),
        topicid: topicid ? topicid : global_id - 1,
        name: body.name,
        first: body.first,
        date: body.date,
        idnumber: body.idnumber,
        gender: body.gender,
        age: body.age,
        ageUnit: body.ageUnit,
        birthdate: birthdate,
        phone: body.phone,
        email: body.emal,
        address: body.address,
        ethnic: body.ethnic,
        education: body.education,
        married: body.married,
        occupation: body.occupation,
        complaint: body.complaint,
        curr_complaint: body.curr_complaint,
        past_complaint: body.past_complaint,
        allergic: body.allergic,
        experience: body.experience,
        marriage: body.marriage,
        menses: body.menses,
        family: body.family,
        physical: body.physical,
        examination: body.examination,
        exampics: body.exampics,
        diagnosises: [],
        medicines: body.medicines,
        pictures: body.pictures || [],
        feedback: 0,
        lastmod: moment(),
        created: moment(),
    };

    (body.diagnosis0 != "") && onecase.diagnosises.push(body.diagnosis0);
    (body.diagnosis1 != "") && onecase.diagnosises.push(body.diagnosis1);
    (body.diagnosis2 != "") && onecase.diagnosises.push(body.diagnosis2);
    (body.diagnosis3 != "") && onecase.diagnosises.push(body.diagnosis3);

    allcases.unshift(onecase);

    return {
      status: 0,
      msg: {
        _id: onecase._id
      }
    };
});

Mock.mock('/api/case/modify', function(req) {
    var body = JSON.parse(req.body);
    var _id = body._id;
    var msg = {};

    var idx = _.findIndex(allcases, function(item) {
        return (item._id == _id);
    });

    if (idx < 0) {
      return {
        status: 1,
        msg: "病例不存在"
      };
    }

    var medicines = body.medicines;

    for (var i = 0; i < body.medicines.length; i++) {
      var medicine = medicines[i];

      // xxx: 首先查找(name, tradename)是否存在，药物数量恢复/扣除
      // xxx: 此处省略一百字，数据库操作

      stockouts.push({
        _id: idgenerator(),
        name: medicine.name,
        standard: medicine.standard,
        dose: medicine.dose,
        unit: medicine.unit,
        price: medicine.price,
        freqdaily: medicine.freqdaily,
        days: medicine.days,
        total: medicine.total,
        money: medicine.money,
        created: moment(),
      });
    }

    var birthdate = moment();

    if (body.ageUnit == 'year') {
      birthdate.subtract('years', body.age);
    } else if (body.ageUnit == 'month') {
      birthdate.subtract('months', body.age);
    } else if (body.ageUnit == 'day') {
      birthdate.subtract('days', body.age);
    }

    var onecase = {
        _id: allcases[idx]._id, // xxx: id保持不变
        topicid: allcases[idx].topicid,  // xxx: 也保持不变
        name: body.name,
        first: body.first,
        date: body.date,
        idnumber: body.idnumber,
        gender: body.gender,
        age: body.age,
        ageUnit: body.ageUnit,
        birthdate: birthdate,
        phone: body.phone,
        email: body.emal,
        address: body.address,
        ethnic: body.ethnic,
        education: body.education,
        married: body.married,
        occupation: body.occupation,
        complaint: body.complaint,
        curr_complaint: body.curr_complaint,
        past_complaint: body.past_complaint,
        allergic: body.allergic,
        experience: body.experience,
        marriage: body.marriage,
        menses: body.menses,
        family: body.family,
        physical: body.physical,
        examination: body.examination,
        exampics: body.exampics,
        diagnosises: [],
        medicines: body.medicines,
        pictures: body.pictures || [],
        feedback: allcases[idx].feedback,
        lastmod: moment(),
        created: moment(),
    };

    (body.diagnosis0 != "") && onecase.diagnosises.push(body.diagnosis0);
    (body.diagnosis1 != "") && onecase.diagnosises.push(body.diagnosis1);
    (body.diagnosis2 != "") && onecase.diagnosises.push(body.diagnosis2);
    (body.diagnosis3 != "") && onecase.diagnosises.push(body.diagnosis3);

    allcases[idx] = onecase;

    return {
      status: 0,
      msg: {
        _id: onecase._id
      }
    };
});

Mock.mock('/api/case/topic', function(req) {
    var body = JSON.parse(req.body);
    var topicid = body.topicid;
    var msg = [];

    // xxx: 按时间顺序排列, 最老的在前面
    allcases.map(function(item) {
      if (item.topicid == topicid) {
        msg.unshift(item);
        return;
      }
    });

    return {
      status: 0,
      msg: msg
    };
});

Mock.mock('/api/case/feedback', function(req) {
    var body = JSON.parse(req.body);
    var _id = body._id;
    var feedback = body.feedback;

    var idx = _.findIndex(allcases, function(item) {
        return (item._id == _id);
    });

    if (idx >= 0) {
        allcases[idx].feedback = feedback;
    }

    return {
      status: 0,
      msg: {}
    };
});

Mock.mock('/api/fetch/list', function(req) {
    var body = JSON.parse(req.body);
    var searchkey = body.searchkey || ''; // xxx
    var pn = body.pn - 1;
    var ps = body.ps;
    var from = ps * pn;
    var index = 0;
    var msg = [];

    (pn < 0) && (pn = 0);
    (ps < 10) && (ps = 10);

    for (var i = 0; i < allcases.length; i++) {
      if (typeof(allcases[i].fetchflag) == 'undefined' || !allcases[i].fetchflag) {
        continue;
      }

      if (allcases[i].name.indexOf(searchkey) < 0) {
        continue;
      }

      if (msg.length >= ps) {
        break;
      }

      if (index >= from) {
        msg.push(allcases[i]);
      }

      index++;
    }

    return {
        status: 0,
        msg: {
            data: msg,
            total: index
        }
    };
});

Mock.mock('/api/fetch/new', function(req) {
    var body = JSON.parse(req.body);
    var _id = body._id;

    var idx = _.findIndex(allcases, function(item) {
        return (item._id == _id);
    });

    if (idx >= 0) {
        allcases[idx].fetchflag = true;

      return {
        status: 0,
        msg: {}
      };
    } else {
      return {
        status: 1,
        msg: '病例不存在'
      };
    }
});

Mock.mock('/api/fetch/complete', function(req) {
    var body = JSON.parse(req.body);
    var _id = body._id;
    var msg = [];

    var idx = _.findIndex(allcases, function(item) {
        return (item._id == _id);
    });

    if (idx >= 0) {
        var c = allcases[idx];

        for (var i = 0; i < c.medicines.length; i++) {
          var medicine = c.medicines[i];

          // xxx: 首先查找(name, tradename)是否存在，扣除药物数量(药物数量换算成最大的那个单位，比如'盒')
          // xxx: 此处省略一百字，数据库操作
          // xxx: 如果库存为0, 则生成缺货信息, 更新当前用户统计

          stockouts.push({
            _id: idgenerator(),
            name: medicine.name,
            standard: medicine.standard,
            dose: medicine.dose,
            unit: medicine.unit,
            price: medicine.price,
            freqdaily: medicine.freqdaily,
            days: medicine.days,
            total: medicine.total,
            money: medicine.money,
            created: moment(),
          });
        }

        c.fetchflag = false;
    }

    return {
      status: 0,
      msg: {}
    };
});

Mock.mock('/api/fetch/remove', function(req) {
    var body = JSON.parse(req.body);
    var _id = body._id;
    var msg = [];

    var idx = _.findIndex(allcases, function(item) {
        return (item._id == _id);
    });

    if (idx >= 0) {
        allcases[idx].fetchflag = false;
    }

    return {
      status: 0,
      msg: {}
    };
});

Mock.mock('/api/history/new', function(req) {
    var body = JSON.parse(req.body);
    var topicid = body.topicid;
    var msg = {};

    var idx = _.findIndex(historys, function(item) {
        return (item.topicid == topicid);
    });

    if (idx >= 0) {
      return {
        status: 1,
        msg: "病程记录已经存在"
      };
    }

    var history = {
        _id: idgenerator(),
        topicid: topicid,
        name: body.name,
        date: body.date,
        idnumber: body.idnumber,
        gender: body.gender,
        age: body.age,
        ageUnit: body.ageUnit,
        birthdate: body.birthdate,
        phone: body.phone,
        email: body.emal,
        address: body.address,
        ethnic: body.ethnic,
        education: body.education,
        married: body.married,
        occupation: body.occupation,
        text: body.text,
        feedback: 0,
        lastmod: moment(),
        created: moment(),
    };

    historys.unshift(history);

    return {
      status: 0,
      msg: history
    };
});

Mock.mock('/api/history/remove', function(req) {
    var body = JSON.parse(req.body);
    var _id = body._id;
    var msg = [];

    var idx = _.findIndex(historys, function(item) {
        return (item._id == _id);
    });

    if (idx >= 0) {
        historys.splice(idx, 1);
    }

    return {
      status: 0,
      msg: {}
    };
});

Mock.mock('/api/history/infoByTopicId', function(req) {
    var body = JSON.parse(req.body);
    var topicid = body.topicid;
    var status = 1;
    var msg = {};

    var idx = _.findIndex(historys, function(item) {
        return (item.topicid == topicid);
    });

    if (idx >= 0) {
        status = 0;
        msg = historys[idx];
    }

    return {
      status: status,
      msg: msg
    };
});

Mock.mock('/api/history/modify', function(req) {
    var body = JSON.parse(req.body);
    var _id = body._id;
    var msg = {};

    var idx = _.findIndex(historys, function(item) {
        return (item._id == _id);
    });

    if (idx < 0) {
      return {
        status: 1,
        msg: "病程记录不存在"
      };
    }

    historys[idx].birthdate = body.birthdate;
    historys[idx].phone = body.phone;
    historys[idx].email = body.emal;
    historys[idx].address = body.address;
    historys[idx].ethnic = body.ethnic;
    historys[idx].education = body.education;
    historys[idx].married = body.married;
    historys[idx].occupation = body.occupation;
    historys[idx].text = body.text;
    historys[idx].lastmod = moment();

    return {
      status: 0,
      msg: {}
    };
});

// xxx: 搜索条件跟/api/case/list一样, 不过少了complaint等几个字段...
Mock.mock('/api/history/list', function(req) {
    var body = JSON.parse(req.body);
    var searchfeedback = body.searchfeedback;
    var searchkey = body.searchkey || ''; // xxx
    var pn = body.pn - 1;
    var ps = body.ps;
    var from = ps * pn;
    var index = 0;
    var msg = [];

    (pn < 0) && (pn = 0);
    (ps < 10) && (ps = 10);

    for (var i = 0; i < historys.length; i++) {
      if (historys[i].name.indexOf(searchkey) < 0) {
        continue;
      }

      if (msg.length >= ps) {
        break;
      }

      if (index >= from) {
        msg.push(historys[i]);
      }

      index++;
    }

    return {
        status: 0,
        msg: {
            data: msg,
            total: index
        }
    };
});

Mock.mock('/api/history/feedback', function(req) {
    var body = JSON.parse(req.body);
    var _id = body._id;
    var feedback = body.feedback;

    var idx = _.findIndex(historys, function(item) {
        return (item._id == _id);
    });

    if (idx >= 0) {
        historys[idx].feedback = feedback;
    }

    return {
      status: 0,
      msg: {}
    };
});

Mock.mock('/api/medicine/list', function(req) {
    var body = JSON.parse(req.body);
    var searchkey = body.searchkey || ''; // xxx
    var searchorder = body.searchorder || ''; // 'created' || 'remain' || 'usefreq' || 'stockout'
    var pn = body.pn - 1;
    var ps = body.ps;
    var from = ps * pn;
    var index = 0;
    var msg = [];

    (pn < 0) && (pn = 0);
    (ps < 10) && (ps = 10);

    for (var i = 0; i < yaopin.length; i++) {
      if ((yaopin[i].name.indexOf(searchkey) < 0) && (yaopin[i].tradename.indexOf(searchkey) < 0)) {
        continue;
      }

      if ((index >= from) && (msg.length < ps)) {
        msg.push(yaopin[i]);
      }

      index++;
    }

    return {
        status: 0,
        msg: {
            data: msg,
            total: index
        }
    };
});

Mock.mock('/api/medicine/names', function(req) {
    var body = JSON.parse(req.body);
    var searchkey = body.searchkey || '';
    var msg = [];

    for (var i = 0; i < yaopin.length; i++) {
      if (
            (yaopin[i].name.indexOf(searchkey) < 0) &&
            (yaopin[i].tradename.indexOf(searchkey) < 0)
      ) {
        continue;
      }

      if (msg.length >= 10) {
        break;
      }

      // 保证唯一
      msg.push(yaopin[i]);
    }

    return {
        status: 0,
        msg: msg
    };
});

Mock.mock('/api/medicine/info', function(req) {
    var body = JSON.parse(req.body);
    var name = body.name;
    var tradename = body.tradename;
    var status = 1;
    var msg = {};

    var idx = _.findIndex(yaopin, function(item) {
        return (
            (item.name.substring(0, name.length) == name) &&
            (item.tradename.substring(0, name.length) == tradename)
        );
    });

    if (idx >= 0) {
        status = 0;
        msg = yaopin[idx];
    }

    return {
      status: status,
      msg: msg
    };
});

Mock.mock('/api/medicine/infoById', function(req) {
    var body = JSON.parse(req.body);
    var _id = body._id;
    var status = 1;
    var msg = {};

    var idx = _.findIndex(yaopin, function(item) {
        return (item._id == _id);
    });

    if (idx >= 0) {
        status = 0;
        msg = yaopin[idx];
    }

    return {
      status: status,
      msg: msg
    };
});

Mock.mock('/api/medicine/remove', function(req) {
    var body = JSON.parse(req.body);
    var _id = body._id;
    var idx;

    var idx = _.findIndex(yaopin, function(item) {
        return (item._id == _id);
    });

    if (idx >= 0) {
        yaopin.splice(idx, 1);
    }

    return {
      status: 0,
      msg: {}
    };
});

Mock.mock('/api/medicine/modify', function(req) {
    var body = JSON.parse(req.body);
    var _id = body._id;
    var name = body.name;
    var tradename = body.tradename;
    var standard = body.standard;
    var type = body.type;
    var stdprice = body.stdprice;
    var remain = body.remain;
    var link = body.link;
    var spec = body.spec;
    var defaultUnit = body.defaultUnit;
    var usage = body.usage;

    var idx = _.findIndex(yaopin, function(item) {
        return (item._id == _id);
    });

    if (idx >= 0) {
        var otheridx = _.findIndex(yaopin, function(item) {
            // xxx: 名字已经存在
            return ((item.name == name) && (item.tradename == tradename) && (idx != yaopin.indexOf(item)));
        });

        if (otheridx >= 0) {
          return {
            status: 1,
            msg: "药品已经存在!"
          };
        }

        (typeof name != 'undefined') && (yaopin[idx].name = name);
        (typeof tradename != 'undefined') && (yaopin[idx].tradename = tradename);
        (typeof standard != 'undefined') && (yaopin[idx].standard = standard);
        (typeof type != 'undefined') && (yaopin[idx].type = type);
        (typeof stdprice != 'undefined') && (yaopin[idx].stdprice = stdprice);
        (typeof remain != 'undefined') && (yaopin[idx].remain = remain);
        (typeof link != 'undefined') && (yaopin[idx].link = link);
        (typeof spec != 'undefined') && (yaopin[idx].spec = spec);
        (typeof defaultUnit != 'undefined') && (yaopin[idx].defaultUnit = defaultUnit);
        (typeof usage != 'undefined') && (yaopin[idx].usage = usage);

        if ((typeof standard != 'undefined')) {
          yaopin[idx].lastmod = moment(); // xxx
          yaopin[idx].prices = getEveryPrice(yaopin[idx].standard, yaopin[idx].stdprice);
        }
    }

    return {
      status: 0,
      msg: {}
    };
});

Mock.mock('/api/medicine/new', function(req) {
    var body = JSON.parse(req.body);
    var name = body.name;
    var tradename = body.tradename;
    var standard = body.standard;
    var type = body.type;
    var stdprice = body.stdprice;
    var link = body.link;
    var spec = body.spec;

    var idx = _.findIndex(yaopin, function(item) {
        return ((item.name == name) && (item.tradename == tradename));
    });

    if (idx >= 0) {
      return {
        status: 1,
        msg: "药品已经存在!"
      };
    }

    // xxx: 检查数据正确性，确保类型与值都合法; 系统里是否已经存在
    var medobj = {
        name: name,
        tradename: tradename,
        standard: standard,
        type: type,
        stdprice: parseFloat(stdprice),
        remain: 0,
        link: link,
        spec: spec,
        usefreq: 0,
        lastmod: moment(),
        created: moment(),
    };

    medobj.prices = getEveryPrice(medobj.standard, medobj.stdprice);
    medobj.defaultUnit = Object.keys(medobj.prices)[0];
    (typeof medobj.defaultUnit == 'undefined') && (medobj.defaultUnit = '');

    yaopin.push(medobj);

    return {
      status: 0,
      msg: medobj
    };
});

Mock.mock('/api/medicine/stock', function(req) {
    var body = JSON.parse(req.body);
    var _id = body._id;
    var stockmedprice = body.stockmedprice;
    var stockmednumber = body.stockmednumber;
    var standard = body.standard;

    var idx = _.findIndex(yaopin, function(item) {
        return (item._id == _id);
    });

    if (idx >= 0) {
      yaopin[idx].lastmod = moment();
      yaopin[idx].remain += stockmednumber;

      stockins.push({
        _id: idgenerator(),
        name: yaopin[idx].name,
        tradename: yaopin[idx].tradename,
        standard: standard,
        price: stockmedprice,
        number: stockmednumber,
        created: moment(),
      });
    }

    return {
      status: 0,
      msg: {}
    };
});

Mock.mock('/api/stockin/list', function(req) {
    var body = JSON.parse(req.body);
    var searchkey = body.searchkey || ''; // xxx
    var pn = body.pn - 1;
    var ps = body.ps;
    var from = ps * pn;
    var index = 0;
    var msg = [];

    (pn < 0) && (pn = 0);
    (ps < 10) && (ps = 10);

    for (var i = 0; i < stockins.length; i++) {
      if (stockins[i].name.indexOf(searchkey) < 0) {
        continue;
      }

      if (msg.length >= ps) {
        break;
      }

      if (index >= from) {
        msg.push(stockins[i]);
      }

      index++;
    }

    return {
        status: 0,
        msg: {
            data: msg,
            total: index
        }
    };
});

Mock.mock('/api/stockin/remove', function(req) {
    var body = JSON.parse(req.body);
    var _id = body._id;
    var idx;

    var idx = _.findIndex(stockins, function(item) {
        return (item._id == _id);
    });

    if (idx >= 0) {
        stockins.splice(idx, 1);
    }

    return {
      status: 0,
      msg: {}
    };
});

Mock.mock('/api/stockout/list', function(req) {
    var body = JSON.parse(req.body);
    var searchkey = body.searchkey || ''; // xxx
    var pn = body.pn - 1;
    var ps = body.ps;
    var from = ps * pn;
    var index = 0;
    var msg = [];

    (pn < 0) && (pn = 0);
    (ps < 10) && (ps = 10);

    for (var i = 0; i < stockouts.length; i++) {
      if (stockouts[i].name.indexOf(searchkey) < 0) {
        continue;
      }

      if (msg.length >= ps) {
        break;
      }

      if (index >= from) {
        msg.push(stockouts[i]);
      }

      index++;
    }

    return {
        status: 0,
        msg: {
            data: msg,
            total: index
        }
    };
});

Mock.mock('/api/stockout/remove', function(req) {
    var body = JSON.parse(req.body);
    var _id = body._id;
    var idx;

    var idx = _.findIndex(stockouts, function(item) {
        return (item._id == _id);
    });

    if (idx >= 0) {
        stockouts.splice(idx, 1);
    }

    return {
      status: 0,
      msg: {}
    };
});

Mock.mock('/api/picture/upload', function(req) {
    return {
      status: 0,
      msg: 'https://gss2.bdstatic.com/-fo3dSag_xI4khGkpoWK1HF6hhy/baike/w%3D268%3Bg%3D0/sign=9b8ec28343540923aa696478aa63b634/f3d3572c11dfa9ec9c2c6ab768d0f703918fc10b.jpg'
    };
});

Mock.mock('/api/picture/remove', function(req) {
    var body = JSON.parse(req.body);
    var picpath = body.picpath;

    return {
      status: 0,
      msg: {}
    };
});

Mock.mock('/api/prescribe/list', function(req) {
    var body = JSON.parse(req.body);
    var searchkey = body.searchkey || ''; // xxx
    var pn = body.pn - 1;
    var ps = body.ps;
    var from = ps * pn;
    var index = 0;
    var msg = [];

    (pn < 0) && (pn = 0);
    (ps < 10) && (ps = 10);

    for (var i = 0; i < prescribes.length; i++) {
      if (prescribes[i].name.indexOf(searchkey) < 0) {
        continue;
      }

      if (msg.length >= ps) {
        break;
      }

      if (index >= from) {
        msg.push(prescribes[i]);
      }

      index++;
    }

    return {
        status: 0,
        msg: {
            data: msg,
            total: index
        }
    };
});

Mock.mock('/api/prescribe/info', function(req) {
    var body = JSON.parse(req.body);
    var name = body.name;
    var status = 1;
    var msg = {};

    var idx = _.findIndex(prescribes, function(item) {
        return (item.name == name);
    });

    if (idx >= 0) {
        status = 0;
        msg = prescribes[idx].medicines;
    }

    return {
      status: status,
      msg: msg
    };
});

Mock.mock('/api/prescribe/new', function(req) {
    var body = JSON.parse(req.body);
    var name = body.name;
    var desc = body.desc;
    var medicines = body.medicines || []; // xxx
    var msg = [];
    var prescribe = {};

    var idx = _.findIndex(prescribes, function(item) {
        return (item.name == name);
    });

    // xxx: 覆盖老的处方
    if (idx >= 0) {
        if (name == "") {
          return {
            status: 1,
            msg: "名字不能为空"
          };
        }

        prescribes[idx] = medicines;
        prescribe = prescribes[idx];
    } else {
      prescribe = {
        _id: idgenerator(),
        name: name,
        desc: desc,
        medicines: medicines,
      };

      // xxx: 放到第一个, 类似使用数据库按时间排序
      prescribes.unshift(prescribe);
    }

    return {
      status: 0,
      msg: prescribe
    };
});

Mock.mock('/api/prescribe/modify', function(req) {
    var body = JSON.parse(req.body);
    var _id = body._id;
    var name = body.name;
    var desc = body.desc;
    var medicines = body.medicines;
    var msg = [];

    var idx = _.findIndex(prescribes, function(item) {
        return (item._id == _id);
    });

    if (idx < 0) {
      return {
        status: 1,
        msg: "处方不存在"
      };
    }

    if (typeof name != 'undefined') {
      var otheridx = _.findIndex(prescribes, function(item) {
          // xxx: 名字已经存在
          return ((item.name == name) && (idx != prescribes.indexOf(item)));
      });

      if (otheridx >= 0) {
        return {
          status: 1,
          msg: "处方已经存在!"
        };
      }
    }

    (typeof name != 'undefined') && (prescribes[idx].name = name);
    (typeof desc != 'undefined') && (prescribes[idx].desc = desc);
    (typeof medicines != 'undefined') && (prescribes[idx].medicines = medicines); // xxx

    return {
      status: 0,
      msg: {}
    };
});

Mock.mock('/api/prescribe/remove', function(req) {
    var body = JSON.parse(req.body);
    var _id = body._id;
    var msg = [];

    var idx = _.findIndex(prescribes, function(item) {
        return (item._id == _id);
    });

    if (idx >= 0) {
        prescribes.splice(idx, 1);
    }

    return {
      status: 0,
      msg: {}
    };
});

Mock.mock('/api/prescribe/names', function(req) {
    var body = JSON.parse(req.body);
    var searchkey = body.searchkey || '';
    var msg = [];

    for (var i = 0; i < prescribes.length; i++) {
      if (prescribes[i].name.indexOf(searchkey) < 0) {
        continue;
      }

      if (msg.length >= 10) {
        break;
      }

      // 保证唯一
      msg.push(prescribes[i].name);
    }

    return {
        status: 0,
        msg: msg
    };
});

Mock.mock('/api/avatar/upload', function(req) {
    // xxx: 替换相同目录下的头像文件就行了, 或者先叫另外一个名字, 等设置提交的时候替换

    return {
        status: 0,
        msg: {}
    };
});

Mock.mock('/api/user/profile', function(req) {
    var body = JSON.parse(req.body);

    return {
        status: 0,
        msg: users[0]
    };
});

Mock.mock('/api/user/login', function(req) {
    var body = JSON.parse(req.body);
    var name = body.name;
    var pwd = body.pwd;

    // xxx: 删除掉users[0]中的pwd

    return {
        status: 0,
        msg: users[0]
    };
});

Mock.mock('/api/user/logout', function(req) {
    var body = JSON.parse(req.body);
    var u = users[0];

    return {
        status: 0,
        msg: {}
    };
});

Mock.mock('/api/user/setting', function(req) {
    var body = JSON.parse(req.body);
    var name = body.name;
    var pwd = body.pwd;

    // xxx: 删除掉users[0]中的pwd

    return {
        status: 0,
        msg: {}
    };
});

Mock.mock('/api/notification/clear', function(req) {
    var body = JSON.parse(req.body);

    notifications = [];

    return {
        status: 0,
        msg: {}
    };
});

Mock.mock('/api/site/home', function(req) {
    var serverurl = "http://127.0.0.1:3000";

    return {
        status: 0,
        msg: serverurl
    };
});

Mock.mock('/api/dashboard/stats', function(req) {
    var body = JSON.parse(req.body);
    var u = users[0];
    var msg = {
      casenum: u.casenum,
      picsnum: u.picsnum,
      medsnum: u.medsnum,
      presnum: u.presnum,
      notifications: notifications, // xxx: 返回前面10条就好
      fromstr: "从" + moment().format("YYYY-MM-DD") + "开始到现在",
      agerange: u.agerange,
      recentdates: [],
      recentcases: [],
      serverurl: "http://127.0.0.1:3000"
    };

    for (let i = 0; i < 50; i++) {
        msg.recentdates.unshift(moment().subtract('days', i).format('YYYY-MM-DD'));
        msg.recentcases.unshift(Math.ceil((Math.cos(i / 5) * (i / 5) + i / 6) * 5) + 10);
    }

    return {
        status: 0,
        msg: msg
    };
});