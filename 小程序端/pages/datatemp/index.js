import * as echarts from '../../ec-canvas/echarts';

const app = getApp();

function initChart(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart);
  var option = {
    backgroundColor: "#C6E0FA",
    color: ["#37A2DA", "#32C5E9", "#67E0E3"],
    series: [{
      name: '',
      type: 'gauge',
      detail: {
        formatter: '{value}°'
      },
      axisLine: {
        show: true,
        lineStyle: {
          width: 30,
          shadowBlur: 0,
          color: [
            [0.2, '#299F97'],
            [0.6, '#37a2da'],
            [1, '#fd666d']
          ]
        }
      },
      data: [{
        value: app.globalData.temp,
        name: '',
      }]

    }]
  };

  chart.setOption(option, true);

  return chart;
}

Page({
  data: {
    ec: {
      onInit: initChart
    }
  },

  onReady() {
  }
});
