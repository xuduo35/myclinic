import axios from 'axios';
import React from 'react';
import { hashHistory } from 'react-router';
import { Row, Col, Card, Upload, Modal, Popconfirm, Pagination, Input, InputNumber, Select, Button, message, DatePicker, Checkbox, Icon } from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom';
import { Table } from 'antd';
import moment from 'moment';
import { gender2str } from '../../utils';
var _ = require('lodash');

const { MonthPicker, RangePicker } = DatePicker;
const Option = Select.Option;
const InputGroup = Input.Group;

class HistoryList extends React.Component {
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
    };

    columns = [
        { title: '姓名', dataIndex: 'name', key: 'name' },
        { title: '性别', dataIndex: 'gender', key: 'gender' },
        { title: '年龄', dataIndex: 'age', key: 'age' },
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
                    <Popconfirm title="确定删除?" onConfirm={() => this.remove(index)}>
                        <a>删除</a>
                    </Popconfirm>
                </div>
                );
        }},
    ];

    componentDidMount() {
        this.onPageChange(this.state.pageNumber);
    }

    onHistoryEdit(record) {
        const {data} = this.state;
        record.editable = true;
        this.setState({data});
    }

    onHistoryChange = (record, e) => {
        const { data } = this.state;
        record.text = e.target.value;
        this.setState({data});
    }

    onHistorySave(record) {
        var self = this;
        const {data} = this.state;

        axios.post('/api/history/modify', {
            _id: record._id,
            text: record.text,
        })
        .then(function (response) {
            if (response.data.status != 0) {
                message.error(response.data.msg);
                return;
            }

            message.success('保存成功!');

            // record.editable = false;
            self.setState({data});
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    onHistoryCancel(record) {
        const {data} = this.state;
        record.editable = false;
        this.setState({data});
    }

    setFeedback(_id, feedback) {
        var self = this;

        axios.post('/api/history/feedback', {
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

        return (
            record.editable ?
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
                <Input.TextArea
                    style={{marginBottom:8,width:'80%'}}
                    autosize={{minRows:25,maxRows:25}}
                    value={record.text}
                    onChange={(e) => this.onHistoryChange(record, e)}/>
                <Row style={{margin:8}} type="flex" justify="center">
                    <Button size="small" onClick={()=>this.onHistoryCancel(record)}>取消</Button>
                    <Button size="small"onClick={()=>this.onHistorySave(record)}>保存</Button>
                </Row>
            </div>
            :
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
                <Row style={{margin:4}} align="center">
                    <Col span={20}>
                        <pre>{record.text}</pre>
                    </Col>
                    <Col span={4}>
                        <Button type="dashed" size="small" onClick={()=>this.onHistoryEdit(record)}>编辑</Button>
                    </Col>
                </Row>
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
            daterangeflag, daterange
        } = this.state;

        axios.post('/api/history/list', {
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
            var historys = response.data.msg.data;
            var msg = [];

            for (var i = 0; i < historys.length; i++) {
                var age = '';

                if (historys[i].ageUnit == 'day') {
                    age = historys[i].age + "天";
                } else if (historys[i].ageUnit == 'month') {
                    age = historys[i].age + "个月";
                } else {
                    age = historys[i].age + "岁";
                }

                msg.push({
                    key: i,
                    _id: historys[i]._id,
                    topicid: historys[i].topicid,
                    name: historys[i].name,
                    date: moment(historys[i].date).format("YYYY-MM-DD HH:MM:SS"),
                    idnumber: historys[i].idnumber,
                    gender: gender2str(historys[i].gender),
                    age: age,
                    phone: historys[i].phone,
                    address: historys[i].address,
                    ethnic: historys[i].ethnic,
                    education: historys[i].education,
                    married: historys[i].marriage,
                    occupation: historys[i].occupation,
                    text: historys[i].text,
                    feedback: historys[i].feedback,
                    editable: true,
                });
            }

            self.setState({
                data: msg,
                originalData: historys,
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

        axios.post('/api/history/remove', {
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

    render() {
        const {
            data, pageSize, pageNumber, totalRows, searchfeedback, searchkey, searchtype, searchgender, searchageflag, searchagelow, searchagehigh,
            daterangeflag, daterange,
        } = this.state;

        return (
            <div className="gutter-example">
                <BreadcrumbCustom first="病程记录" second="列表" />
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
                                    <Select style={{width:80}} onSelect={this.onSearchSelect} value={searchtype}>
                                        <Option value="name">名字</Option>
                                        <Option value="idnumber">身份证号</Option>
                                        <Option value="phone">手机号</Option>
                                        <Option value="address">住址</Option>
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
                                <Table
                                    columns={this.columns}
                                    expandedRowRender={this.expandedRowRender.bind(this)}
                                    dataSource={data}
                                    pagination={false}/>
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

export default HistoryList;