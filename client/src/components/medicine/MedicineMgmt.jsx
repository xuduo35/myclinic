import axios from 'axios';
import React from 'react';
import { Row, Col, Card, Upload, Modal, Popconfirm, Input, Pagination, Select, Button, message } from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom';
import { Table } from 'antd';
import moment from 'moment';
import { getEveryPrice, myParseInt, myParseFloat } from '../../utils';
var _ = require('lodash');

const Option = Select.Option;

const medtypes = [
    "呼吸系统药物",
    "循环系统药物",
    "抗感染类药物",
    "泌尿系统药物",
    "消化系统药物",
    "皮肤科用药物",
    "神经系统药",
    "激素类及影响内分泌药物",
    "解热、镇痛、抗炎、抗痛风药物",
    "调节水盐、电解质和酸碱平衡用药物",
    "维生素、无机盐、复方氨基酸及营养药物",
    "酶类制剂",
    "五官科用药物",
    "免疫调节药物",
    "精神及麻醉药",
    "抗变态反应药物",
    "抗肿瘤及辅助用药物",
    "血液和造血系统药物",
    "诊断用药及解毒药物",
    "麻醉药及辅助麻醉药物",
    "其他药物",
];

class MedMgmtTypeCell extends React.Component {
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

    onSelectType = (value, option) => {
        this.setState({ value });
        this.props.onChange(value);
    };

