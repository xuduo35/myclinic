import axios from 'axios';
import React from 'react';
import { hashHistory } from 'react-router';
import { Switch, Row, Col, Card, Upload, Modal, Popconfirm, Pagination, Input, InputNumber, Select, Button, message, DatePicker, Checkbox, Icon } from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom';
import { Table } from 'antd';
import moment from 'moment';
import { gender2str } from '../../utils';
import CopyToClipboard from 'react-copy-to-clipboard';
var _ = require('lodash');

const { MonthPicker, RangePicker } = DatePicker;
const Option = Select.Option;
const InputGroup = Input.Group;

class CaseList extends React.Component {
    state = {
        pageSize: 10,
        pageNumber: 1,
        totalRows: 0,
        searchfeedback: 'all',
        searchkey: '',
        searchtype: 'name',
        searchgender: 'all',
        searchageflag: false,
        searchagelow: 0,
        searchagehigh: 100,
        daterangeflag: false,
        daterange: [moment('2000/01/01', 'YYYY/MM/DD'), moment()],
        data: [],
        originalData: [],
        previewVisible: false,
        previewImage: '',
        switcherOn: false,
        allOpened: false,
        allEditable: true,
        siteurl: ''
    };

    columns = [
        { title: '姓名', dataIndex: 'name', key: 'name', render: (text, record, index) => {
            var row = this.state.originalData[record.key];
            var allergic = row.allergic.replace(/(^\s+)|(\s+$)/g, "");

            if ((allergic != "") && (allergic != "无")) {
                return (
                    <div>
                        <CopyToClipboard text={this.state.siteurl+'/#/app/case/view/'+record._id}>
                          <Button style={{'borderStyle':'none'}}><font color="red">{text}</font></Button>
                        </CopyToClipboard>
                    </div>
                    );
            }

            return (
                <div>
                        <CopyToClipboard text={this.state.siteurl+'/#/app/case/view/'+record._id}>
                          <Button style={{'borderStyle':'none'}}>{text}</Button>
                        </CopyToClipboard>
                </div>
                );
        }},
        { title: '性别', dataIndex: 'gender', key: 'gender' },
        { title: '年龄', dataIndex: 'age', key: 'age' },
        { title: '初诊', dataIndex: 'first', key: 'first' },
        { title: '主诉', dataIndex: 'complaint', key: 'complaint' },
        { title: '电话', dataIndex: 'phone', key: 'phone' },
        { title: '住址', dataIndex: 'address', key: 'address' },
        { title: '身份证号', dataIndex: 'idnumber', key: 'idnumber' },
        { title: '日期', dataIndex: 'date', key: 'date' },
        { title: '效果', dataIndex: 'feedback', key: 'feedback', render: (text, record, index) => {
            var feedbackstr = ["未知", "效差", "有效", "良效" , "大效", "痊愈"][text];
            var feedbackcolor = ["gray", "orange", "green", "blue", "brown", "red"][text];
            return (
                <div>
                <p><font color={feedbackcolor}>{feedbackstr}</font></p>
                </div>
                );
        }},
        { title: '操作', dataIndex: '', key: 'operation', render: (text, record, index) => {
            return (
                <div className="editable-row-operations">
                    <a href={"#/app/case/edit/"+record._id}>编辑</a>
                    <a href={"#/app/case/recheck/"+record._id}>复诊</a>
                    <Popconfirm title="确定删除?" onConfirm={() => this.remove(index)}>
                        <a>删除</a>
                    </Popconfirm>
                </div>
                );
        }},
    ];

