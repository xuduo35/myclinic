import axios from 'axios';
import React from 'react';
import { Switch, Icon, Row, Col, Card, Upload, Modal, Popconfirm, Input, Pagination, Select, Button, message } from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom';
import { Table } from 'antd';
import moment from 'moment';
import { getEveryPrice, myParseInt, myParseFloat } from '../../utils';
import MedicineTable from '../case/MedicineTable';
var _ = require('lodash');

const Option = Select.Option;

class PrescribeNameCell extends React.Component {
    state = {
        value: this.props.value,
        editable: this.props.editable || false
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.editable !== this.state.editable) {
            this.setState({ editable: nextProps.editable });
            if (nextProps.editable) {
                this.cacheValue = this.state.value;
            }
        }
        if (nextProps.status && nextProps.status !== this.props.status) {
            if (nextProps.status === 'save') {
                this.props.onChange(this.state.value);
            } else if (nextProps.status === 'cancel') {
                this.setState({ value: this.cacheValue });
                this.props.onChange(this.cacheValue);
            }
        }

        if (nextProps.value !== this.state.value) {
            this.setState({
                value: nextProps.value
            });
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.editable !== this.state.editable ||
            nextState.value !== this.state.value;
    }

    handleChange(e) {
        const value = e.target.value;
        this.setState({ value });
        this.props.onChange(value);
    }

    render() {
        const { value, editable } = this.state;
        return (
            <div>
                {
                    editable ?
                        <div>
                            <Input
                                value={value}
                                onChange={e => this.handleChange(e)}
                                placeholder={this.props.placeholder}/>
                        </div>
                        :
                        <div className="editable-row-text">
                            {(typeof value != 'undefined') ? value.toString() : ' '}
                        </div>
                }
            </div>
        );
    }
}

class PrescribeCell extends React.Component {
    state = {
        value: this.props.value,
        editable: this.props.editable || false
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.editable !== this.state.editable) {
            this.setState({ editable: nextProps.editable });
            if (nextProps.editable) {
                this.cacheValue = this.state.value;
            }
        }
        if (nextProps.status && nextProps.status !== this.props.status) {
            if (nextProps.status === 'save') {
                this.props.onChange(this.state.value);
            } else if (nextProps.status === 'cancel') {
                this.setState({ value: this.cacheValue });
                this.props.onChange(this.cacheValue);
            }
        }

        if (nextProps.value !== this.state.value) {
            this.setState({
                value: nextProps.value
            });
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.editable !== this.state.editable ||
            nextState.value !== this.state.value;
    }

    handleChange(e) {
        const value = e.target.value;
        this.setState({ value });
        this.props.onChange(value);
    }

    render() {
        const { value, editable } = this.state;
        return (
            <div>
                {
                    editable ?
                        <div>
                            <Input
                                value={value}
                                onChange={e => this.handleChange(e)}
                                placeholder={this.props.placeholder}/>
                        </div>
                        :
                        <div className="editable-row-text">
                            {(typeof value != 'undefined') ? value.toString() : ' '}
                        </div>
                }
            </div>
        );
    }
}

class PrescribeList extends React.Component {
    constructor(props) {
        super(props);

        this.columns = [{
            title: '名称',
            dataIndex: 'name',
            width: '15%',
            render: (text, record, index) => this.renderColumns(this.state.data, index, 'name', text),
        }, {
            title: '描述',
            dataIndex: 'desc',
            width: '50%',
            render: (text, record, index) => this.renderColumns(this.state.data, index, 'desc', text),
        }, {
            title: '操作',
            dataIndex: 'operation',
            render: (text, record, index) => {
                const { editable } = this.state.data[index];
                return (
                    <div className="editable-row-operations">
                        {
                            editable ?
                                <span>
                                  <a onClick={() => this.editDone(index, 'save')}>保存</a>
                                  <Popconfirm title="确定取消?" onConfirm={() => this.editDone(index, 'cancel')}>
                                    <a>取消</a>
                                  </Popconfirm>
                                </span>
                                :
                                <span>
                                  <a onClick={() => this.edit(index)}>编辑</a>
                                  <Popconfirm title="确定删除?" onConfirm={() => this.remove(index)}>
                                    <a>删除</a>
                                  </Popconfirm>
                                </span>
                        }
                    </div>
                );
            },
        }];

        this.state = {
            data: [],
            pageSize: 10,
            pageNumber: 1,
            searchkey: '',
            totalRows: 0,
            prescribeflag: false,
            prescribenewname: '',
            prescribenewdesc: '',
            switcherOn: false,
            allOpened: false,
            allEditable: true,
        };

        this.keyIdx = 0;
    }

