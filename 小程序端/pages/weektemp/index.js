import * as echarts from '../../ec-canvas/echarts';

const app = getApp();

function initChart(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart);

  const model = {
    yCates: ['周日', '周六', '周五',
      '周四', '周三', '周二',
      '周一'],
    xCates: ['18:00','19:00', '20:00', '21:00', '22:00'],
    data: [
      // [yCateIndex, xCateIndex, value]
      [0, 0, 13], [0, 1, 27], [0, 2, 43], [0, 3, 45], [0, 4, 42],
      [1, 0, 17], [1, 1, 22], [1, 2, 44], [1, 3, 48], [1, 4, 42],
      [2, 0, 21], [2, 1, 33], [2, 2, 38], [2, 3, 46], [2, 4, 37],
      [3, 0, 13], [3, 1, 27], [3, 2, 45], [3, 3, 51], [3, 4, 46],
      [4, 0, 13], [4, 1, 22], [4, 2, 37], [4, 3, 48], [4, 4, 39],
      [5, 0, 22], [5, 1, 32], [5, 2, 43], [5, 3, 44], [5, 4, 47],
      [6, 0, 16], [6, 1, 35], [6, 2, 43], [6, 3, 51], [6, 4, 42]
    ]
  };

  const data = model.data.map(function (item) {
    return [item[1], item[0], item[2] || '-'];
  });

  const option = {
    backgroundColor: "#C6E0FA",
    tooltip: {
      position: 'top'
    },
    animation: false,
    grid: {
      bottom: 60,
      top: 60,
      left: 70
    },
    xAxis: {
      type: 'category',
      data: model.xCates
    },
    yAxis: {
      type: 'category',
      data: model.yCates
    },
    visualMap: {
      min: 10,
      max: 60,
      show: false,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 10,
      inRange: {
        color: ["#67E0F0","#32C5E9","#37A2DA"],
      }
    },

    series: [{
      name: '温度 (°C)',
      type: 'heatmap',
      data: data,
      label: {
        normal: {
          show: true
        }
      },
      itemStyle: {
        emphasis: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
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
