import axios from 'axios';
import React, { Component } from 'react';
import { hashHistory } from 'react-router';
import { Card, Radio, Input, Icon, Upload, Modal, DatePicker, Select, Row, Col, Button, AutoComplete, message } from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom';
import MedicineTable from './MedicineTable';
import CaseOpsHistory from './CaseOpsHistory';
import moment from 'moment';
import { getEveryPrice, myParseInt, myParseFloat, getBirthdatByIdNo, gender2str } from '../../utils';
var _ = require('lodash');

const Option = Select.Option;
const RadioGroup = Radio.Group;

const caseactions = {
    new: '/api/case/new',
    edit: '/api/case/modify',
    recheck: '/api/case/new',
};

const casetitles = {
    new: '新建',
    edit: '编辑',
    recheck: '新建',
};

const nations = [
    "汉族", "壮族", "满族", "回族", "苗族", "维吾尔族", "土家族", "彝族", "蒙古族", "藏族", "布依族", "侗族", "瑶族", "朝鲜族", "白族", "哈尼族",
    "哈萨克族", "黎族", "傣族", "畲族", "傈僳族", "仡佬族", "东乡族", "高山族", "拉祜族", "水族", "佤族", "纳西族", "羌族", "土族", "仫佬族", "锡伯族",
    "柯尔克孜族", "达斡尔族", "景颇族", "毛南族", "撒拉族", "布朗族", "塔吉克族", "阿昌族", "普米族", "鄂温克族", "怒族", "京族", "基诺族", "德昂族", "保安族",
    "俄罗斯族", "裕固族", "乌孜别克族", "门巴族", "鄂伦春族", "独龙族", "塔塔尔族", "赫哲族", "珞巴族", "未知",
];

var nationOptions = nations.map(function(item) {
    return (
        <Option key={nations.indexOf(item)} value={item}>{item}</Option>
        );
});

class CaseBase extends Component {
    keyIdx = 0;

    state = {
        type: this.props.type,
        caseobj: this.props.mycase,
        previewVisible: false,
        previewImage: '',
        medicines: [],
        fileList: [],
        fileListExam: [],
        dataSource: [],
        dataSourceHistory: [],
        dataSourcePrescribe: [],
        prescribename: '',
        prescribeflag: false,
        prescribenewname: '',
        prescribenewdesc: '',
    };

    componentDidMount() {

    }

    updateMedicines(medicines) {
        var self = this;

        medicines.map(function(item) {
            self.state.medicines.push({
                key: self.state.medicines.length,
                name: {
                    editable: false,
                    value: item.name,
                },
                standard: {
                    editable: false,
                    value: item.standard,
                },
                usage: {
                    editable: false,
                    value: item.usage,
                },
                dose: {
                    editable: false,
                    value: item.dose,
                },
                unit: {
                    editable: false,
                    value: item.unit,
                },
                price: {
                    editable: false,
                    value: item.price,
                },
                freqdaily: {
                    editable: false,
                    value: item.freqdaily,
                },
                days: {
                    editable: false,
                    value: item.days,
                },
                total: {
                    editable: false,
                    value: item.total,
                },
                money: {
                    editable: false,
                    value: item.money,
                },
                prices: item.prices, // xxx
            });
        });
    }

    componentWillReceiveProps(nextProps) {
        var self = this;

        if (nextProps.mycase !== this.state.caseobj) {
            this.updateMedicines(nextProps.mycase.medicines);

            nextProps.mycase.pictures.map(function(item) {
                self.state.fileList.push({
                  uid: self.state.fileList.length,
                  name: 'xxx.png',
                  status: 'done',
                  url: item,
                  response: {
                    msg: item,
                  }
                });

                self.keyIdx++;
            });

            nextProps.mycase.exampics.map(function(item) {
                self.state.fileListExam.push({
                  uid: self.state.fileListExam.length,
                  name: 'xxx.png',
                  status: 'done',
                  url: item,
                  response: {
                    msg: item,
                  }
                });

                self.keyIdx++;
            });

            this.setState({ caseobj: nextProps.mycase });
        }
    }