    componentDidMount() {
        var allOpenedStr = localStorage.getItem('allOpenedCase');
        var allOpened = JSON.parse((allOpenedStr != null) ?  allOpenedStr : "false");
        var allEditableStr = localStorage.getItem('allEditableCase');
        var allEditable = JSON.parse((allEditableStr != null) ?  allEditableStr : "false");

        this.state.allOpened = allOpened;
        this.state.allEditable = allEditable;

        var self = this;

        axios.post('/api/site/home', {})
        .then(function (response) {
            if (response.data.status == 0) {
                self.state.siteurl = response.data.msg;
                self.onPageChange(self.state.pageNumber);
            } else {
                message.error(response.data.msg);
            }
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    handlePictureCancel = () => this.setState({ previewVisible: false })

    handlePicturePreview = (file) => {
        this.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true,
        });
    }

    setFeedback(_id, feedback) {
        var self = this;

        axios.post('/api/case/feedback', {
            _id: _id,
            feedback: feedback
        })
        .then(function (response) {
            if (response.data.status == 0) {
                self.onPageChange(self.state.pageNumber);
            } else {
                message.error(response.data.msg);
            }
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    expandedRowRender(record) {
        var self = this;
        var row = this.state.originalData[record.key];
        var { previewVisible, previewImage } = this.state;
        var fileList = [];
        var fileListExam = [];
        var i = 0;

        row.pictures.map(function(item) {
            fileList.push({
                uid: fileList.length,
                name: 'thumb.png',
                status: 'done',
                url: item,
            });
        });

        row.exampics.map(function(item) {
            fileListExam.push({
                uid: fileListExam.length,
                name: 'thumb.png',
                status: 'done',
                url: item,
            });
        });

        return (
            <div>
                <Row type="flex" style={{float:'right'}}>
                    <Col>
                        {
                            ["gray", "orange", "green", "blue", "brown", "red"].map(function(item, index) {
                                if (index > record.feedback) {
                                    return (
                                        <Popconfirm key={index} title="确定修改?" onConfirm={()=>self.setFeedback(row._id, index)}>
                                            <Icon type="star-o" style={{ fontSize: 16, color: 'gray' }} />
                                        </Popconfirm>
                                            );
                                } else {
                                    return (
                                        <Popconfirm key={index} title="确定修改?" onConfirm={()=>self.setFeedback(row._id, index)}>
                                            <Icon type="star-o" style={{ fontSize: 16, color: item }} />
                                        </Popconfirm>
                                        );
                                }
                            })
                        }
                    </Col>
                </Row>
                <p>{gender2str(row.gender)}  {record.age}  {row.occupation} {row.education} {row.ethnic}</p>
                <p>===  {moment(record.date).format("YYYY-MM-DD HH:MM:SS")}  ===</p>
                <p>主诉: {record.complaint}</p>
                <pre style={{whiteSpace:'pre-wrap',wordWrap:'break-word'}}>现病史: {row.curr_complaint}</pre>
                <pre style={{whiteSpace:'pre-wrap',wordWrap:'break-word'}}>既往史: {row.past_complaint}</pre>
                <pre style={{whiteSpace:'pre-wrap',wordWrap:'break-word'}}>药物过敏史: <font color='red'>{row.allergic}</font></pre>
                <pre style={{whiteSpace:'pre-wrap',wordWrap:'break-word'}}>个人史: {row.experience}</pre>
                <pre style={{whiteSpace:'pre-wrap',wordWrap:'break-word'}}>婚育史: {row.marriage}</pre>
                <pre style={{whiteSpace:'pre-wrap',wordWrap:'break-word'}}>月经史: {row.menses}</pre>
                <pre style={{whiteSpace:'pre-wrap',wordWrap:'break-word'}}>家庭史: {row.family}</pre>
                <pre style={{whiteSpace:'pre-wrap',wordWrap:'break-word'}}>体格检查: {row.physical}</pre>
                <pre style={{whiteSpace:'pre-wrap',wordWrap:'break-word'}}>辅助检查: {row.examination}</pre>
                <Row>
                    <Upload
                        action=""
                        listType="picture-card"
                        showUploadList={{showRemoveIcon:false}}
                        fileList={fileListExam}
                        onPreview={this.handlePicturePreview}>
                    </Upload>
                </Row>
                <pre style={{whiteSpace:'pre-wrap',wordWrap:'break-word'}}>诊断: </pre>
                {
                    row.diagnosises.map(function(item, idx) {
                        return (<pre key={i++}>&nbsp;&nbsp;&nbsp;{idx+1+""}. {item} </pre>);
                    })
                }
                <pre style={{whiteSpace:'pre-wrap',wordWrap:'break-word'}}>治疗意见: </pre>
                {
                    row.medicines.map(function(item) {
                        return (
                            <pre key={i++}>
                                {item.name + ': ' + item.dose + item.unit + '*' + item.freqdaily + '次*' + item.days + '天 ' + item.usage}
                            </pre>
                            );
                    })
                }
                <Row>
                    <Upload
                        action=""
                        listType="picture-card"
                        showUploadList={{showRemoveIcon:false}}
                        fileList={fileList}
                        onPreview={this.handlePicturePreview}>
                    </Upload>
                </Row>
                <Modal visible={previewVisible} footer={null} onCancel={this.handlePictureCancel}>
                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal>
            </div>
        );
    }

    onPageChange(pageNumber) {
        var self = this;
        const {
            searchfeedback,
            searchkey, searchtype,
            searchgender,
            searchageflag, searchagelow, searchagehigh,
            daterangeflag, daterange,
        } = this.state;

        axios.post('/api/case/list', {
            searchfeedback: searchfeedback,
            searchkey: searchkey,
            searchtype: searchtype,
            searchgender: searchgender,
            searchageflag: searchageflag,
            searchagelow: searchagelow,
            searchagehigh: searchagehigh,
            daterangeflag: daterangeflag,
            daterange: daterange,
            ps: this.state.pageSize,
            pn: pageNumber,
        })
        .then(function (response) {
            var cases = response.data.msg.data;
            var msg = [];

            for (var i = 0; i < cases.length; i++) {
                var age = '';

                if (cases[i].ageUnit == 'day') {
                    age = cases[i].age + "天";
                } else if (cases[i].ageUnit == 'month') {
                    age = cases[i].age + "个月";
                } else {
                    age = cases[i].age + "岁";
                }

                msg.push({
                    key: i,
                    _id: cases[i]._id,
                    name: cases[i].name,
                    gender: gender2str(cases[i].gender),
                    age: age,
                    first: cases[i].first ? "初诊" : "复诊",
                    complaint: cases[i].complaint,
                    phone: cases[i].phone,
                    address: cases[i].address,
                    idnumber: cases[i].idnumber,
                    date: moment(cases[i].date).format("YYYY-MM-DD HH:MM:SS"),
                    feedback: cases[i].feedback,
                });
            }

            self.setState({
                data: msg,
                originalData: cases,
                totalRows: response.data.msg.total,
                pageNumber: pageNumber,
            });
        })
        .catch(function (error) {
                console.log(error);
        });
    }

    edit(index) {

    }

    remove(index) {
        var self = this;
        const { data } = this.state;

        axios.post('/api/case/remove', {
            _id: data[index]._id,
        })
        .then(function (response) {
            if (response.data.status != 0) {
                message.error(response.data.msg);
                return;
            }

            self.onPageChange(self.state.pageNumber);
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    onFeedbackSelect = (value, option) => {
        this.setState({searchfeedback:value}, ()=> {
            this.onPageChange(this.state.pageNumber);
        });
    }

    onSearchKeyChange(e) {
        this.setState({searchkey:e.target.value}, ()=> {
            this.onPageChange(this.state.pageNumber);
        });
    }

    onSearchPressed = () => {
        this.onPageChange(this.state.pageNumber); // 只起到刷新的作用
    }

    onSearchSelect = (value, option) => {
        this.setState({searchtype:value}, ()=> {
            this.onPageChange(this.state.pageNumber);
        });
    }

    onGenderSelect = (value, option) => {
        this.setState({searchgender:value}, ()=> {
            this.onPageChange(this.state.pageNumber);
        });
    }

    onAgeFlagChange = (e) =>  {
        this.setState({searchageflag:e.target.checked}, ()=> {
            this.onPageChange(this.state.pageNumber);
        });
    }

    onAgeLowChange = (value) => {
        this.setState({searchagelow:value}, ()=> {
            this.onPageChange(this.state.pageNumber);
        });
    }

    onAgeHighChange = (value) => {
        this.setState({searchagehigh:value}, ()=> {
            this.onPageChange(this.state.pageNumber);
        });
    }

    onDateRangeFlagChange = (e) =>  {
        this.setState({daterangeflag:e.target.checked}, ()=> {
            this.onPageChange(this.state.pageNumber);
        });
    }

    onDateRangeChange = (dates, dateStrings) =>  {
        this.setState({daterange:dates}, ()=> {
            this.onPageChange(this.state.pageNumber);
        });
    }

    switcherOn = () => {
        this.setState({
            switcherOn: !this.state.switcherOn
        })
    };

    onAllOpenedSwitch = (allOpened) => {
        this.setState({allOpened}, () => {
            localStorage.setItem('allOpenedCase', JSON.stringify(allOpened));
        })
    };

    onAllEditableSwitch = (allEditable) => {
        this.setState({allEditable}, () => {
            localStorage.setItem('allEditableCase', JSON.stringify(allEditable));
        })
    };

    render() {
        const {
            data, pageSize, pageNumber, totalRows, searchfeedback, searchkey, searchtype, searchgender, searchageflag, searchagelow, searchagehigh,
            daterangeflag, daterange,
            switcherOn, allOpened, allEditable,
        } = this.state;

        return (
            <div className="gutter-example">
                <BreadcrumbCustom first="病例" second="列表" />
                <div className={`switcher dark-white ${switcherOn ? 'active' : ''}`}>
                    <a className="sw-btn dark-white" onClick={this.switcherOn}>
                        <Icon type="setting" className="text-dark" />
                    </a>
                    <div style={{padding: '1rem'}} className="clear">
                        <div className="pull-left y-center mr-m mb-s">
                            <label>缺省展开</label>
                            <Switch checked={allOpened} onChange={() => this.onAllOpenedSwitch(!allOpened)} />
                        </div>
                    </div>
                    <div style={{padding: '1rem'}} className="clear">
                        <div className="pull-left y-center mr-m mb-s">
                            <label>缺省编辑</label>
                            <Switch checked={allEditable} onChange={() => this.onAllEditableSwitch(!allEditable)} />
                        </div>
                    </div>
                    <div style={{padding: '1rem'}} className="clear">
                        <div className="pull-left y-center mr-m mb-s">
                            <a href="javascript:scrollTo(0,0);"><Icon style={{fontSize: 20}}  className="text-dark" type="up-square" /></a>
                        </div>
                    </div>
                </div>
                <Row gutter={14}>
                    <Col className="gutter-row">
                        <div className="gutter-box">
                            <Row style={{marginBottom:8}}>
                                <Col span={6}>
                                    <Select style={{width:60}} onSelect={this.onFeedbackSelect} value={searchfeedback}>
                                        <Option value="all">全部</Option>
                                        <Option value="fb0">未知</Option>
                                        <Option value="fb1">效差</Option>
                                        <Option value="fb2">有效</Option>
                                        <Option value="fb3">良效</Option>
                                        <Option value="fb4">大效</Option>
                                        <Option value="fb5">痊愈</Option>
                                    </Select>
                                    <Select style={{width:80,marginLeft:8}} onSelect={this.onSearchSelect} value={searchtype}>
                                        <Option value="name">名字</Option>
                                        <Option value="idnumber">身份证号</Option>
                                        <Option value="phone">手机号</Option>
                                        <Option value="address">住址</Option>
                                        <Option value="complaint">主诉</Option>
                                    </Select>
                                    <Input
                                        style={{width:100,marginLeft:8}}
                                        value={searchkey}
                                        onChange={e => this.onSearchKeyChange(e)}
                                        placeholder='关键字'/>
                                </Col>
                                <Col span={18}>
                                    <Row type="flex">
                                        <Col style={{marginLeft:8}}>
                                            <label>性别:</label>
                                            <Select style={{width:80,marginLeft:8}} onSelect={this.onGenderSelect} value={searchgender}>
                                                <Option value="all">全部</Option>
                                                <Option value="male">男</Option>
                                                <Option value="female">女</Option>
                                                <Option value="unknown">未知</Option>
                                            </Select>
                                        </Col>
                                        <Col style={{marginLeft:8,marginTop:3}}>
                                            <Checkbox value={searchageflag} onChange={this.onAgeFlagChange}>年龄:</Checkbox>
                                        </Col>
                                        <Col style={{marginLeft:8}}>
                                            <InputGroup compact>
                                              <Col>
                                                <InputNumber min={0} max={150} style={{width:50}} value={searchagelow} onChange={this.onAgeLowChange}/>
                                              </Col>
                                              <Col>
                                                <InputNumber min={0} max={150} style={{width:50,marginLeft:8}} value={searchagehigh} onChange={this.onAgeHighChange}/>
                                              </Col>
                                            </InputGroup>
                                        </Col>
                                        <Col style={{marginLeft:8,marginTop:3}}>
                                            <Checkbox value={daterangeflag} onChange={this.onDateRangeFlagChange}>日期:</Checkbox>
                                        </Col>
                                        <Col style={{marginLeft:8}}>
                                            <RangePicker
                                              defaultValue={[moment('2000/01/01', 'YYYY/MM/DD'), moment()]}
                                              showTime={true}
                                              onChange={this.onDateRangeChange}
                                              format={'YYYY/MM/DD'}/>
                                        </Col>
                                        <Col>
                                            <Button style={{marginLeft:3}} onClick={()=>this.onSearchPressed()}>搜索</Button>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Card bordered={false}>
                            {data && data.length ?
                                <Table
                                    defaultExpandAllRows={allOpened}
                                    columns={this.columns}
                                    expandedRowRender={this.expandedRowRender.bind(this)}
                                    dataSource={data}
                                    pagination={false}/>
                                : '暂无数据'
                            }
                            </Card>
                            <Row type="flex" justify="end" align="bottom">
                                <Pagination
                                    showQuickJumper={true}
                                    showTotal={total => `总共${total}项`}
                                    onChange={this.onPageChange.bind(this)}
                                    style={{margin:20}}
                                    pageSize={pageSize}
                                    current={pageNumber}
                                    total={totalRows}/>
                            </Row>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default CaseList;