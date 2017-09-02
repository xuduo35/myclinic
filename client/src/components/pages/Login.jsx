import React from 'react';
import { hashHistory } from 'react-router';
import { Form, Icon, Input, Button, Checkbox, message } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from 'axios';

const FormItem = Form.Item;

class Login extends React.Component {
    state = {
        remember: false
    }

    componentDidMount() {
        try {
            var remember = JSON.parse(localStorage.getItem('remember'));

            if (typeof remember == 'undefined') {
                remember = true; // 第一次使用, 缺省记住
                localStorage.setItem('remember', JSON.stringify(remember));
            }
        } catch(err) {
            remember = true;
        }

        this.setState({remember});
    }

    handleSubmit = (e) => {
        e.preventDefault();

        this.props.form.validateFields((err, values) => {
            if (!err) {
                axios.post('/api/user/login', {
                    name: values.userName,
                    pwd: values.password,
                })
                .then(function (response) {
                    var msg = response.data.msg;

                    if (response.data.status != 0) {
                        message.error(response.data.msg);
                        return;
                    }

                    localStorage.setItem('remember', JSON.stringify(values.remember));

                    if (values.remember) {
                        localStorage.setItem('user', JSON.stringify(msg));
                    } else {
                        localStorage.setItem('user', JSON.stringify(null));
                    }

                    hashHistory.push({
                        pathname: '/',
                        state: { data: msg },
                        });
                })
                .catch(function (error) {
                    console.log(error);
                });
            }
        });
    };

    render() {
        const { remember } = this.state;
        const { getFieldDecorator } = this.props.form;

        return (
            <div className="login">
                <div className="login-form" >
                    <div className="login-logo">
                        <span>西医病例管理系统</span>
                    </div>
                    <Form onSubmit={this.handleSubmit} style={{maxWidth: '300px'}}>
                        <FormItem>
                            {getFieldDecorator('userName', {
                                rules: [{ required: true, message: '请输入用户名!' }],
                            })(
                                <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="admin" />
                            )}
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('password', {
                                rules: [{ required: true, message: '请输入密码!' }],
                            })(
                                <Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="缺省123456" />
                            )}
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('remember', {
                                valuePropName: 'checked',
                                initialValue: remember,
                            })(
                                <Checkbox>记住我</Checkbox>
                            )}
                            <Button type="primary" htmlType="submit" className="login-form-button" style={{width: '100%'}}>
                                登录
                            </Button>
                        </FormItem>
                    </Form>
                </div>
            </div>

        );
    }
}

export default Form.create()(Login);