    handleSubmit = () => {
        if (this.state.caseobj.name == "") {
            message.error("姓名不能为空!");
            return;
        }

        if (this.state.caseobj.age < 0) {
            message.error("年龄不能为负数!");
            return;
        }

        var personInfo = getBirthdatByIdNo(this.state.caseobj.idnumber);

        if ((this.state.caseobj.idnumber != "") && (personInfo == "invalid")) {
            message.error("无效身份证!");
            return;
        }

        var medicines = [];

        this.state.medicines.map(function(medicine) {
            if (_(medicine.name.value).trim() == '') {
                return;
            }

            var dose = myParseFloat(medicine.dose.value);
            var price = myParseFloat(medicine.price.value);
            var days = myParseInt(medicine.days.value);
            var total = myParseFloat(medicine.total.value);
            var money = myParseFloat(medicine.money.value);

            medicines.push({
                name: medicine.name.value,
                standard: medicine.standard.value,
                dose: dose,
                unit: medicine.unit.value,
                price: price,
                freqdaily: medicine.freqdaily.value,
                days: days,
                total: total,
                money: money,
                prices: medicine.prices,
                usage: medicine.usage.value,
            });
        });

        this.state.caseobj.medicines = medicines;

        var pictures = [];

        this.state.fileList.map(function(file) {
            if (typeof file.response != 'undefined') {
                pictures.push(file.response.msg);
            }
        });

        this.state.caseobj.pictures = pictures;

        var exampics = [];

        this.state.fileListExam.map(function(file) {
            if (typeof file.response != 'undefined') {
                exampics.push(file.response.msg);
            }
        });

        this.state.caseobj.exampics = exampics;

        axios.post(caseactions[this.state.type], this.state.caseobj)
        .then(function (response) {
            if (response.data.status != 0) {
                message.error(response.data.msg);
            } else {
                hashHistory.replace('/app/case/list');
            }
        })
        .catch(function (error) {
            console.log(error);
        });
    };

    onChangeItem = (e) => {
        this.state.caseobj[e.target.name] = e.target.value;
        this.setState(this.state);
    };

    onChangeDate = (value, dateString) => {
        this.state.caseobj.date = dateString;
        this.setState(this.state);
    };

    onSelectAgeUnit = (value, option) => {
        this.state.caseobj.ageUnit = value;
        this.setState(this.state);
    };

    onSelectMarried = (value, option) => {
        this.state.caseobj.married = value;
        this.setState(this.state);
    };

    onSelectEthnic = (value, option) => {
        this.state.caseobj.ethnic = value;
        this.setState(this.state);
    };

    onSelectEducation = (value, option) => {
        this.state.caseobj.education = value;
        this.setState(this.state);
    };

    onFocusAge = (e) => {
        var personInfo = getBirthdatByIdNo(this.state.caseobj.idnumber);

        if (personInfo != "invalid") {
            this.state.caseobj['gender'] = personInfo.gender;
            this.state.caseobj['age'] = personInfo.age;
            this.state.caseobj['ageUnit'] = 'year';
            this.setState(this.state);
        }
    };

    handlePictureCancel = () => this.setState({ previewVisible: false })