    componentDidMount() {
        var allOpenedStr = localStorage.getItem('allOpenedPrescribe');
        var allOpened = JSON.parse((allOpenedStr != null) ?  allOpenedStr : "false");
        var allEditableStr = localStorage.getItem('allEditablePrescribe');
        var allEditable = JSON.parse((allEditableStr != null) ?  allEditableStr : "false");

        this.state.allOpened = allOpened;
        this.state.allEditable = allEditable;

        this.onPageChange(this.state.pageNumber);
    }

    newPrescribe = () => {
        this.state.prescribeflag = true;
        this.setState(this.state);
    };

    edit(index) {
        const { data } = this.state;
        data[index].editable = true;
        this.setState({ data });
    }

    remove(index) {
        var self = this;
        const { data } = this.state;

        axios.post('/api/prescribe/remove', {
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

    editDone(index, type) {
        if (type == 'cancel') {
            this.onPageChange(this.state.pageNumber); // xxx: 偷懒的做法
            return;
        }

        var self = this;
        const { data } = this.state;

        if (_(data[index].name).trim() == '') {
            message.error('名称以不能为空!');
            return;
        }

        axios.post('/api/prescribe/modify', {
            _id: data[index]._id,
            name: _(data[index].name).trim(),
            desc: _(data[index].desc).trim(),
        })
        .then(function (response) {
            if (response.data.status != 0) {
                message.error(response.data.msg);
                return;
            }

            data[index].editable = false;
            delete data[index].status;
            self.setState({ data });
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    handleChange(key, index, value) {
        const { data } = this.state;
        data[index][key] = value;
        this.setState({ data });
    }

    renderColumns(data, index, key, text) {
        const { editable, status } = data[index];

        if (typeof editable === 'undefined') {
            return text;
        }

        if (key == 'name') {
            return (
                <PrescribeNameCell
                    editable={editable}
                    value={text}
                    onChange={value => this.handleChange(key, index, value)}
                    status={status}/>
            );
        } else {
            return (
                <PrescribeCell
                    editable={editable}
                    value={text}
                    onChange={value => this.handleChange(key, index, value)}
                    status={status}/>
            );
        }
    }

    onMedsEdit = (record) => {
        var self = this;
        const { data } = this.state;

        record.medstable = [];

        record.medicines.map(function(item) {
            record.medstable.push({
                key: record.medicines.indexOf(item), // xxx
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

        record.editmeds = true;
        this.setState({data});
    }

    onMedsCancel = (record) => {
        const { data } = this.state;
        record.editmeds = false;
        delete record.medstable;
        this.setState({data});
    }

    onMedsSave = (record) => {
        const { data } = this.state;
        var self = this;

        var medicines = [];

        record.medstable.map(function(medicine) {
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

        axios.post('/api/prescribe/modify', {
            _id: record._id,
            medicines: medicines,
        })
        .then(function (response) {
            delete record.medstable;
            record.medicines = medicines;
            record.editmeds = false;
            self.setState({data});
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    expandedRowRender(record) {
        var i = 0;

        return (
            <div>
                {
                    !record.editmeds ?
                        <div>
                            <Row style={{float:'right'}}>
                                <Col>
                                    <Button type="dashed" size="small" onClick={()=>this.onMedsEdit(record)}>编辑</Button>
                                </Col>
                            </Row>
                            {
                                record.medicines.map(function(item) {
                                    return (
                                        <p key={i++}>
                                            {item.name + ': ' + item.dose + item.unit + '*' + item.freqdaily + '次*' + item.days + '天 ' + item.usage}
                                        </p>
                                        );
                                })
                            }
                        </div>
                        :
                        <div>
                            <MedicineTable data={record.medstable} style={{ width: '95%' }}/>
                            <Row style={{margin:8}} type="flex" justify="center">
                                <Button size="small" onClick={()=>this.onMedsCancel(record)}>取消</Button>
                                <Button size="small"onClick={()=>this.onMedsSave(record)}>保存</Button>
                            </Row>
                        </div>
                }
            </div>
            );
    }

    onPageChange(pageNumber) {
        var self = this;

        axios.post('/api/prescribe/list', {
            searchkey: this.state.searchkey,
            searchorder: this.state.searchorder,
            ps: this.state.pageSize,
            pn: pageNumber,
        })
        .then(function (response) {
            var prescribes = response.data.msg.data;
            var data = [];

            for (var i = 0; i < prescribes.length; i++) {
                data.push({
                    key: self.keyIdx++,
                    editable: self.state.allEditable,
                    editmeds: false,
                    _id: prescribes[i]._id,
                    name: prescribes[i].name,
                    desc: prescribes[i].desc,
                    medicines: prescribes[i].medicines,
                });
            }

            self.setState({
                data: data,
                totalRows: response.data.msg.total,
                pageNumber: pageNumber
            });
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    onSearchKeyChange(e) {
        this.setState({searchkey:e.target.value}, ()=> {
            this.onPageChange(0);
        });
    }

    onSearchPressed = () => {
        this.onPageChange(0); // 只起到刷新的作用
    }

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

            axios.post('/api/prescribe/new', {
                name: _(prescribenewname).trim(),
                desc: prescribenewdesc,
                medicines: [],
            })
            .then(function (response) {
                if (response.data.status != 0) {
                    message.error(response.data.msg);
                    return;
                }

                self.setState({
                    prescribeflag: false,
                    prescribenewname: '',
                    prescribenewdesc: ''
                }, function() {
                    self.onPageChange(0);
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

    switcherOn = () => {
        this.setState({
            switcherOn: !this.state.switcherOn
        })
    };

    onAllOpenedSwitch = (allOpened) => {
        this.setState({allOpened}, () => {
            localStorage.setItem('allOpenedPrescribe', JSON.stringify(allOpened));
        })
    };

    onAllEditableSwitch = (allEditable) => {
        this.setState({allEditable}, () => {
            localStorage.setItem('allEditablePrescribe', JSON.stringify(allEditable));
        })
    };

    render() {
        const {
            data, pageSize, pageNumber, totalRows, searchkey, prescribeflag, prescribenewname, prescribenewdesc,
            switcherOn, allOpened, allEditable,
        } = this.state;

        return (
            <div className="gutter-example">
                <BreadcrumbCustom first="处方" second="处方管理" />
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
                <Row gutter={16}>
                    <Col className="gutter-row">
                        <div className="gutter-box">
                            <Row style={{marginBottom:8}} justify="center">
                                <Col span={4}>
                                    <Input
                                        value={searchkey}
                                        onChange={e => this.onSearchKeyChange(e)}
                                        placeholder='请输入处方名字'/>
                                </Col>
                                <Col span={2}>
                                    <Button style={{marginLeft:3}} onClick={()=>this.onSearchPressed()}>搜索</Button>
                                </Col>
                                <Col>
                                    <Row style={{ float: 'right', marginRight:30 }}>
                                        <Button onClick={()=>this.newPrescribe()}>+添加处方</Button>
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
            </div>
        );
    }
}

export default PrescribeList;