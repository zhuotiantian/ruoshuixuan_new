<template>
  <div class="container">
    <div class="main">
      <h4>提现金额</h4>
      <span class="money">¥</span>
      <input type="number" v-model="inputMoney" @input="change">
      <span class="allCash" @click="getAllCash">全部提现</span>
      <p>可提现金额：{{money}}</p>
      <div style="text-align:center;margin-top:30px">
        <p class="btn submit-btn" @click="tixian">提现</p>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      list: [],
      money: 0,
      inputMoney: "",
      openid: ""
    };
  },
  onLoad () {
    Object.assign(this.$data, this.$options.data());
    this.token = this.$store.state.userInfo.token;
    this.getOpenid();
    this.getList();
  },
  methods: {
    getOpenid: function () {
      let that = this;
      wx.login({
        success: function (res) {
          that.$http.get({
            url: "/api/wxapp.user/getOpenId",
            data: {
              code: res.code,
              type: "user"
            },
            header: {
              token: that.token
            }
          }).then(result => {
            that.openid = result.data.openid;
          });
        }
      })

    },
    getList: function () {
      this.$http
        .get({
          url: "/api/wxapp.user/redEnvelopeRecord",
          header: {
            token: this.token
          }
        })
        .then(result => {
          this.list = result.data.list;
          this.money = result.data.money;
        });
    },
    change: function (e) {
      let reg = /\D/g;
      this.inputMoney = e.target.value.replace(reg, '');
    },
    tixian: function () {
      if (this.inputMoney > this.money) {
        wx.showToast({
          title: "可提现金额不足！",
          icon: "none"
        });
        return false;
      } else {
        let openid = this.openid;
        this.$http.post({
          url: "/api/wxapp.user/withdrawal",
          data: {
            money: this.inputMoney,
            openid: openid
          },
          header: {
            token: this.token
          }
        }).then(result => {
           wx.showToast({
            title: "提现成功",
            icon: "none"
          });
          wx.navigateBack({
            delta:1
          });
        });
      }
    },
    getAllCash: function () {
      this.inputMoney = this.money;
    }
  }
};
</script>
<style lang="scss" scoped>
.container {
  height: calc(100% - 60px);
  background: #f7f7f7;
  position: absolute;
  width: calc(100% - 60px);
  font-size: tovmin(28);
  padding: tovmin(30);
}

.main {
  background: white;
  height: 50vh;
  padding: tovmin(30);
  position: relative;
}

.money {
  font-size: tovmin(100);
  margin-top: tovmin(80);
  font-weight: bolder;
  position: absolute;
}

input {
  display: inline-block;
  height: tovmin(100);
  line-height: tovmin(100);
  font-size: tovmin(80);
  width: 80%;
  margin-left: tovmin(30);
  border-bottom: 1px solid #eaeaea;
  margin-top: tovmin(100);
  padding-left: tovmin(80);
  padding-bottom: tovmin(30);
  margin-right: tovmin(300);
}

.submit-btn {
  height: tovmin(66);
  width: tovmin(362);
  text-align: center;
  border-radius: tovmin(10);
  line-height: tovmin(66);
  font-size: tovmin(32);
  margin: 0 auto;
  background: rgb(14, 187, 14);
  color: white;
  position: absolute;
  left: 22%;
  bottom: tovmin(40);
}

.allCash {
  color: $green;
  position: absolute;
  right: tovmin(30);
  top: 40vmin;
}
</style>
