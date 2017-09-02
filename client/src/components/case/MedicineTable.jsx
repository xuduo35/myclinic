import axios from 'axios';
import React from 'react';
import { Table, Input, Select, Popconfirm, AutoComplete, Popover, Tooltip, Row, Col, Button, Modal } from 'antd';
import { getEveryPrice, myParseInt, myParseFloat } from '../../utils';

const Option = Select.Option;

class MedicineNameCell extends React.Component {
    state = {
        value: this.props.value,
        editable: this.props.editable || false,
        dataSource: [],
        medspec: {},
        editspec: false,
        medspectxt: ''
    };

    autolist = [];

    componentDidMount() {
        // xxx: 无奈的办法
        var nameinputs = document.getElementsByName('nameinput');

        if (nameinputs && (nameinputs.length > 0)) {
            nameinputs[nameinputs.length - 1].focus();
        }
    }

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
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.editable !== this.state.editable ||
            nextState.value !== this.state.value ||
            nextState.dataSource !== this.state.dataSource ||
            nextState.editspec !== this.state.editspec ||
            nextState.medspec !== this.state.medspec ||
            nextState.medspectxt !== this.state.medspectxt;
    }

    handleSelect = (value) => {
        for (var i = 0; i < this.autolist.length; i++) {
            var item = this.autolist[i];

            if (item.name+"("+item.tradename+")" == value) {
                var self = this;
                var name = item.name;
                var tradename = item.tradename;
                var value = name+"("+tradename+")";

                axios.post('/api/medicine/info', {
                    name: name,
                    tradename: tradename
                })
                .then(function (response) {
                    if (response.data.status == 0) {
                        self.setState({
                            value: value,
                            medspec: response.data.msg
                        });

                        self.props.onChange(item);
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });

                break;
            }
        }
    }

    handleSearch = (value) => {

    }

    handleChange(value) {
        var self = this;

        this.setState({ value }, function() {
            var dataSource = [];

            self.autolist = [];

            axios.post('/api/medicine/names', {
                searchkey: value
            })
            .then(function (response) {
                var dataSource = [];

                if (response.data.status == 0) {
                    var msg = response.data.msg;

                    msg.map(function(item){
                        dataSource.push(
                            item.name+"("+item.tradename+")"
                        );
                        self.autolist.push(item);
                    });

                    self.setState({
                        dataSource: dataSource
                    });

                    self.props.onChange(value);
                }
            })
            .catch(function (error) {
                console.log(error);
            });
        });
    }

    onSpecEdit = () => {
        this.setState({
            editspec: true,
            medspectxt: this.state.medspec.spec
        });
    }

    onSpecSave = () => {
        var self = this;

        axios.post('/api/medicine/modify', {
            _id: this.state.medspec._id,
            spec: this.state.medspectxt
        })
        .then(function (response) {
            axios.post('/api/medicine/info', {
                name: self.state.medspec.name,
                tradename: self.state.medspec.tradename
            })
            .then(function (response) {
                if (response.data.status == 0) {
                    self.setState({
                        editspec: false,
                        medspec: response.data.msg
                    });
                }
            })
            .catch(function (error) {
                console.log(error);
            });
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    onSpecCancel = () => {
        this.setState({editspec:false});
    }

    onSpecChange = (e) => {
        var medspectxt = e.target.value;
        this.setState({medspectxt});
    }

    render() {
        var self = this;
        const { value, editable, dataSource, medspec, editspec, medspectxt } = this.state;
        var remain = typeof(medspec.remain)=='undefined'?"":Number(medspec.remain).toFixed(2);
        var i = 0;
        var meddetails = <div style={{ width: 400, height: 200, overflow: 'scroll' }}>{
            <div key={i++}>
                <Row style={{margin:4}} align="center">
                    <Col span={20}>
                        <p><a href={medspec.link} target="_blank"><b>{medspec.name}</b></a> 库存:{remain}</p>
                    </Col>
                    <Col span={4}>
                        <Button type="dashed" size="small" onClick={this.onSpecEdit}>编辑</Button>
                    </Col>
                </Row>
                <hr />
                <pre style={{whiteSpace:'pre-wrap',wordWrap:'break-word'}}>{medspec.spec}</pre>
                <br/>
            </div>
        }</div>;

        return (
            <div>
                {
                    editspec ? (
                        <div>
                            {
                                editable ?
                                    <div>
                                    <Popover placement="topRight" content={meddetails} title={'说明书'} visable={false} trigger="focus">
                                      <AutoComplete
                                        dataSource={dataSource}
                                        style={{ width: '100%' }}
                                        onSelect={this.handleSelect.bind(this)}
                                        onSearch={this.handleSearch.bind(this)}
                                        onChange={this.handleChange.bind(this)}
                                        placeholder={value}>
                                            <Input name="nameinput" type="text" />
                                        </AutoComplete>
                                    </Popover>
                                    </div>
                                    :
                                    <Popover placement="topRight" content={meddetails} title={'说明书'} visable={false} trigger="click">
                                        <a href="javascript:void(0);">{(typeof value != 'undefined') ? value.toString() : ' '}</a>
                                    </Popover>
                                }
                            <Modal
                                style={{ width: 400, height: 300}}
                                visible={editspec}
                                title={medspec.name}
                                confirmLoading={true}
                                maskClosable={true}
                                onCancel={this.onSpecCancel}
                                footer={[
                                    <Button key="back" size="small" onClick={this.onSpecCancel}>关闭</Button>,
                                    <Button key="submit" type="primary" style={{color: '#fff','backgroundColor': '#108ee9','borderColor': '#108ee9'}} size="small" onClick={this.onSpecSave}>
                                    保存
                                    </Button>,
                                ]}>
                                <Input.TextArea
                                    style={{ width: '100%' }}
                                    autosize={{minRows: 6, maxRows:10}}
                                    name="specmod"
                                    value={medspectxt}
                                    onChange={this.onSpecChange}/>
                            </Modal>
                        </div>
                        ) : (
                        editable ?
                            <div>
                            <Popover placement="topRight" content={meddetails} title={'说明书'} trigger="focus">
                              <AutoComplete
                                dataSource={dataSource}
                                style={{ width: '100%' }}
                                onSelect={this.handleSelect.bind(this)}
                                onSearch={this.handleSearch.bind(this)}
                                onChange={this.handleChange.bind(this)}
                                placeholder={value}>
                                    <Input name="nameinput" type="text" />
                                </AutoComplete>
                            </Popover>
                            </div>
                            :
                            <Popover placement="topRight" content={meddetails} title={'说明书'} trigger="click">
                                <a href="javascript:void(0);">{(typeof value != 'undefined') ? value.toString() : ' '}</a>
                            </Popover>
                        )
                }
                {

                }

            </div>
        );
    }
}

class MedicineCell extends React.Component {
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
                                onPressEnter={e => this.props.onPressEnter(e)}
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

var medfreqdailys = {
    qd: 1,
    bid: 2,
    tid: 3,
    qid: 4,
};

var medusages = ["口服", "肌注", "皮注", "静注", "灌肠"];

class MedAutoCompleteCell extends React.Component {
    state = {
        value: this.props.value,
        editable: this.props.editable || false,
        dataSource: this.props.medoptions,
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
            nextState.value !== this.state.value ||
            nextState.dataSource !== this.state.dataSource;
    }

    handleSelect = (value) => {
        this.setState({
            value: value
        });

        this.props.onChange(value);
    }

    handleSearch = (value) => {

    }

    handleChange(value) {
        this.setState({ value });
        this.props.onChange(value);
    }

    render() {
        const { value, editable, dataSource } = this.state;
        return (
            <div>
                {
                    editable ?
                        <div>
                            <AutoComplete
                                value={value}
                                dataSource={dataSource}
                                style={{ width: '100%' }}
                                onSelect={this.handleSelect.bind(this)}
                                onSearch={this.handleSearch.bind(this)}
                                onChange={this.handleChange.bind(this)}
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

class MedicineUnitCell extends React.Component {
    state = {
        value: this.props.value,
        unitoptions: this.props.unitoptions,
        editable: this.props.editable || false
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.editable !== this.state.editable) {
            this.setState({ editable: nextProps.editable });
            if (nextProps.editable) {
                this.cacheValue = this.state.value;
            }
        }
        if (nextProps.unitoptions !== this.state.unitoptions) {
            this.setState({ unitoptions: nextProps.unitoptions });
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
            nextState.value !== this.state.value ||
            nextState.unitoptions !== this.state.unitoptions;
    }

    onSelectUnit = (value, option) => {
        this.setState({ value });
        this.props.onChange(value);
    };

    render() {
        const { value, unitoptions, editable } = this.state;
        var unitoptionsJSX = unitoptions.map((item) => {
            return <Option key={unitoptions.indexOf(item)} style={{lineHeight:'7px'}} value={item}>{item}</Option>;
        });

        return (
            <div>
                {
                    editable ?
                        <div>
                            <Select style={{width:70}} dropdownStyle={{height:150}} onSelect={this.onSelectUnit} value={value}>
                            {unitoptionsJSX}
                            </Select>
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

class MedicineTable extends React.Component {
    constructor(props) {
        super(props);

        this.columns = [{
            title: '名称',
            dataIndex: 'name',
            width: '15%',
            render: (text, record, index) => this.renderColumns(this.state.data, index, 'name', text),
        }, {
            title: '规格',
            dataIndex: 'standard',
            width: '15%',
            render: (text, record, index) => this.renderColumns(this.state.data, index, 'standard', text),
        }, {
            title: '单剂量',
            dataIndex: 'dose',
            width: '7%',
            render: (text, record, index) => this.renderColumns(this.state.data, index, 'dose', text),
        }, {
            title: '单位',
            dataIndex: 'unit',
            width: '10%',
            render: (text, record, index) => this.renderColumns(this.state.data, index, 'unit', text),
        }, {
            title: '频率',
            dataIndex: 'freqdaily',
            width: '7%',
            render: (text, record, index) => this.renderColumns(this.state.data, index, 'freqdaily', text),
        }, {
            title: '用法',
            dataIndex: 'usage',
            width: '10%',
            render: (text, record, index) => this.renderColumns(this.state.data, index, 'usage', text),
        }, {
            title: '天数',
            dataIndex: 'days',
            width: '7%',
            render: (text, record, index) => this.renderColumns(this.state.data, index, 'days', text),
        }, {
            title: '总剂量',
            dataIndex: 'total',
            width: '7%',
            render: (text, record, index) => this.renderColumns(this.state.data, index, 'total', text),
        }, {
            title: '单价',
            dataIndex: 'price',
            width: '7%',
            render: (text, record, index) => this.renderColumns(this.state.data, index, 'price', text),
        }, {
            title: '总价',
            dataIndex: 'money',
            width: '7%',
            render: (text, record, index) => this.renderColumns(this.state.data, index, 'money', text),
        }, {
            title: '操作',
            dataIndex: 'operation',
            render: (text, record, index) => {
                const { editable } = this.state.data[index].name;
                return (
                    <div className="editable-row-operations">
                        {
                            editable ?
                                <ul>
                                  <li><a onClick={() => this.editDone(index, 'save')}>完成</a></li>
                                  <li><a onClick={() => this.editDone(index, 'calc')}>计价</a></li>
                                  <li><Popconfirm title="确定取消?" onConfirm={() => this.editDone(index, 'cancel')}>
                                    <a>取消</a>
                                  </Popconfirm></li>
                                </ul>
                                :
                                <ul>
                                  <li><a onClick={() => this.edit(index)}>编辑</a></li>
                                  <li><a onClick={() => this.remove(index)}>删除</a></li>
                                </ul>
                        }
                    </div>
                );
            },
        }];

        this.state = {
            data: this.props.data,
        };

        this.keyIdx = 9999; // xxx: 无论如何也比data.length大
    }

    renderColumns(data, index, key, text) {
        const { editable, status } = data[index][key];
        var unitoptions = Object.keys(data[index].prices);

        if (typeof editable === 'undefined') {
            return text;
        }

        if (key == 'name') {
            return (
                <MedicineNameCell
                    editable={editable}
                    value={text}
                    onChange={value => this.handleChangeName(key, index, value)}
                    status={status}/>
            );
        } else if (key == 'freqdaily') {
            return (
                <MedAutoCompleteCell
                    medoptions={Object.keys(medfreqdailys)}
                    editable={editable}
                    value={text}
                    onChange={value => this.handleChange(key, index, value)}
                    status={status}
                    placeholder='次'/>
            );
        } else if (key == 'usage') {
            return (
                <MedAutoCompleteCell
                    medoptions={medusages}
                    editable={editable}
                    value={text}
                    onChange={value => this.handleChange(key, index, value)}
                    status={status}/>
            );
        } else if (key == 'unit') {
            return (
                <MedicineUnitCell
                    editable={editable}
                    value={text}
                    unitoptions={unitoptions}
                    onChange={value => this.handleChange(key, index, value)}
                    status={status}/>
            );
        } else if ((key == 'price') || (key == 'money')) {
            return (
                <MedicineCell
                    editable={editable}
                    value={text}
                    onChange={value => this.handleChange(key, index, value)}
                    onPressEnter={e => this.handlePressEnter(key, index, e)}
                    status={status}
                    placeholder='元'/>
            );
        } else {
            return (
                <MedicineCell
                    editable={editable}
                    value={text}
                    onChange={value => this.handleChange(key, index, value)}
                    onPressEnter={e => this.handlePressEnter(key, index, e)}
                    status={status}/>
            );
        }
    }

    handleChangeName(key, index, value) {
        const { data } = this.state;

        if (typeof value == 'object') {
            var meditem = value;
            var name = meditem.name;
            var tradename = meditem.tradename;
            value = name+"("+tradename+")";
            var unitoptions = Object.keys(meditem.prices);

            data[index]['name'].value = value;
            data[index]['standard'].value = meditem.standard;
            data[index]['unit'].value = meditem.defaultUnit;
            data[index]['usage'].value = meditem.usage;
            data[index]['prices'] = meditem.prices;
        } else {
            data[index]['name'].value = value;
        }

        this.setState({ data });
    }

    handleChange(key, index, value) {
        const { data } = this.state;
        data[index][key].value = value;
        this.setState({ data });
    }

    handlePressEnter(key, index, e) {
        this.newMedicine(() => this.editDone(index, 'calcANDsave'))
    }

    edit(index) {
        const { data } = this.state;
        Object.keys(data[index]).forEach((item) => {
            if (data[index][item] && typeof data[index][item].editable !== 'undefined') {
                data[index][item].editable = true;
            }
        });
        this.setState({ data });
    }

    remove(index) {
        const { data } = this.state;
        data.splice(index, 1);
        this.setState({ data });
    }

    editDone(index, type) {
        var self = this;

        const { data } = this.state;

        if ((type != 'calc') || (type == 'calcANDsave')){
            Object.keys(data[index]).forEach((item) => {
                if (data[index][item] && typeof data[index][item].editable !== 'undefined') {
                    data[index][item].editable = false;
                    data[index][item].status = type;
                }
            });
            this.setState({ data }, () => {
                Object.keys(data[index]).forEach((item) => {
                    if (data[index][item] && typeof data[index][item].editable !== 'undefined') {
                        delete data[index][item].status;
                    }
                });
            });

            if (type == 'cancel') {
                return;
            }

            var unit = data[index].unit.value;
            var usage = data[index].usage.value;
            var name, tradename;

            if (data[index].name != '') {
                if (data[index].name.value.indexOf('(') >= 0) {
                    [name, tradename] = data[index].name.value.replace(")", "").split("(");
                } else {
                    name = data[index].name.value;
                    tradename = '';
                }

                axios.post('/api/medicine/info', {
                    name: name,
                    tradename: tradename
                })
                .then(function (response) {
                    if (response.data.status == 0) {
                        var medspec = response.data.msg;

                        if ((medspec.defaultUnit != unit) || (medspec.usage != usage)) {
                            axios.post('/api/medicine/modify', {
                                _id: medspec._id,
                                defaultUnit: unit,
                                usage: usage
                            })
                            .then(function (response) {

                            })
                            .catch(function (error) {
                                console.log(error);
                            });
                        }
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
            }

            if (type == 'save') {
                return;
            }
        }

        var days = myParseInt(data[index].days.value);
        var freqdailytxt = data[index].freqdaily.value;
        var freqdaily = medfreqdailys[freqdailytxt];
        var dose = myParseFloat(data[index].dose.value);

        if (typeof freqdaily == 'undefined') { // 不是qd, bid, tid, qid
            freqdaily = myParseInt(freqdailytxt);
        }

        var unit = data[index].unit.value;
        var name, tradename;

        if (data[index].name != '') {
            if (data[index].name.value.indexOf('(') >= 0) {
                [name, tradename] = data[index].name.value.replace(")", "").split("(");
            } else {
                name = data[index].name.value;
                tradename = '';
            }

            axios.post('/api/medicine/info', {
                name: name,
                tradename: tradename
            })
            .then(function (response) {
                if (response.data.status == 0) {
                    var medspec = response.data.msg;

                    if (typeof medspec.prices[unit] != 'undefined') {
                        var price = (dose * freqdaily * days * medspec.prices[unit].price) / medspec.prices[unit].number;

                        data[index]['price'].value = price.toFixed(2);
                        data[index]['total'].value = (dose * freqdaily * days).toFixed(2);
                        data[index]['money'].value = (price * days).toFixed(2);

                        self.setState({ data });
                    }
                }
            })
            .catch(function (error) {
                console.log(error);
            });
        }
    }

    newMedicine = (callback) => {
        const { data } = this.state;

        data.push({
            key: this.keyIdx,
            name: {
                editable: true,
                value: '',
            },
            standard: {
                editable: true,
                value: '',
            },
            usage: {
                editable: true,
                value: '',
            },
            dose: {
                editable: true,
                value: '',
            },
            unit: {
                editable: true,
                value: '',
            },
            price: {
                editable: true,
                value: '',
            },
            freqdaily: {
                editable: true,
                value: '',
            },
            days: {
                editable: true,
                value: '',
            },
            total: {
                editable: true,
                value: '',
            },
            money: {
                editable: true,
                value: '',
            },
            prices: {}, // xxx
        });

        this.keyIdx++;

        this.setState({data}, () =>  callback && callback.bind(this)());
    };

    render() {
        const { data } = this.state;
        const dataSource = data.map((item) => {
            const obj = {};
            Object.keys(item).forEach((key) => {
                obj[key] = key === 'key' ? item[key] : item[key].value;
            });
            return obj;
        });
        const columns = this.columns;
        return (
            <div>
                <Table size="small" bordered dataSource={dataSource} columns={columns} pagination={false} />
                <Row type="flex" style={{ margin: 8, float: 'right' }}>
                    <Button style={{ background: '#ececec' }} onClick={() => this.newMedicine()}>添加</Button>
                </Row>
            </div>
            );
    }
}

export default MedicineTable;