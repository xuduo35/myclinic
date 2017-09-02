import React from 'react';
import { Row, Col, Card, Timeline, Icon, message, Popconfirm } from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom';
import EchartsRecent from './EchartsRecent';
import messageicon from '../../style/imgs/message.jpg';
import axios from 'axios';
import {PieChart} from 'react-easy-chart';
import ToolTip from './ToolTip';


class Dashboard extends React.Component {
    state = {
        casenum: 0,
        picsnum: 0,
        medsnum: 0,
        presnum: 0,
        notifications: [],
        agerange: [],
        showToolTip: false,
        top: '0px',
        left: '0px',
        value: 0,
        key: '',
        total: 1,
        recentdates: [],
        recentcases: [],
        serverurl: '',
    };

    updateData () {
        var self = this;

        axios.post('/api/dashboard/stats', {})
        .then(function (response) {
            var msg = response.data.msg;

            if (response.data.status != 0) {
                message.error(response.data.msg);
                return;
            }

            var agerange = [
                { key: "周岁以内",  value: msg.agerange[0], color: "#68BC31"},
                { key: "1~6岁",  value: msg.agerange[1], color: "#2091CF"},
                { key: "7~14岁",  value: msg.agerange[2], color: "#AF4E96"},
                { key: "15~30岁",  value: msg.agerange[3], color: "#DA5430"},
                { key: "30~50岁",  value: msg.agerange[4], color: "#FEE074"},
                { key: "50岁~",  value: msg.agerange[5], color: "#BCC074"}
            ];

            var total = 0;

            agerange.map(function(item) {
                total += item.value;
            });

            (total < 1) && (total = 1);

            self.setState({
                casenum: msg.casenum,
                picsnum: msg.picsnum,
                medsnum: msg.medsnum,
                presnum: msg.presnum,
                notifications: msg.notifications,
                fromstr: msg.fromstr,
                agerange: agerange,
                showToolTip: false,
                top: '0px',
                left: '0px',
                value: 0,
                key: '',
                total: total,
                recentdates: msg.recentdates,
                recentcases: msg.recentcases,
                serverurl: msg.serverurl,
            })
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    componentDidMount() {
        this.updateData();
    }

    clearNotifications() {
        var self = this;

        axios.post('/api/notification/clear', {})
        .then(function (response) {
            var msg = response.data.msg;

            if (response.data.status != 0) {
                message.error(response.data.msg);
                return;
            }

            self.updateData();
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    mouseOverHandler(d, e) {
        this.setState({
            showToolTip: true,
            top: `${e.y - 10}px`,
            left: `${e.x + 10}px`,
            value: d.value,
            key: d.data.key,
        });
    }

    mouseMoveHandler(e) {
        if (this.state.showToolTip) {
            this.setState({ top: `${e.y}px`, left: `${e.x + 10}px` });
        }
    }

    mouseOutHandler() {
        this.setState({ showToolTip: false });
    }

    render() {
        const {
            casenum, picsnum, medsnum, presnum, notifications,
            fromstr, agerange, showToolTip,
            recentdates, recentcases,
            serverurl,
        } = this.state;

        return (
            <div className="gutter-example button-demo">
                <BreadcrumbCustom />

                <Row gutter={10}>
                    <Col className="gutter-row" span={4}>
                        <div className="gutter-box">
                            <Card bordered={false}>
                                <div className="clear y-center">
                                    <div className="pull-left mr-m">
                                        <Icon type="edit" className="text-2x text-danger" />
                                    </div>
                                    <div className="clear">
                                        <div className="text-muted">病例</div>
                                        <h2>{casenum}</h2>
                                    </div>
                                </div>
                            </Card>
                        </div>
                        <div className="gutter-box">
                            <Card bordered={false}>
                                <div className="clear y-center">
                                    <div className="pull-left mr-m">
                                        <Icon type="medicine-box" className="text-2x" />
                                    </div>
                                    <div className="clear">
                                        <div className="text-muted">药品</div>
                                        <h2>{medsnum}</h2>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </Col>
                    <Col className="gutter-row" span={4}>
                        <div className="gutter-box">
                            <Card bordered={false}>
                                <div className="clear y-center">
                                    <div className="pull-left mr-m">
                                        <Icon type="picture" className="text-2x text-info" />
                                    </div>
                                    <div className="clear">
                                        <div className="text-muted">照片</div>
                                        <h2>{picsnum}</h2>
                                    </div>
                                </div>
                            </Card>
                        </div>
                        <div className="gutter-box">
                            <Card bordered={false}>
                                <div className="clear y-center">
                                    <div className="pull-left mr-m">
                                        <Icon type="book" className="text-2x text-success" />
                                    </div>
                                    <div className="clear">
                                        <div className="text-muted">处方</div>
                                        <h2>{presnum}</h2>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </Col>
                    <Col className="gutter-row" span={16}>
                        <div className="gutter-box">
                            <Card bordered={false} className={'no-padding'}>
                                <EchartsRecent recentdates={recentdates} recentcases={recentcases} />
                            </Card>
                        </div>
                    </Col>
                    <Col className="gutter-row" span={16}>
                        <div className="gutter-box">
                            <Card bordered={false}>
                                <div className="pb-m">
                                    <h3>消息栏</h3>
                                </div>
                                <Popconfirm title="确定删除?" onConfirm={() => this.clearNotifications()}>
                                    <Icon type="delete" className="card-tool" />
                                </Popconfirm>
                                <ul className="list-group no-border">
                                <li key="serverurl" className="list-group-item">
                                    <a href="" className="pull-left w-40 mr-m">
                                        <img src={messageicon} className="img-responsive img-circle" alt="test" />
                                    </a>
                                    <div className="clear">
                                        <a href="" className="block">其他机器通过下面地址访问</a>
                                        <span className="text-danger"><a href={serverurl}>{serverurl}</a></span>
                                    </div>
                                </li>
                                {
                                    notifications.map(function(item) {
                                        return (
                                            <li key={notifications.indexOf(item)} className="list-group-item">
                                                <a href="" className="pull-left w-40 mr-m">
                                                    <img src={messageicon} className="img-responsive img-circle" alt="test" />
                                                </a>
                                                <div className="clear">
                                                    <a href="" className="block">{item.title}</a>
                                                    <span className="text-danger">{item.content}</span>
                                                </div>
                                            </li>
                                            );
                                    })
                                }
                                </ul>
                            </Card>
                        </div>
                    </Col>
                    <Col className="gutter-row" span={8}>
                        <div className="gutter-box">
                            <Card bordered={false}>
                                <div className="pb-m">
                                    <h3>病人年龄分布图</h3>
                                    <small>{this.state.fromstr}</small>
                                </div>
                                <a className="card-tool"><Icon type="sync" /></a>
                                <Row>
                                <Col span={16}>
                                    <PieChart
                                        size={300}
                                        data={agerange}
                                        mouseOverHandler={this.mouseOverHandler.bind(this)}
                                        mouseOutHandler={this.mouseOutHandler.bind(this)}
                                        mouseMoveHandler={this.mouseMoveHandler.bind(this)}
                                        padding={10}/>
                                    {
                                        showToolTip ?
                                            <ToolTip
                                                top={this.state.top}
                                                left={this.state.left}>
                                                {this.state.key+"("+this.state.value+")"}: {(this.state.value*100/this.state.total).toFixed(0)+"%"}
                                            </ToolTip>
                                        : <div></div>
                                    }
                                </Col>
                                <Col span={8}>

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

export default Dashboard;