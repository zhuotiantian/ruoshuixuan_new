import Vue from "vue";
import App from "./App";
import http from "./untils/request";
import Store from "./store/index";
Vue.config.productionTip = false;
Vue.config._mpTrace = true;
App.mpType = "app";
const app = new Vue(App);
app.$mount();
let pixelRatio = 0;
wx.getSystemInfo({
  success: function(res) {
    pixelRatio = Math.floor(res.pixelRatio);
  },
  fail: function() {
    pixelRatio = 0;
  }
});
Vue.prototype.$store = Store;
Vue.prototype.$http = http;
let _store = Vue.prototype.$store;
Vue.prototype.$toGame = (id, url, fn) => {
  _store.commit("setGameId", id);
  _store.commit("setLevel", "primary");
  _store.commit("setPockerNumber", 0);
  wx.showLoading();
  let userInfo = _store.state.userInfo;
  let token = userInfo.token;
  http
    .get({
      url: "/api/wxapp.game/getGame",
      data: {
        game_id: id
      },
      header: {
        token: token
      }
    })
    .then(result => {
      _store.commit("setRule", result.data);
      wx.hideLoading();
      if (fn) {
        fn();
      } else {
        wx.redirectTo({
          url: "/pages/gameIndex/main"
        });
      }
    });
};
Vue.prototype.$getGameInfo = function(prop) {
  let gameId = _store.state.gameid;
  let gameList = _store.state.gameList;
  return gameList.filter(e => {
    return e.id === gameId;
  })[0][prop];
};
