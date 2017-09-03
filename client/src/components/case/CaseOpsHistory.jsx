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

class CaseOpsHistory extends React.Component {
    state = {
        data: this.props.data,
        previewVisible: false,
        previewImage: '',
    };

    columns = [
        { title: '姓名', dataIndex: 'name', key: 'name', render: (text, record, index) => {
            var allergic = record.allergic.replace(/(^\s+)|(\s+$)/g, "");

            if ((allergic != "") && (allergic != "无")) {
                return (
                    <div>
                        <p><font color="red">{text}</font></p>
                    </div>
                    );
            }

            return (
                <div>
                    <p>{text}</p>
                </div>
                );
        }},
        { title: '性别', dataIndex: 'gender', key: 'gender', render: (text, record, index) => {
            return (
                <div>
                    <p>{gender2str(text)}</p>
                </div>
                );
        }},
        { title: '年龄', dataIndex: 'age', key: 'age', render: (text, record, index) => {
            var age = '';

            if (record.ageUnit == 'day') {
                age = record.age + "天";
            } else if (record.ageUnit == 'month') {
                age = record.age + "个月";
            } else {
                age = record.age + "岁";
            }

            return (
                <div>
                    <p>{age}</p>
                </div>
                );
        }},
        { title: '电话', dataIndex: 'phone', key: 'phone', render: (text, record, index) => {
            return (
                <div>
                    <p>{text}</p>
                </div>
                );
        }},
        { title: '住址', dataIndex: 'address', key: 'address', render: (text, record, index) => {
            return (
                <div>
                    <p>{text.substring(0,4)}</p>
                </div>
                );
        }},
        { title: '日期', dataIndex: 'date', key: 'date' , render: (text, record, index) => {
            return (
                <div>
                    <p>{moment(text).format("YYYY-MM-DD")}</p>
                </div>
                );
        }},
    ];

    componentWillReceiveProps(nextProps) {
        if (nextProps.data !== this.state.data) {
            this.setState({ data: nextProps.data });
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.data !== this.state.data ||
             nextProps.previewVisible !== this.state.previewVisible ||
              nextProps.previewImage !== this.state.previewImage;
    }

    handlePictureCancel = () => this.setState({ previewVisible: false })

    handlePicturePreview = (file) => {
        this.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true,
        });
    }

    expandedRowRender(record) {
        var self = this;
        var { previewVisible, previewImage } = this.state;
        var fileList = [];
        var fileListExam = [];
        var i = 0;

        record.pictures.map(function(item) {
            fileList.push({
                uid: fileList.length,
                name: 'thumb.png',
                status: 'done',
                url: item,
            });
        });

        record.exampics.map(function(item) {
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
                                        <Icon key={index} type="star-o" style={{ fontSize: 16, color: 'gray' }} />
                                        );
                                } else {
                                    return (
                                        <Icon key={index} type="star-o" style={{ fontSize: 16, color: item }} />
                                        );
                                }
                            })
                        }
                    </Col>
                </Row>
                <p>{gender2str(record.gender)}  {record.age}  {record.occupation} {record.education} {record.ethnic}</p>
                <p>===  {moment(record.date).format("YYYY-MM-DD HH:MM:SS")}  ===</p>
                <p>主诉: {record.complaint}</p>
                <pre style={{whiteSpace:'pre-wrap',wordWrap:'break-word'}}>现病史: {record.curr_complaint}</pre>
                <pre style={{whiteSpace:'pre-wrap',wordWrap:'break-word'}}>既往史: {record.past_complaint}</pre>
                <pre style={{whiteSpace:'pre-wrap',wordWrap:'break-word'}}>药物过敏史: <font color='red'>{record.allergic}</font></pre>
                <pre style={{whiteSpace:'pre-wrap',wordWrap:'break-word'}}>个人史: {record.experience}</pre>
                <pre style={{whiteSpace:'pre-wrap',wordWrap:'break-word'}}>婚育史: {record.marriage}</pre>
                <pre style={{whiteSpace:'pre-wrap',wordWrap:'break-word'}}>月经史: {record.menses}</pre>
                <pre style={{whiteSpace:'pre-wrap',wordWrap:'break-word'}}>家庭史: {record.family}</pre>
                <pre style={{whiteSpace:'pre-wrap',wordWrap:'break-word'}}>体格检查: {record.physical}</pre>
                <pre style={{whiteSpace:'pre-wrap',wordWrap:'break-word'}}>辅助检查: {record.examination}</pre>
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
                    record.diagnosises.map(function(item, idx) {
                        return (<pre key={i++}>&nbsp;&nbsp;&nbsp;{idx+1+""}. {item} </pre>);
                    })
                }
                <pre style={{whiteSpace:'pre-wrap',wordWrap:'break-word'}}>治疗意见: </pre>
                {
                    record.medicines.map(function(item) {
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

    render() {
        const {
            data,
        } = this.state;

        return (
            <div className="gutter-example">
                <Row gutter={14}>
                    <Col className="gutter-row">
                        <div className="gutter-box">
                            <Table
                                size="small"
                                bordered={false}
                                columns={this.columns}
                                expandedRowRender={this.expandedRowRender.bind(this)}
                                dataSource={data}
                                pagination={false}/>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default CaseOpsHistory;