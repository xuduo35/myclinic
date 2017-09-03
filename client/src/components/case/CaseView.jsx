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

class CaseView extends React.Component {
    state = {
        mycase: null
    };

    componentDidMount() {
        var self = this;

        axios.post('/api/case/infoById', {
            _id: this.props.params.id
        })
        .then(function (response) {
            if (response.data.status == 0) {
                self.setState({
                    mycase: response.data.msg,
                });
            }
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    render() {
        var {mycase} = this.state;

        if (!mycase) {
            return (
                <div className="gutter-example">
                    <BreadcrumbCustom first="病例" second="处方" />
                    <Row gutter={16}>
                        <Col className="gutter-row" span={22}>
                            <div className="gutter-box">
                                <Card title={"处方笺"} bordered={true}>
                                    "暂无数据"
                                </Card>
                            </div>
                        </Col>
                    </Row>
                </div>
            );
        }

        var age = '';
        var gender = '未知';

        if (mycase.gender == 'male') {
            gender = '男';
        } else if (mycase.gender == 'female') {
            gender = '女';
        }

        if (mycase.ageUnit == 'day') {
            age = mycase.age + "天";
        } else if (mycase.ageUnit == 'month') {
            age = mycase.age + "个月";
        } else {
            age = mycase.age + "岁";
        }

        return (
            <div className="gutter-example">
                <BreadcrumbCustom first="病例" second="处方" />
                <Row gutter={16}>
                    <Col className="gutter-row" span={22}>
                        <div className="gutter-box">
                            <Card title={"处方笺"} bordered={true}>
                                <div>
                                    <p>姓名: {mycase.name} 性别: {gender} 年龄: {age}</p>
                                    <p>日期: {moment(mycase.date).format("YYYY-MM-DD HH:MM:SS")}</p>
                                    <br />
                                    <hr />
                                    <br />
                                    <h1>Rp:</h1>
                                    <br />
                                    {
                                        mycase.medicines.map(function(item) {
                                            return (
                                                <pre key={mycase.medicines.indexOf(item)}>
                                                    {item.name + ': ' + item.dose + item.unit + '*' + item.freqdaily + '次*' + item.days + '天 ' + item.usage}
                                                </pre>
                                                );
                                        })
                                    }
                                </div>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default CaseView;