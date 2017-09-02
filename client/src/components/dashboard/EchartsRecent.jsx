import React from 'react';
import ReactEcharts from 'echarts-for-react';

let xAxisData = [];
let data = [];
for (let i = 0; i < 50; i++) {
    xAxisData.push(i);
    data.push(Math.ceil((Math.cos(i / 5) * (i / 5) + i / 6) * 5) + 10);
}

class EchartsProjects extends React.Component {
    state = {
        option: {
            title: {
                text: '最近50天门诊量变化',
                left: 'center',
                textStyle: {
                    color: '#ccc',
                    fontSize: 10
                }
            },
            backgroundColor: '#08263a',
            xAxis: [{
                show: true,
                data: [],
                axisLabel: {
                    textStyle: {
                        color: '#ccc'
                    }
                }
            }, {
                show: false,
                data: xAxisData
            }],
            tooltip: {},
            visualMap: {
                show: false,
                min: 0,
                max: 50,
                dimension: 0,
                inRange: {
                    color: ['#4a657a', '#308e92', '#b1cfa5', '#f5d69f', '#f5898b', '#ef5055']
                }
            },
            yAxis: {
                axisLine: {
                    show: false
                },
                axisLabel: {
                    textStyle: {
                        color: '#ccc'
                    }
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: '#08263f'
                    }
                },
                axisTick: {
                    show: false
                }
            },
            series: [
                {
                name: 'Simulate Shadow',
                type: 'line',
                data: [],
                z: 2,
                showSymbol: false,
                animationDelay: 0,
                animationEasing: 'linear',
                animationDuration: 1200,
                lineStyle: {
                    normal: {
                        color: 'transparent'
                    }
                },
                areaStyle: {
                    normal: {
                        color: '#08263a',
                        shadowBlur: 50,
                        shadowColor: '#000'
                    }
                }
            }, {
                name: '日门诊量',
                type: 'bar',
                data: [],
                xAxisIndex: 1,
                z: 3,
                itemStyle: {
                    normal: {
                        barBorderRadius: 5
                    }
                }
            }],
            animationEasing: 'elasticOut',
            animationEasingUpdate: 'elasticOut',
            animationDelay: function (idx) {
                return idx * 20;
            },
            animationDelayUpdate: function (idx) {
                return idx * 20;
            }
        }
    }

    componentDidMount() {
        const { option } = this.state;

        option.xAxis[0].data = this.props.recentdates;
        option.xAxis[1].data = this.props.recentdates;
        option.series[0].data = this.props.recentcases;
        option.series[1].data = this.props.recentcases;

        this.setState({ option });
    }

    componentWillReceiveProps(nextProps) {
        const { option } = this.state;

        if (
            (nextProps.recentdates !== option.xAxis[0].data) ||
            (nextProps.recentcases !== option.series[0].data)
            ){
            option.xAxis[0].data = nextProps.recentdates;
            option.xAxis[1].data = nextProps.recentdates;
            option.series[0].data = nextProps.recentcases;
            option.series[1].data = nextProps.recentcases;

            this.setState({ option });
        }
    }

    render() {
        const { option } = this.state;

        return (
            <ReactEcharts
                option={option}
                style={{height: '212px', width: '100%'}}
                className={'react_for_echarts'}/>
            );
    }
}

export default EchartsProjects;