const devicesId = "642700567" // devicesId
const api_key = "b10fFxWJHzK0GXVqC5ExtXBbfeI=" // Api-key 

Page({
  data: {
    peopleNum:0,
    temp:26.0,
    suggest:"",
  },

  /**
   * @description 页面下拉刷新事件
   */
 
   onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    this.onLoad();
    this.getDatapoints().then(datapoints => {
      this.update(datapoints)
      wx.hideLoading()
    }).catch((error) => {
      wx.hideLoading()
      console.error(error)})
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },


  /**
   * @description 页面加载生命周期
   */
  onLoad: function () {
    console.log(`your deviceId: ${devicesId}, apiKey: ${api_key}`)

    //每隔6s自动获取一次数据进行更新
    const timer = setInterval(() => {
      this.getDatapoints().then(datapoints => {
        this.update(datapoints)
      })
    }, 5000)
    wx.showLoading({
      title: '加载中'
    })
    this.getDatapoints().then((datapoints) => {
      wx.hideLoading()
      this.update(datapoints)
    }).catch((err) => {
      wx.hideLoading()
      console.error(err)
      clearInterval(timer) //首次渲染发生错误时禁止自动刷新
    })
  },


  getDatapoints: function () {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `https://api.heclouds.com/devices/${devicesId}/datapoints?datastream_id=Temperature,number&limit=20`,
        header: {
          'content-type': 'application/json',
          'api-key': api_key
        },
        success: (res) => {
          const status = res.statusCode
          const response = res.data
          if (status !== 200) { // 返回状态码不为200时将Promise置为reject状态
            reject(res.data)
            return ;
          }
          if (response.errno !== 0) { //errno不为零说明可能参数有误, 将Promise置为reject
            reject(response.error)
            return ;
          }

          if (response.data.datastreams.length === 0) {
            reject("当前设备无数据, 请先运行硬件实验")
          }

          //程序可以运行到这里说明请求成功, 将Promise置为resolve状态
          resolve({
            temperature: response.data.datastreams[0].datapoints,
            number: response.data.datastreams[1].datapoints
          })
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },

  update: function (datapoints) {
    const bathData = this.convert(datapoints);
    var temp = bathData.dataflow[0];
    var num = bathData.datatemp[0];
    var sug;
    if(temp>30 && num <9){
      sug = "欢迎使用澡堂服务，祝您拥有愉快的洗澡体验"
    }
    else if(temp>30 && num==9){
      sug = "目前淋浴位置已满，请您稍等片刻"
    }
    else if(temp<30 && num<5){
      sug = "澡堂目前室温不高，请您移步查看是否有热水"
    }
    else{
      sug = "澡堂目前热水不足，小助手也很无奈"
    }
    this.setData({
      temp:bathData.dataflow[0],
      peopleNum:bathData.datatemp[0],
      suggest:sug,
    })
    getApp().globalData.temp=bathData.dataflow[0];
  },


  convert: function (datapoints) {
    var dataflow = [];
    var datatemp = [];

    var length = datapoints.temperature.length
    for (var i = 0; i < length; i++) {
      dataflow.push(datapoints.number[i].value);
      datatemp.push(datapoints.temperature[i].value);
    }
    return {
      datatemp: datatemp,
      dataflow: dataflow
    }
  },

  datatemp: function(){
     wx.navigateTo({
       url: '/pages/datatemp/index?temp='+this.data.temp,
       })
  }

})


