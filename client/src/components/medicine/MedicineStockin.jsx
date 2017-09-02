import axios from 'axios';
import React from 'react';
import { Row, Col, Card, Upload, Modal, Popconfirm, Input, Pagination, Select, Button, DatePicker, Checkbox, message } from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom';
import { Table } from 'antd';
import moment from 'moment';
import { getEveryPrice, myParseInt, myParseFloat } from '../../utils';
var _ = require('lodash');

const { MonthPicker, RangePicker } = DatePicker;
const Option = Select.Option;

class MedicineStockinCell extends React.Component {
    state = {
        value: this.props.value,
        editable: this.props.editable || false,
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

class MedicineStockin extends React.Component {
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
            title: '数量',
            dataIndex: 'number',
            width: '10%',
            render: (text, record, index) => this.renderColumns(this.state.data, index, 'number', text),
        }, {
            title: '价格(元)',
            dataIndex: 'price',
            width: '10%',
            render: (text, record, index) => this.renderColumns(this.state.data, index, 'price', text),
        }, {
            title: '时间',
            dataIndex: 'created',
            width: '20%',
            render: (text, record, index) => this.renderColumns(this.state.data, index, 'created', text),
        }, {
            title: '操作',
            dataIndex: 'operation',
            render: (text, record, index) => {
                const { editable } = this.state.data[index];
                return (
                    <div className="editable-row-operations">
                        {
                            <span>
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
            totalRows: 0,
            searchkey: '',
            daterangeflag: false,
            daterange: [moment('2000/01/01', 'YYYY/MM/DD'), moment()],
        };
    }

    componentDidMount() {
        this.onPageChange(this.state.pageNumber);
    }

    remove(index) {
        var self = this;
        const { data } = this.state;

        axios.post('/api/stockin/remove', {
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

    renderColumns(data, index, key, text) {
        const { editable, status } = data[index];

        return (
            <MedicineStockinCell
                editable={editable}
                value={text}
                status={status}/>
        );
    }

    onPageChange(pageNumber) {
        var self = this;
        const {
            searchkey,
            daterangeflag, daterange
        } = this.state;

        axios.post('/api/stockin/list', {
            searchkey: searchkey,
            daterangeflag: daterangeflag,
            daterange: daterange,
            ps: this.state.pageSize,
            pn: pageNumber,
        })
        .then(function (response) {
            var stockins = response.data.msg.data;
            var data = [];

            for (var i = 0; (i < stockins.length) && (i < 10); i++) {
                data.push({
                    key: i,
                    editable: false,
                    _id: stockins[i]._id,
                    name: stockins[i].name,
                    tradename: stockins[i].tradename,
                    standard: stockins[i].standard,
                    price: stockins[i].price,
                    number: stockins[i].number.toFixed(2),
                    created: moment(stockins[i].created).format('YYYY-MM-DD HH:mm:ss'),
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
            data, pageSize, pageNumber, totalRows, searchkey, daterangeflag, daterange
        } = this.state;

        return (
            <div className="gutter-example">
                <BreadcrumbCustom first="药品" second="进药记录" />
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
                                <Col>
                                    <Row type="flex">
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
                                    </Row>
                                </Col>
                            </Row>
                            <Card bordered={false}>
                                <Table
                                    columns={this.columns}
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
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default MedicineStockin;