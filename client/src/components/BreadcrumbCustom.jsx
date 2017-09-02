import React from 'react';
import { Breadcrumb, Switch, Icon } from 'antd';
import { Link } from 'react-router';
import themes from '../style/theme';

class BreadcrumbCustom extends React.Component {
    state = {
        switcherOn: false,
        theme: null,
        themes: [
            {type: 'info', checked: false},
            {type: 'grey', checked: false},
            {type: 'danger', checked: false},
            {type: 'warn', checked: false},
            {type: 'white', checked: true},
        ],
    };
    componentDidMount() {
        this.state.themes.forEach(val => {
            val.checked && this.setState({
                theme: themes['theme' + val.type] || null
            });
        });
    }
    render() {
        const first = <Breadcrumb.Item>{this.props.first}</Breadcrumb.Item> || '';
        const second = <Breadcrumb.Item>{this.props.second}</Breadcrumb.Item> || '';
        return (
            <span>
                <Breadcrumb style={{ margin: '12px 0' }}>
                    <Breadcrumb.Item><Link to={'/app/dashboard/index'}>首页</Link></Breadcrumb.Item>
                        {first}
                        {second}
                </Breadcrumb>
                <style>{`
                    ${this.state.theme ?
                    `
                    .custom-theme {
                        background: ${this.state.theme.header.background} !important;
                        color: #fff !important;
                    }
                    .custom-theme .ant-menu {
                        background: ${this.state.theme.header.background} !important;
                        color: #fff !important;
                    }
                    .custom-theme .ant-menu-item-group-title {
                        color: #fff !important;
                    }
                    ` : ''
                    }
                `}</style>
            </span>
        )
    }
}

export default BreadcrumbCustom;
