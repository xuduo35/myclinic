import React, { Component } from 'react';
import { hashHistory } from 'react-router';
import { Card, Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox, Button, message, Upload } from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom';
import axios from 'axios';
const FormItem = Form.Item;
const Option = Select.Option;

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

function beforeUpload(file) {
  const isJPG = file.type === 'image/jpeg';
  if (!isJPG) {
    message.error('只能上传JPG文件!!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('图片必须小于2M字节!');
  }
  return isJPG && isLt2M;
}

class PersonalSetting extends Component {
    state = {
        confirmDirty: false,
        imageUrl: null,
    };
    componentDidMount = () => {
        var self = this;

        axios.post('/api/user/profile', {})
        .then(function (response) {
            var msg = response.data.msg;

            if (response.data.status != 0) {
                message.error(msg.msg);
                return;
            }

            self.setState({
                imageUrl: msg.avatar
            })
        })
        .catch(function (error) {
            console.log(error);
        });
    }
    handleChange = (info) => {
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            getBase64(info.file.originFileObj, imageUrl => this.setState({ imageUrl }));
        }
    }
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                axios.post('/api/user/setting', {
                    oldpwd: values.oldpassword,
                    pwd: values.password,
                })
                .then(function (response) {
                    var msg = response.data.msg;

                    if (response.data.status != 0) {
                        message.error(response.data.msg);
                        return;
                    }

                    localStorage.setItem('user', JSON.stringify(null));

                    setTimeout(function() {
                        // 重定向到登录界面
                        hashHistory.replace({ pathname: '/login' });
                    }, 1000);
                })
                .catch(function (error) {
                    console.log(error);
                });
            }
        });
    };
    handleConfirmBlur = (e) => {
        const value = e.target.value;
        this.setState({ confirmDirty: this.state.confirmDirty || !!value });
    };
    checkPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('password')) {
            callback('两次输入密码不一致!');
        } else {
            callback();
        }
    };
    checkConfirm = (rule, value, callback) => {
        const form = this.props.form;
        if (value && this.state.confirmDirty) {
            form.validateFields(['confirm'], { force: true });
        }
        callback();
    };
    render() {
        const { imageUrl } = this.state;
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 14 },
            },
        };
        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 14,
                    offset: 8,
                },
            },
        };
        const prefixSelector = getFieldDecorator('prefix', {
            initialValue: '86',
        })(
            <Select className="icp-selector" style={{width: '60px'}}>
                <Option value="86">+86</Option>
            </Select>
        );

        return (
        <div className="gutter-example">
            <BreadcrumbCustom first="用户" second="个人设置" />
            <Row gutter={16}>
                <Col className="gutter-row" span={12}>
                    <div className="gutter-box">
                        <Card title="个人设置" bordered={false}>
                            <Form onSubmit={this.handleSubmit}>
                                <Row type="flex" justify="center">
                                <FormItem {...formItemLayout}>
                                    <Upload
                                        className="avatar-uploader"
                                        name="avatar"
                                        showUploadList={false}
                                        action="/api/avatar/upload"
                                        beforeUpload={beforeUpload}
                                        onChange={this.handleChange}>
                                    {
                                        imageUrl ?
                                        <img style={{width:'70px',height:'70px',borderRadius:'70px'}} src={imageUrl} alt="" className="avatar" /> :
                                        <Icon type="plus" className="avatar-uploader-trigger" />
                                    }
                                    </Upload>
                                </FormItem>
                                </Row>
                                <FormItem
                                    {...formItemLayout}
                                    label="旧密码"
                                    hasFeedback>
                                    {getFieldDecorator('oldpassword', {
                                        rules: [{
                                            required: true, message: '旧密码!',
                                        }, {
                                        }],
                                    })(
                                        <Input type="password" />
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="密码"
                                    hasFeedback>
                                    {getFieldDecorator('password', {
                                        rules: [{
                                            required: true, message: '请输入密码!',
                                        }, {
                                            validator: this.checkConfirm,
                                        }],
                                    })(
                                        <Input type="password" />
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="确认密码"
                                    hasFeedback>
                                    {getFieldDecorator('confirm', {
                                        rules: [{
                                            required: true, message: '请确认你的密码!',
                                        }, {
                                            validator: this.checkPassword,
                                        }],
                                    })(
                                        <Input type="password" onBlur={this.handleConfirmBlur} />
                                    )}
                                </FormItem>
                                <FormItem {...tailFormItemLayout}>
                                    <Button type="primary" htmlType="submit" size="large">提交</Button>
                                </FormItem>
                            </Form>
                        </Card>
                    </div>
                </Col>
            </Row>
        </div>
        )
    }
}

export default Form.create()(PersonalSetting);