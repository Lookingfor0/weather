const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}

const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}

const QQMapWX = require('../../libs/qqmap-wx-jssdk.js');

const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2

const UNPROMPTED_TIPS = '点击获取当前位置'
const UNAUTHORIZED_TIPS = '点击开启位置权限'
const AUTHORIZED_TIPS = ''

Page({
  data: {
    nowTemp: '',
    nowWeather: '',
    nowWeatherBackground: '',
    hourlyWeather: [],
    todayDate: '',
    todayTemp: '',
    city: '北京市',
    locationAuthType: UNPROMPTED,
  },

  onLoad() {
    // console.log('onLoad');    
    this.qqmapsdk = new QQMapWX({
      key: '6K5BZ-7CREU-CWJVR-26W25-WMOVZ-2YBK5'
    });
    wx.getSetting({
      success: res=>{
        let auth = res.authSetting['scope.userLocation'];
        this.setData({
          locationAuthType: auth?AUTHORIZED:(auth===false)?UNAUTHORIZED:UNPROMPTED,
        })
        if (auth)
          this.getLocationAndWeather();
        else
          this.getNow();
      }
    })
  },

  onPullDownRefresh() {
    this.getNow(() => {
      wx.stopPullDownRefresh()
    });
  },

  getNow(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: this.data.city
      },
      success: res => {
        let result = res.data.result;
        this.setNow(result);
        this.setForecast(result);
        this.setToday(result);
      },
      complete: () => {
        callback && callback()
      }
    })
  },
  
  setNow(result) {
    let temp = result.now.temp;
    let weather = result.now.weather;
    this.setData({
      nowTemp: temp + '°',
      nowWeather: weatherMap[weather],
      nowWeatherBackground: '/images/' + weather + '-bg.png'
    })
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather],
    })
  },
  
  setForecast(result) {
    let forecast = result.forecast
    let nowHour = new Date().getHours()
    let hourlyWeather = []
    for (let i = 0; i < 8; i++) {
      hourlyWeather.push({
        time: (i * 3 + nowHour) % 24 + '时',
        iconPath: '/images/' + forecast[i].weather + '-icon.png',
        temp: forecast[i].temp + '°'
      })
    }
    hourlyWeather[0].time = '现在'
    this.setData({
      hourlyWeather: hourlyWeather
    })
  },
  
  setToday(result) {
    let date = new Date();
    this.setData({
      todayDate: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 今天`,
      todayTemp: `${result.today.minTemp}° - ${result.today.maxTemp}°`,
    })
  },
  
  onTapDayWeather() {
    wx.showToast();
    wx.navigateTo({
      url: '/pages/list/list?city=' + this.data.city,
    })
  },
  
  onTapLocation() {
    if (this.data.locationAuthType === UNAUTHORIZED)
      wx.openSetting({
        success: res=>{
          let auth = res.authSetting['scope.userLocation'];
          if (auth) {
            this.setData({
              locationAuthType: AUTHORIZED
            })
            this.getLocationAndWeather()
          }
        }
      })
    else 
      this.getLocationAndWeather()
  },
  
  getLocationAndWeather() {
    wx.getLocation({
      success: res => {
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res => {
            let city = res.result.address_component.city;
            this.setData({
              city: city,
            });
            this.getNow();
          },
          fail: function (res) {
            console.log(res);
          },
        });
        this.setData({
          locationAuthType: AUTHORIZED
        })
      },
      fail: res => {
        this.setData({
          locationAuthType: UNAUTHORIZED,
        })
      }
    })
  },
})