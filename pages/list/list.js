// pages/list/list.js
const dayMap = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

Page({

  /**
   * 页面的初始数据
   */
  data: {
    weekWeather: [],
    city: '北京市',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // console.log('onLoad');
    let city = options.city;
    this.setData({
      city: city
    })
    this.getWeekWeather();
  },
  
  onPullDownRefresh() {
    this.getWeekWeather(() => {
      wx.stopPullDownRefresh();
    });    
  },

  getWeekWeather(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/future',
      data: {
        time: new Date().getTime(),
        city: this.data.city
      },
      success: res => {
        let result = res.data.result;
        this.setWeekWeather(result);
        callback && callback();
      }
    })
  },

  setWeekWeather(result) {
    let weekWeather = [];
    for(let i = 0; i < 7; i++) {
      let date = new Date()
      date.setDate(date.getDate() + i);
      weekWeather.push({
        day: dayMap[date.getDay()],
        date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
        temp: `${result[date.getDay()].minTemp}° - ${result[date.getDay()].maxTemp}°`,
        iconPath: `/images/${result[date.getDay()].weather}-icon.png`
      })
      this.setData({
        weekWeather: weekWeather
      })
    }
  },
})