    render() {
        const { value, editable } = this.state;
        var medtypeoptions = medtypes.map((item) => {
            return <Option key={medtypes.indexOf(item)} value={item}>{item}</Option>;
        });

        return (
            <div>
                {
                    editable ?
                        <div>
                            <Select style={{width:150}} dropdownStyle={{height:150}} onSelect={this.onSelectType} value={value}>
                            {medtypeoptions}
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

class MedMgmtCell extends React.Component {
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

class MedMgmtStockin extends React.Component {
    state = {
        stockmedprice: 0,
        stockmednumber: 0,
    };

    componentWillReceiveProps(nextProps) {
        (nextProps.stockmedprice !== this.state.stockmedprice) && this.setState({ stockmedprice: nextProps.stockmedprice });
    }

    onMedicineStockSave = () => {
        const { stockmedid } = this.props;
        const { stockmedprice, stockmednumber} = this.state;
        var self = this;

        axios.post('/api/medicine/stock', {
            _id: stockmedid,
            stockmedprice: myParseFloat(stockmedprice),
            stockmednumber: myParseFloat(stockmednumber),
            standard: this.props.stockmedstandard,
        })
        .then(function (response) {
            self.setState({stockmednumber:0})
            self.props.onChange(false);
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    onMedicineStockCancel = () => {
        this.props.onChange(false);
    }

    onMedicineStockChange = (e, name) => {
        if (name == "price") {
            this.setState({stockmedprice: e.target.value});
        } else if (name == "number") {
            this.setState({stockmednumber: e.target.value});
        }
    }

    render() {
        const { stockmedid, stockmedname, stockmedtradename } = this.props;
        const { stockmedprice, stockmednumber } = this.state;

        return (
            <div>
                <Modal
                    style={{ width: 400, height: 300}}
                    visible={this.props.visible}
                    title="入库"
                    confirmLoading={true}
                    maskClosable={true}
                    onCancel={this.onMedicineStockCancel}
                    footer={[
                        <Button key="back" size="small" onClick={this.onMedicineStockCancel}>取消</Button>,
                        <Button key="submit" type="primary" style={{color: '#fff','backgroundColor': '#108ee9','borderColor': '#108ee9'}} size="small" onClick={this.onMedicineStockSave}>
                        入库
                        </Button>,
                    ]}>
                    <Row type="flex" justify="center">
                        <Col span={12}>
                            <Input
                                disabled={true}
                                value={stockmedname+"("+stockmedtradename+")"}
                                addonBefore="药品"/>
                        </Col>
                        <Col span={6}>
                            <Input
                                value={stockmedprice}
                                onChange={(e)=>this.onMedicineStockChange(e, "price")}
                                addonBefore="单价"/>
                        </Col>
                        <Col span={6}>
                            <Input
                                style={{ marginLeft: 8 }}
                                value={stockmednumber}
                                onChange={(e)=>this.onMedicineStockChange(e, "number")}
                                addonBefore="数量"/>
                        </Col>
                    </Row>
                </Modal>
            </div>
        );
    }
}

class MedMgmtNew extends React.Component {
    state = {
        name: '',
        tradename: '',
        standard: '',
        type: '',
        stdprice: 0,
        link: '',
        spec: '',
    };

    componentWillReceiveProps(nextProps) {

    }

    onMedicineNewSave = () => {
        const { name, tradename, standard, type, stdprice, link, spec } = this.state;
        var prices = getEveryPrice(standard, myParseFloat(stdprice));

        if ((_(name).trim() == '') || (_(standard).trim() == '')) {
            message.error('名称以及规格不能为空!');
            return;
        }

        if (Object.keys(prices).length == 0) {
            message.error('无效规格!');
            return;
        }

        var self = this;

        axios.post('/api/medicine/new', {
            name: _(name).trim(),
            tradename: _(tradename).trim(),
            standard: _(standard).trim(),
            type: type,
            stdprice: myParseFloat(stdprice),
            link: link,
            spec: spec,
            prices: prices,
        })
        .then(function (response) {
            if (response.data.status != 0) {
                message.error(response.data.msg);
                return;
            }

            self.setState({
                name: '',
                tradename: '',
                standard: '',
                type: '',
                stdprice: 0,
                link: '',
                spec: '',
            });

            self.props.onChange(false);
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    onMedicineNewCancel = () => {
        this.props.onChange(false);
    }

    onMedicineNewChange = (e, name) => {
        if (name == "name") {
            this.setState({name: e.target.value});
        } else if (name == "tradename") {
            this.setState({tradename: e.target.value});
        } else if (name == "standard") {
            this.setState({standard: e.target.value});
        } else if (name == "stdprice") {
            this.setState({stdprice: e.target.value});
        } else if (name == "link") {
            this.setState({link: e.target.value});
        } else if (name == "spec") {
            this.setState({spec: e.target.value});
        }
    }

    onSelectType = (value, option) => {
        this.setState({ type: value });
    };

    render() {
        const { name, tradename, standard, type, stdprice, link, spec } = this.state;
        var medtypeoptions = medtypes.map((item) => {
            return <Option key={medtypes.indexOf(item)} value={item}>{item}</Option>;
        });

        return (
            <div>
                <Modal
                    style={{ width: 400, height: 700}}
                    visible={this.props.visible}
                    title="添加药品"
                    confirmLoading={true}
                    maskClosable={true}
                    onCancel={this.onMedicineNewCancel}
                    footer={[
                        <Button key="back" size="small" onClick={this.onMedicineNewCancel}>取消</Button>,
                        <Button key="submit" type="primary" style={{color: '#fff','backgroundColor': '#108ee9','borderColor': '#108ee9'}} size="small" onClick={this.onMedicineNewSave}>
                        添加
                        </Button>
                    ]}>
                    <Row style={{ margin: 8 }}>
                        <Col span={6}>
                            <label>名称:</label>
                        </Col>
                        <Col span={12}>
                            <Input
                                value={name}
                                onChange={(e)=>this.onMedicineNewChange(e, "name")}/>
                        </Col>
                    </Row>
                    <Row style={{ margin: 8 }}>
                        <Col span={6}>
                            <label>商品名:</label>
                        </Col>
                        <Col span={12}>
                            <Input
                                value={tradename}
                                onChange={(e)=>this.onMedicineNewChange(e, "tradename")}/>
                        </Col>
                    </Row>
                    <Row style={{ margin: 8 }}>
                        <Col span={6}>
                            <label>规格:</label>
                        </Col>
                        <Col span={12}>
                            <Input
                                value={standard}
                                onChange={(e)=>this.onMedicineNewChange(e, "standard")}/>
                        </Col>
                    </Row>
                    <Row style={{ margin: 8 }}>
                        <Col span={6}>
                            <label>类型:</label>
                        </Col>
                        <Col span={12}>
                            <Select style={{width:150}} dropdownStyle={{height:150}} onSelect={this.onSelectType} value={type}>
                            {medtypeoptions}
                            </Select>
                        </Col>
                    </Row>
                    <Row style={{ margin: 8 }}>
                        <Col span={6}>
                            <label>价格(元):</label>
                        </Col>
                        <Col span={12}>
                            <Input
                                value={stdprice}
                                onChange={(e)=>this.onMedicineNewChange(e, "stdprice")}/>
                        </Col>
                    </Row>
                    <Row style={{ margin: 8 }}>
                        <Col span={6}>
                            <label>说明书链接:</label>
                        </Col>
                        <Col span={12}>
                            <Input
                                value={link}
                                onChange={(e)=>this.onMedicineNewChange(e, "link")}/>
                        </Col>
                    </Row>
                    <Row style={{ margin: 8 }}>
                        <Col>
                            <label>说明书文本:</label>
                        </Col>
                    </Row>
                    <Input.TextArea
                        style={{margin:8,width:'90%'}}
                        autosize={{minRows:10, maxRows:25}}
                        value={spec}
                        onChange={(e)=>this.onMedicineNewChange(e, "spec")}/>
                </Modal>
            </div>
        );
    }
}

class MeidicineMgmt extends React.Component {
    constructor(props) {
        super(props);

        this.columns = [{
            title: '名称',
            dataIndex: 'name',
            width: '15%',
            render: (text, record, index) => this.renderColumns(this.state.data, index, 'name', text),
        }, {
            title: '商品名',
            dataIndex: 'tradename',
            width: '10%',
            render: (text, record, index) => this.renderColumns(this.state.data, index, 'tradename', text),
        }, {
            title: '规格',
            dataIndex: 'standard',
            width: '15%',
            render: (text, record, index) => this.renderColumns(this.state.data, index, 'standard', text),
        }, {
            title: '类型',
            dataIndex: 'type',
            width: '20%',
            render: (text, record, index) => this.renderColumns(this.state.data, index, 'type', text),
        }, {
            title: '价格(元)',
            dataIndex: 'stdprice',
            width: '10%',
            render: (text, record, index) => this.renderColumns(this.state.data, index, 'stdprice', text),
        }, {
            title: '库存',
            dataIndex: 'remain',
            width: '10%',
            render: (text, record, index) => this.renderColumns(this.state.data, index, 'remain', text),
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
                                  <a onClick={() => this.stockin(index)}>入库</a>
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
            searchorder: 'remain',
            totalRows: 0,
            stockinflag: false,
            stockmedid: '',
            stockmedprice: 0,
            stockmedname: '',
            stockmedtradename: '',
            mednewflag: false,
        };
    }

    componentDidMount() {
        this.onPageChange(this.state.pageNumber);
    }

    stockin(index) {
        const { data } = this.state;

        this.setState({
            stockinflag: true,
            stockmedid: data[index]._id,
            stockmedname: data[index].name,
            stockmedtradename: data[index].tradename,
            stockmedstandard: data[index].standard,
            stockmedprice: data[index].stdprice,
        });
    }

    medicinenew() {
        this.setState({
            mednewflag: true,
        });
    }

    edit(index) {
        const { data } = this.state;
        data[index].editable = true;
        this.setState({ data });
    }

    remove(index) {
        var self = this;
        const { data } = this.state;

        axios.post('/api/medicine/remove', {
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
        var prices = getEveryPrice(data[index].standard, myParseFloat(data[index].stdprice));

        if ((_(data[index].name).trim() == '') || (_(data[index].standard).trim() == '')) {
            message.error('名称以及规格不能为空!');
            return;
        }

        if (Object.keys(prices).length == 0) {
            message.error('无效规格!');
            return;
        }

        axios.post('/api/medicine/modify', {
            _id: data[index]._id,
            name: _(data[index].name).trim(),
            tradename: _(data[index].tradename).trim(),
            standard: _(data[index].standard).trim(),
            type: data[index].type,
            stdprice: myParseFloat(data[index].stdprice),
            remain: myParseFloat(data[index].remain),
            prices: prices,
            // link: data[index].link,
            // spec:, data[index].spec,
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

        if (key == 'type') {
            return (
                <MedMgmtTypeCell
                    editable={editable}
                    value={text}
                    onChange={value => this.handleChange(key, index, value)}
                    status={status}/>
            );
        } else {
            return (
                <MedMgmtCell
                    editable={editable}
                    value={text}
                    link={data[index].link}
                    onChange={value => this.handleChange(key, index, value)}
                    status={status}/>
            );
        }
    }

    handleLinkChange = (record, value) => {
        const { data } = this.state;
        record.linknew = value;
        this.setState({data});
    }

    onSpecEdit = (record) => {
        const { data } = this.state;
        record.editspec = true;
        record.linknew = record.link;
        record.specnew = record.spec;
        this.setState({data});
    }

    onSpecCancel = (record) => {
        const { data } = this.state;
        record.editspec = false;
        delete record.linknew;
        delete record.specnew;
        this.setState({data});
    }

    onSpecChange = (record, value) => {
        const { data } = this.state;
        record.specnew = value;
        this.setState({data});
    }

    onSpecSave = (record) => {
        const { data } = this.state;
        var self = this;

        axios.post('/api/medicine/modify', {
            _id: record._id,
            spec: record.specnew,
            link: record.linknew
        })
        .then(function (response) {
            record.editspec = false;
            record.spec = record.specnew;
            record.link = record.linknew;
            delete record.linknew;
            delete record.specnew;
            self.setState({data});
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    expandedRowRender(record) {
        return (
            <div>
                {
                    !record.editspec ?
                        <div>
                            <Row style={{margin:4}} align="center">
                                <Col span={20}>
                                    <a href={record.link} target="_blank"><b>{record.name}</b></a>
                                </Col>
                                <Col span={4}>
                                    <Button type="dashed" size="small" onClick={()=>this.onSpecEdit(record)}>编辑</Button>
                                </Col>
                            </Row>
                            <pre style={{whiteSpace:'pre-wrap',wordWrap:'break-word'}}>{record.spec}</pre>
                        </div>
                        :
                        <div>
                            <label>说明书链接:</label>
                            <Input style={{marginBottom:8}} value={record.linknew} onChange={e => this.handleLinkChange(record, e.target.value)}/>
                            <label>说明书文本:</label>
                            <Input.TextArea
                                style={{marginBottom:8,width:'100%'}}
                                autosize={{minRows:10, maxRows:25}}
                                value={record.specnew}
                                onChange={(e)=>this.onSpecChange(record, e.target.value)}/>
                            <Row style={{margin:8}} type="flex" justify="center">
                                <Button size="small" onClick={()=>this.onSpecCancel(record)}>取消</Button>
                                <Button size="small"onClick={()=>this.onSpecSave(record)}>保存</Button>
                            </Row>
                        </div>
                }
            </div>
            );
    }

    onPageChange(pageNumber) {
        var self = this;

        axios.post('/api/medicine/list', {
            searchkey: this.state.searchkey,
            searchorder: this.state.searchorder,
            ps: this.state.pageSize,
            pn: pageNumber,
        })
        .then(function (response) {
            var medicines = response.data.msg.data;
            var data = [];

            for (var i = 0; i < medicines.length; i++) {
                data.push({
                    key: i,
                    editable: false,
                    editspec: false,
                    _id: medicines[i]._id,
                    name: medicines[i].name,
                    tradename: medicines[i].tradename,
                    standard: medicines[i].standard,
                    type: medicines[i].type,
                    stdprice: medicines[i].stdprice,
                    remain: Number(medicines[i].remain).toFixed(2),
                    prices: medicines[i].prices,
                    link: medicines[i].link,
                    spec: medicines[i].spec,
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

    onStockInChange = (stockinflag) => {
        this.state.stockinflag = stockinflag;
        this.onPageChange(this.state.pageNumber);
    }

    onMedNewChange = (mednewflag) => {
        this.state.mednewflag = mednewflag;
        this.onPageChange(this.state.pageNumber);
    }

    onSearchKeyChange(e) {
        this.setState({searchkey:e.target.value}, ()=> {
            this.onPageChange(0);
        });
    }

    onSearchPressed = () => {
        this.onPageChange(0); // 只起到刷新的作用
    }

    onSearchSelect = (value, option) => {
        this.setState({searchorder:value}, ()=> {
            this.onPageChange(0);
        });
    }

    render() {
        const {
            data, pageSize, pageNumber, totalRows,
            stockinflag, stockmedid, stockmedname, stockmedtradename, stockmedstandard, stockmedprice,
            mednewflag,
            searchkey,
            searchorder,
        } = this.state;

        return (
            <div className="gutter-example">
                <BreadcrumbCustom first="药品" second="药品管理" />
                <Row gutter={16}>
                    <Col className="gutter-row">
                        <div className="gutter-box">
                            <Row style={{marginBottom:8}} justify="center">
                                <Col span={4}>
                                    <Input
                                        value={searchkey}
                                        onChange={e => this.onSearchKeyChange(e)}
                                        placeholder='请输入药品名字'/>
                                </Col>
                                <Col span={2}>
                                    <Button style={{marginLeft:3}} onClick={()=>this.onSearchPressed()}>搜索</Button>
                                </Col>
                                <Col span={6}>
                                    <label>顺序按:</label>
                                    <Select style={{width:100,marginLeft:8}} dropdownStyle={{height:100}} onSelect={this.onSearchSelect} value={searchorder}>
                                        <Option value="remain">库存数量</Option>
                                        <Option value="usefreq">使用频率</Option>
                                        <Option value="stockout">使用时间</Option>
                                    </Select>
                                </Col>
                                <Col>
                                    <Row style={{ float: 'right', marginRight:30 }}>
                                        <Button onClick={()=>this.medicinenew()}>+添加药品</Button>
                                    </Row>
                                </Col>
                            </Row>
                            <Card bordered={false}>
                                <Table
                                    columns={this.columns}
                                    expandedRowRender={this.expandedRowRender.bind(this)}
                                    dataSource={this.state.data}
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
                            <MedMgmtStockin
                                visible={stockinflag}
                                stockmedid={stockmedid}
                                stockmedname={stockmedname}
                                stockmedtradename={stockmedtradename}
                                stockmedstandard={stockmedstandard}
                                stockmedprice={stockmedprice}
                                onChange={(stockinflag)=>this.onStockInChange(stockinflag)}/>
                            <MedMgmtNew
                                visible={mednewflag}
                                onChange={(mednewflag)=>this.onMedNewChange(mednewflag)}/>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default MeidicineMgmt;