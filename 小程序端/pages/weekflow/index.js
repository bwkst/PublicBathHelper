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
    title: {
      text: ' ',
      left: 'center'
    },
    color: ["#37A2DA", "#299F97"],
    legend: {
      data: ['昨天', '前天'],
      top: 50,
      left: 'center',
      backgroundColor: 'white',
      z: 100
    },
    grid: {
      containLabel: true
    },
    tooltip: {
      show: true,
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'],
      // show: false
    },
    yAxis: {
      x: 'center',
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
      // show: false
    },
    series: [{
      name: '昨天',
      type: 'line',
      smooth: true,
      data: [3, 5, 8, 8, 5, 9, 4]
    }, {
      name: '前天',
      type: 'line',
      smooth: true,
      data: [4, 3, 6, 9, 4, 8, 7]
    }]
  };

  chart.setOption(option);
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