    handlePicturePreview = (file) => {
        this.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true,
        });
    }

    handlePictureRemove = (file) => {
        axios.post('/api/picture/remove', {
            picpath: file.response.msg
        })
        .then(function (response) {

        })
        .catch(function (error) {
            console.log(error);
        });

        return true;
    }

    handlePictureChange = ({ fileList }) => this.setState({ fileList: fileList });
    handlePictureExamChange = ({ fileList }) => this.setState({ fileListExam: fileList })

    handleNameSelect = (value) => {
        this.state.caseobj.name = value;
        this.setState(this.state);
    }

    handleNameSearch = (value) => {

    }

    handleNameChange(value) {
        var self = this;
        var { caseobj } = this.state;

        caseobj.name = value;

        this.setState({caseobj}, function() {
            axios.post('/api/case/names', {
                searchkey: value
            })
            .then(function (response) {
                var dataSource = response.data.msg.names;
                var dataSourceHistory = response.data.msg.cases;

                if (response.data.status == 0) {
                    dataSource = _.uniq(dataSource);

                    for (var i = 0; i < dataSourceHistory.length; i++) {
                        dataSourceHistory[i]['key'] = i;
                    }

                    self.setState({dataSource, dataSourceHistory});
                }
            })
            .catch(function (error) {
                console.log(error);
            });
        });
    }

    handlePrescribeSelect = (value) => {
        var self = this;

        this.state.caseobj.prescribename = value;
        this.setState(this.state, function() {
            axios.post('/api/prescribe/info', {
                name: value,
            })
            .then(function (response) {
                if (response.data.status == 0) {
                    self.updateMedicines(response.data.msg);
                    self.setState(self.state);
                }
            })
            .catch(function (error) {
                console.log(error);
            });
        });
    }

    handlePrescribeSearch = (value) => {

    }

    handlePrescribeChange(value) {
        var self = this;
        var { caseobj } = this.state;

        caseobj.name = value;

        this.setState({caseobj}, function() {
            axios.post('/api/prescribe/names', {
                searchkey: value
            })
            .then(function (response) {
                var dataSourcePrescribe = response.data.msg;

                if (response.data.status == 0) {
                    self.setState({dataSourcePrescribe});
                }
            })
            .catch(function (error) {
                console.log(error);
            });
        });
    }

    newPrescribe = () => {
        this.state.prescribeflag = true;
        this.setState(this.state);
    };

    onPrescribeNewSave = () => {
        const { prescribenewname, prescribenewdesc } = this.state;

        if (_(prescribenewname).trim() == '') {
            message.error('名称不能为空!');
            return;
        }

        var self = this;

        axios.post('/api/prescribe/info', {
            name: _(prescribenewname).trim(),
        })
        .then(function (response) {
            if (response.data.status == 0) {
                if (!window.confirm("处方已经存在, 确认覆盖?")) {
                    return;
                }
            }

            var medicines = [];

            self.state.medicines.map(function(medicine) {
                if (_(medicine.name).trim() == '') {
                    return;
                }

                var dose = myParseFloat(medicine.dose.value);
                var price = myParseFloat(medicine.price.value);
                var days = myParseInt(medicine.days.value);
                var total = myParseFloat(medicine.total.value);
                var money = myParseFloat(medicine.money.value);

                medicines.push({
                    name: medicine.name.value,
                    standard: medicine.standard.value,
                    dose: dose,
                    unit: medicine.unit.value,
                    usage: medicine.usage.value,
                    price: price,
                    freqdaily: medicine.freqdaily.value,
                    days: days,
                    total: total,
                    money: money,
                    prices: medicine.prices,
                });
            });

            axios.post('/api/prescribe/new', {
                name: _(prescribenewname).trim(),
                desc: prescribenewdesc,
                medicines: medicines,
            })
            .then(function (response) {
                if (response.data.status != 0) {
                    message.error(response.data.msg);
                    return;
                }

                self.state.prescribeflag = false;
                self.setState(self.state);
            })
            .catch(function (error) {
                console.log(error);
            });
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    onPrescribeNewCancel = () => {
        this.state.prescribeflag = false;
        this.setState(this.state);
    }

    onPrescribeNewChange(e, type) {
        if (type == "prescribenewdesc") {
            var prescribenewdesc = e.target.value;
            this.setState({prescribenewdesc});
            return;
        } else if (type == "prescribenewname") {
            var prescribenewname = e.target.value;
            this.setState({prescribenewname});
        }
    }

    render() {
        const { caseobj, previewVisible, previewImage, fileList, fileListExam, dataSource, dataSourceHistory, prescribeflag, prescribenewname, prescribenewdesc, dataSourcePrescribe } = this.state;
        const uploadButton = (
          <div>
            <Icon type="plus" />
            <div className="ant-upload-text">Upload</div>
          </div>
        );

        return (
        <div className="gutter-example">
            <BreadcrumbCustom first="病例" second={casetitles[this.state.type]} />
            <Row gutter={16}>
                <Col className="gutter-row" span={22}>
                    <div className="gutter-box">
                        <Card title={casetitles[this.state.type]+"病例"} bordered={false}>
                            <Row type="flex">
                                <Col span={10}>
                                    <div style={{ margin: 8 }}>
                                        <Row>
                                            <Col>
                                                <Row>
                                                    <Col>
                                                        <label>姓名: </label>
                                                        <AutoComplete
                                                            name="name"
                                                            style={{width:150}}
                                                            value={caseobj.name}
                                                            dataSource={dataSource}
                                                            onSelect={this.handleNameSelect.bind(this)}
                                                            onSearch={this.handleNameSearch.bind(this)}
                                                            onChange={this.handleNameChange.bind(this)}/>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </div>
                                    <div style={{ margin: 8 }}>
                                        <Row>
                                            <Col>
                                                <label>日期: </label>
                                                <DatePicker defaultValue={moment(caseobj.date)} format={'YYYY-MM-DD'} onChange={this.onChangeDate} />
                                            </Col>
                                        </Row>
                                    </div>
                                    <div style={{ margin: 8 }}>
                                        <Row>
                                            <Col>
                                                <RadioGroup onChange={this.onChangeItem} value={caseobj.first}>
                                                    <Radio name="first" value={true}>初诊</Radio>
                                                    <Radio name="first" value={false}>复诊</Radio>
                                                </RadioGroup>
                                            </Col>
                                        </Row>
                                    </div>
                                    <div style={{ margin: 8 }}>
                                        <Row>
                                            <Col>
                                                <Row>
                                                    <Col>
                                                        <label>身份证: </label>
                                                        <Input type="text" style={{ width: 200 }} name="idnumber" value={caseobj.idnumber} onChange={this.onChangeItem}/>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </div>
                                    <div style={{ margin: 8 }}>
                                        <Row>
                                            <Col>
                                                <label>年龄: </label>
                                                <Input type="number" name="age" style={{ width: 70 }} onChange={this.onChangeItem} value={caseobj.age} onFocus={this.onFocusAge}/>
                                                <Select style={{marginLeft:8}} name="ageUnit" onSelect={this.onSelectAgeUnit} value={caseobj.ageUnit}>
                                                  <Option value="year">岁</Option>
                                                  <Option value="month">月</Option>
                                                  <Option value="day">天</Option>
                                                </Select>
                                                <RadioGroup style={{marginLeft:16}} onChange={this.onChangeItem} value={caseobj.gender}>
                                                    <Radio name="gender" value="male">男</Radio>
                                                    <Radio name="gender" value="female">女</Radio>
                                                    <Radio name="gender" value="unknown">未知</Radio>
                                                </RadioGroup>
                                            </Col>
                                        </Row>
                                    </div>
                                    <div style={{ margin: 8 }}>
                                        <Row>
                                            <Col span={12}>

                                            </Col>
                                        </Row>
                                    </div>
                                    <div style={{ margin: 8 }}>
                                        <Row>
                                            <Col>
                                                <label>电话: </label>
                                                <Input type="text" name="phone" style={{ width: 150 }} value={caseobj.phone} onChange={this.onChangeItem}/>
                                            </Col>
                                        </Row>
                                    </div>
                                    <div style={{ margin: 8 }}>
                                        <Row>
                                            <Col>
                                                <label>邮箱: </label>
                                                <Input type="text" name="email" style={{ width: 150 }} value={caseobj.email} onChange={this.onChangeItem}/>
                                            </Col>
                                        </Row>
                                    </div>
                                    <div style={{ margin: 8 }}>
                                        <Row>
                                            <Col>
                                                <label>住址:</label>
                                                <Input type="text" style={{ width: 250 }} name="address" value={caseobj.address} onChange={this.onChangeItem}/>
                                            </Col>
                                        </Row>
                                    </div>
                                    <div style={{ margin: 8 }}>
                                        <Row>
                                            <Col span={8}>
                                                <label>民族:</label>
                                                <Select style={{marginLeft:8,width:70}} name="ethnic" onSelect={this.onSelectEthnic} value={caseobj.ethnic}>
                                                    {nationOptions}
                                                </Select>
                                            </Col>
                                            <Col span={8}>
                                                <label>文化:</label>
                                                <Select style={{marginLeft:8,width:70}} name="education" onSelect={this.onSelectEducation} value={caseobj.education}>
                                                    <Option value="文盲">文盲</Option>
                                                    <Option value="小学">小学</Option>
                                                    <Option value="初中">初中</Option>
                                                    <Option value="高中">高中</Option>
                                                    <Option value="中专">中专</Option>
                                                    <Option value="大专">大专</Option>
                                                    <Option value="本科">本科</Option>
                                                    <Option value="硕士">硕士</Option>
                                                    <Option value="博士">博士</Option>
                                                    <Option value="博士后">博士后</Option>
                                                </Select>
                                            </Col>
                                        </Row>
                                    </div>
                                    <div style={{ margin: 8 }}>
                                        <Row>
                                            <Col span={8}>
                                                <label>婚姻:</label>
                                                <Select style={{marginLeft:8}} name="married" onSelect={this.onSelectMarried} value={caseobj.married}>
                                                  <Option value="unknown">未知</Option>
                                                  <Option value="yes">已婚</Option>
                                                  <Option value="no">单身</Option>
                                                </Select>
                                            </Col>
                                            <Col span={12}>
                                                <label>职业: </label>
                                                <Input type="text" name="occupation" style={{ width: 100 }} value={caseobj.occupation} onChange={this.onChangeItem}/>
                                            </Col>
                                        </Row>
                                    </div>
                                    <div style={{ margin: 8 }}>
                                        <Row>
                                            <Col span={20}>
                                                <label>主诉: </label>
                                                <Input type="text" style={{ width: 250 }} name="complaint" value={caseobj.complaint} onChange={this.onChangeItem}/>
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                                <Col span={14}>
                                    <CaseOpsHistory data={dataSourceHistory}/>
                                </Col>
                            </Row>
                            <div style={{ margin: 8 }}>
                                <label>现病史:</label>
                                <Row>
                                    <Col span={24}>
                                        <Input.TextArea style={{ width: '95%' }} autosize={{minRows: 6}} name="curr_complaint" value={caseobj.curr_complaint} onChange={this.onChangeItem}/>
                                    </Col>
                                </Row>
                            </div>
                            <div style={{ margin: 8 }}>
                                <label>既往史:</label>
                                <Row>
                                    <Col span={24}>
                                        <Input.TextArea style={{ width: '95%' }} autosize={{minRows: 6}} name="past_complaint" value={caseobj.past_complaint} onChange={this.onChangeItem}/>
                                    </Col>
                                </Row>
                            </div>
                            <div style={{ margin: 8 }}>
                                <label>药物过敏史:</label>
                                <Row>
                                    <Col span={24}>
                                        <Input.TextArea style={{ width: '95%', color: 'red' }} autosize={{minRows: 3}} name="allergic" value={caseobj.allergic} onChange={this.onChangeItem}/>
                                    </Col>
                                </Row>
                            </div>
                            <div style={{ margin: 8 }}>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <label>个人史:</label>
                                        <Input.TextArea autosize={{minRows: 6}} name="experience" value={caseobj.experience} onChange={this.onChangeItem}/>
                                    </Col>
                                    <Col span={12}>
                                        <label>婚育史:</label>
                                        <Input.TextArea autosize={{minRows: 6}} name="marriage" value={caseobj.marriage} onChange={this.onChangeItem}/>
                                    </Col>
                                </Row>
                            </div>
                            <div style={{ margin: 8 }}>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <label>月经史:</label>
                                        <Input.TextArea autosize={{minRows: 6}} name="menses" value={caseobj.menses} onChange={this.onChangeItem}/>
                                    </Col>
                                    <Col span={12}>
                                        <label>家族史:</label>
                                        <Input.TextArea autosize={{minRows: 6}} name="family" value={caseobj.family} onChange={this.onChangeItem}/>
                                    </Col>
                                </Row>
                            </div>
                            <div style={{ margin: 8 }}>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <label>体格检查:</label>
                                        <Input.TextArea autosize={{minRows: 6}} name="physical" value={caseobj.physical} onChange={this.onChangeItem}/>
                                    </Col>
                                    <Col span={12}>
                                        <label>辅助检查:</label>
                                        <Input.TextArea autosize={{minRows: 6}} name="examination" value={caseobj.examination} onChange={this.onChangeItem}/>
                                    </Col>
                                </Row>
                                <Row type="flex" align="bottom" >
                                    <Col className="gutter-row" span={16}>
                                        <label>化验单:</label>
                                        <div className="clearfix">
                                            <Upload
                                                action="/api/picture/upload"
                                                listType="picture-card"
                                                fileList={fileListExam}
                                                onPreview={this.handlePicturePreview}
                                                onRemove={this.handlePictureRemove}
                                                onChange={this.handlePictureExamChange}>
                                                {fileListExam.length >= 32 ? null : uploadButton}
                                            </Upload>
                                            <Modal visible={previewVisible} footer={null} onCancel={this.handlePictureCancel}>
                                                <img alt="example" style={{ width: '100%' }} src={previewImage} />
                                            </Modal>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                            <label>诊断:</label>
                            <div style={{ margin: 8 }}>
                                <Row>
                                    <Col span={24}>
                                        <Input
                                            type="text"
                                            style={{ width: '95%' }}
                                            name="diagnosis0" value={caseobj.diagnosis0}
                                            onChange={this.onChangeItem}
                                            addonBefore="1"/>
                                    </Col>
                                </Row>
                            </div>
                            <div style={{ margin: 8 }}>
                                <Row>
                                    <Col span={24}>
                                        <Input
                                            type="text"
                                            style={{ width: '95%' }}
                                            name="diagnosis1"
                                            value={caseobj.diagnosis1}
                                            onChange={this.onChangeItem}
                                            addonBefore="2"/>
                                    </Col>
                                </Row>
                            </div>
                            <div style={{ margin: 8 }}>
                                <Row>
                                    <Col span={24}>
                                        <Input
                                            type="text"
                                            style={{ width: '95%' }}
                                            name="diagnosis2"
                                            value={caseobj.diagnosis2}
                                            onChange={this.onChangeItem}
                                            addonBefore="3"/>
                                    </Col>
                                </Row>
                            </div>
                            <div style={{ margin: 8 }}>
                                <Row>
                                    <Col span={24}>
                                        <Input type="text"
                                            style={{ width: '95%' }}
                                            name="diagnosis3" value={caseobj.diagnosis3}
                                            value={caseobj.diagnosis3}
                                            onChange={this.onChangeItem}
                                            addonBefore="4"/>
                                    </Col>
                                </Row>
                            </div>
                            <Row type="flex" align="bottom" >
                                <Col className="gutter-row" span={16}>
                                    <label>图片:</label>
                                    <div className="clearfix">
                                        <Upload
                                            action="/api/picture/upload"
                                            listType="picture-card"
                                            fileList={fileList}
                                            onPreview={this.handlePicturePreview}
                                            onRemove={this.handlePictureRemove}
                                            onChange={this.handlePictureChange}>
                                            {fileList.length >= 32 ? null : uploadButton}
                                        </Upload>
                                        <Modal visible={previewVisible} footer={null} onCancel={this.handlePictureCancel}>
                                            <img alt="example" style={{ width: '100%' }} src={previewImage} />
                                        </Modal>
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col className="gutter-row" span={24}>
                                    <div className="gutter-box">
                                        <Row>
                                        <label>处方:</label>
                                            <AutoComplete
                                                name="prescribename"
                                                dataSource={dataSourcePrescribe}
                                                style={{ marginLeft:8,marginBottom:8,width:150 }}
                                                onSelect={this.handlePrescribeSelect.bind(this)}
                                                onSearch={this.handlePrescribeSearch.bind(this)}
                                                onChange={this.handlePrescribeChange.bind(this)}
                                                placeholder="输入处方名字"/>
                                        </Row>
                                        <MedicineTable data={this.state.medicines} style={{ width: '95%' }}/>
                                        <Row type="flex" style={{ margin: 8, float: 'right' }}>
                                            <Button style={{ background: '#ececec' }} onClick={this.newPrescribe}>存成处方</Button>
                                        </Row>
                                        <Modal
                                            visible={prescribeflag}
                                            style={{ width: 400, height: 300}}
                                            title="添加处方"
                                            confirmLoading={true}
                                            maskClosable={true}
                                            onCancel={this.onPrescribeNewCancel}
                                            footer={[
                                                <Button key="back" size="small" onClick={this.onPrescribeNewCancel}>取消</Button>,
                                                <Button key="submit" type="primary" style={{color: '#fff','backgroundColor': '#108ee9','borderColor': '#108ee9'}} size="small" onClick={this.onPrescribeNewSave}>
                                                添加
                                                </Button>
                                            ]}>
                                            <Row>
                                                <label>处方名字:</label>
                                                <Input
                                                    style={{width:150,marginLeft:3,marginBottom:8}}
                                                    value={prescribenewname}
                                                    onChange={(e)=>this.onPrescribeNewChange(e, "prescribenewname")}/>
                                            </Row>
                                            <Row>
                                                <label>处方描述:</label>
                                                <Input
                                                    style={{width:350,marginLeft:3}}
                                                    value={prescribenewdesc}
                                                    onChange={(e)=>this.onPrescribeNewChange(e, "prescribenewdesc")}/>
                                            </Row>
                                        </Modal>
                                    </div>
                                </Col>
                            </Row>
                            <Row type="flex" justify="center" align="bottom">
                                <Col>
                                    <Button style={{ background: '#ececec' }} onClick={this.handleSubmit}>提交</Button>
                                </Col>
                            </Row>
                        </Card>
                    </div>
                </Col>
            </Row>
        </div>
        )
    }
}

class CaseNewClass extends React.Component {
    defaultcase = {
        topicid: null,
        name: '',
        first: true,
        date: moment(),
        idnumber: '',
        gender: 'male',
        age: 0,
        ageUnit: 'year',
        phone: '',
        email: '',
        address: '',
        ethnic: '汉族',
        education: '初中',
        married: 'unknown',
        occupation: '农民',
        complaint: '',
        curr_complaint: '',
        past_complaint: '',
        allergic: '',
        experience: '',
        marriage: '',
        menses: '',
        family: '',
        physical: '',
        examination: '',
        exampics: [],
        diagnosis0: '',
        diagnosis1: '',
        diagnosis2: '',
        diagnosis3: '',
        medicines: [],
        pictures: [],
    };

    state = {
        mycase: this.defaultcase
    };

    render() {
        return (
            <CaseBase type="new" mycase={this.state.mycase}/>
        );
    }
}

class CaseEditClass extends React.Component {
    defaultcase = {
        topicid: null,
        name: '',
        first: true,
        date: moment(),
        idnumber: '',
        gender: 'male',
        age: 0,
        ageUnit: 'year',
        phone: '',
        email: '',
        address: '',
        ethnic: '汉族',
        education: '初中',
        married: 'unknown',
        occupation: '农民',
        complaint: '',
        curr_complaint: '',
        past_complaint: '',
        allergic: '',
        experience: '',
        marriage: '',
        menses: '',
        family: '',
        physical: '',
        examination: '',
        exampics: [],
        diagnosis0: '',
        diagnosis1: '',
        diagnosis2: '',
        diagnosis3: '',
        medicines: [],
        pictures: [],
    };

    state = {
        mycase: this.defaultcase
    };

    componentDidMount() {
        var self = this;

        axios.post('/api/case/infoById', {
            _id: this.props.params.id
        })
        .then(function (response) {
            var msg = response.data.msg;

            var mycase = {
                _id: msg._id,
                topicid: null,
                name: msg.name,
                first: msg.first,
                date: moment(msg.date),
                idnumber: msg.idnumber,
                gender: msg.gender,
                age: msg.age,
                ageUnit: msg.ageUnit,
                phone: msg.phone,
                email: msg.email,
                address: msg.address,
                ethnic: msg.ethnic,
                education: msg.education,
                married: msg.married,
                occupation: msg.occupation,
                complaint: msg.complaint,
                curr_complaint: msg.curr_complaint,
                past_complaint: msg.past_complaint,
                allergic: msg.allergic,
                experience: msg.experience,
                marriage: msg.marriage,
                menses: msg.menses,
                family: msg.family,
                physical: msg.physical,
                examination: msg.examination,
                exampics: msg.exampics,
                diagnosis0: msg.diagnosises[0] || '',
                diagnosis1: msg.diagnosises[1] || '',
                diagnosis2: msg.diagnosises[2] || '',
                diagnosis3: msg.diagnosises[3] || '',
                medicines: msg.medicines,
                pictures: msg.pictures,
            };

            self.setState({mycase});
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    render() {
        return (
            <CaseBase type="edit" mycase={this.state.mycase}/>
        );
    }
}

class CaseRecheckClass extends React.Component {
    defaultcase = {
        topicid: null,
        name: '',
        first: true,
        date: moment(),
        idnumber: '',
        gender: 'male',
        age: 0,
        ageUnit: 'year',
        phone: '',
        email: '',
        address: '',
        ethnic: '汉族',
        education: '初中',
        married: 'unknown',
        occupation: '农民',
        complaint: '',
        curr_complaint: '',
        past_complaint: '',
        allergic: '',
        experience: '',
        marriage: '',
        menses: '',
        family: '',
        physical: '',
        examination: '',
        exampics: [],
        diagnosis0: '',
        diagnosis1: '',
        diagnosis2: '',
        diagnosis3: '',
        medicines: [],
        pictures: [],
    };

    state = {
        mycase: this.defaultcase,
        history: null,
        historyedit: true,
    };

    componentDidMount() {
        var self = this;

        axios.post('/api/case/infoById', {
            _id: this.props.params.id
        })
        .then(function (response) {
            var msg = response.data.msg;

            var age = 0;
            var ageUnit = 'year';
            var now = moment();
            var daydiff = now.diff(moment(msg.birthdate), 'days');

            if (daydiff < 180) {
                age = daydiff;
                ageUnit = "day";
            } else if (daydiff < 365) {
                var monthdiff = now.diff(moment(msg.birthdate), 'months');
                age = monthdiff;
                ageUnit = 'month';
            } else {
                var yeardiff = now.diff(moment(msg.birthdate), 'years');
                age = yeardiff;
                ageUnit = 'year';
            }

            var mycase = {
                _id: msg._id,
                topicid: msg._id,
                name: msg.name,
                first: msg.first,
                date: moment(),
                idnumber: msg.idnumber,
                gender: msg.gender,
                age: age,
                ageUnit: ageUnit,
                phone: msg.phone,
                email: msg.email,
                address: msg.address,
                ethnic: msg.ethnic,
                education: msg.education,
                married: msg.married,
                occupation: msg.occupation,
                complaint: msg.complaint,
                curr_complaint: msg.curr_complaint,
                past_complaint: msg.past_complaint,
                allergic: msg.allergic,
                experience: msg.experience,
                marriage: msg.marriage,
                menses: msg.menses,
                family: msg.family,
                physical: msg.physical,
                examination: msg.examination,
                exampics: [],
                diagnosis0: msg.diagnosises[0] || '',
                diagnosis1: msg.diagnosises[1] || '',
                diagnosis2: msg.diagnosises[2] || '',
                diagnosis3: msg.diagnosises[3] || '',
                medicines: [],
                pictures: [],
            };

            axios.post('/api/history/infoByTopicId', {
                topicid: msg.topicid
            })
            .then(function (response) {
                var history = null;

                if (response.data.status == 0) {
                    history = response.data.msg;
                }

                self.setState({
                    mycase: mycase,
                    history: history,
                });
            })
            .catch(function (error) {
                console.log(error);
            });
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    onHistoryCreate() {
        var self = this;
        const { mycase } = this.state;

        if (!mycase.topicid) {
            message.error("原始病例不存在!");
            return;
        }

        axios.post('/api/case/topic', {
            topicid: mycase.topicid
        })
        .then(function (response) {
            if ((response.data.status != 0) || (response.data.msg.length == 0)){
                message.error("原始病例不存在!");
                return;
            }

            var cases = response.data.msg;
            var history = {
                _id: null, // 还没保存
                topicid: cases[0].topicid,
                name: cases[0].name,
                date: cases[0].date,
                idnumber: cases[0].idnumber,
                gender: cases[0].gender,
                age: cases[0].age,
                ageUnit: cases[0].ageUnit,
                birthdate: cases[0].birthdate,
                phone: cases[0].phone,
                email: cases[0].emal,
                address: cases[0].address,
                ethnic: cases[0].ethnic,
                education: cases[0].education,
                married: cases[0].marriage,
                occupation: cases[0].occupation,
                text: '',
            };

           var age = '';

            if (cases[0].ageUnit == 'day') {
                age = cases[0].age + "天";
            } else if (cases[0].ageUnit == 'month') {
                age = cases[0].age + "个月";
            } else {
                age = cases[0].age + "岁";
            }

            cases.map(function(item) {
                history.text += `${gender2str(item.gender)}  ${age} ${item.occupation} ${item.education} ${item.ethnic}`;
                history.text += "\n";
                history.text += `===  ${moment(item.date).format("YYYY-MM-DD HH:MM:SS")}  ===`;
                history.text += "\n";
                history.text += `主诉: ${item.complaint}`;
                history.text += "\n";
                history.text += `现病史: ${item.curr_complaint}`;
                history.text += "\n";
                history.text += `药物过敏史: ${item.allergic}`;
                history.text += "\n";
                history.text += `婚育史: ${item.marriage}`;
                history.text += "\n";
                history.text += `月经史: ${item.menses}`;
                history.text += "\n";
                history.text += `家庭史: ${item.family}`;
                history.text += "\n";
                history.text += `体格检查: ${item.physical}`;
                history.text += "\n";
                history.text += `辅助检查: ${item.examination}`;
                history.text += "\n";
                history.text += `治疗意见: `;
                history.text += "\n";
            });

            self.setState({
                historyedit: true,
                history: history,
            });
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    onHistoryEdit() {
        var historyedit = true;
        this.setState({historyedit});
    }

    onHistoryChange = (e) => {
        const { history } = this.state;
        history.text = e.target.value;
        this.setState({history});
    }

    onHistorySave() {
        var self = this;
        const {history} = this.state;
        var apipath = !history._id ? '/api/history/new' : '/api/history/modify';

        axios.post(apipath, {
            _id: history._id,
            topicid: history.topicid,
            name: history.name,
            date: history.date,
            idnumber: history.idnumber,
            gender: history.gender,
            age: history.age,
            ageUnit: history.ageUnit,
            birthdate: history.birthdate,
            phone: history.phone,
            email: history.emal,
            address: history.address,
            ethnic: history.ethnic,
            education: history.education,
            married: history.marriage,
            occupation: history.occupation,
            text: history.text,
        })
        .then(function (response) {
            if (response.data.status != 0) {
                message.error(response.data.msg);
                return;
            }

            message.success('保存成功!');

            history._id = response.data.msg._id;

            self.setState({
                // historyedit: false,
                history: history,
            });
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    onHistoryCancel() {
        var historyedit = false;
        this.setState({historyedit});
    }

    render() {
        var i = 0;
        const { mycase, history, historyedit } = this.state;

        return (
            <div>
                <CaseBase type="recheck" mycase={mycase}/>
                <Row gutter={16}>
                    <Col className="gutter-row" span={20}>
                        <div className="gutter-box">
                            <Card title="病程记录" bordered={false}>
                            {
                                !history
                                ? <Button onClick={()=>this.onHistoryCreate()}>建立病程记录</Button>
                                : (
                                    historyedit ?
                                    <div>
                                        <Input.TextArea
                                            style={{marginBottom:8,width:'80%'}}
                                            autosize={{minRows:25,maxRows:25}}
                                            value={history.text}
                                            onChange={this.onHistoryChange}/>
                                        <Row style={{margin:8}} type="flex" justify="center">
                                            <Button size="small" onClick={()=>this.onHistoryCancel()}>取消</Button>
                                            <Button size="small"onClick={()=>this.onHistorySave()}>保存</Button>
                                        </Row>
                                    </div>
                                    :
                                    <div>
                                        <Row style={{margin:4}} align="center">
                                            <Col span={20}>
                                                <pre>{history.text}</pre>
                                            </Col>
                                            <Col span={4}>
                                                <Button type="dashed" size="small" onClick={()=>this.onHistoryEdit()}>编辑</Button>
                                            </Col>
                                        </Row>
                                    </div>
                                )
                            }
                            </Card>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

export let CaseNew = CaseNewClass;
export let CaseEdit = CaseEditClass;
export let CaseRecheck = CaseRecheckClass;