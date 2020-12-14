const app = getApp()

Page({
  data: {
  },
  
  bindViewTap: function() {
  },

  onLoad: function () {
  },

  suggestion: function(){
    wx.navigateTo({
      url: '/pages/suggestion/suggestion',
      })
  },
  flowrate: function(){
    wx.navigateTo({
      url: '/pages/flowrate/flowrate',
      })
  },
  temperature: function(){
    wx.navigateTo({
      url: '/pages/temperature/temperature',
      })
  }
})
