<template>
  <div class="container">
    <textarea placeholder-style="color: #c6c6c6;" v-model="content" name="" id="" cols="30" rows="10" placeholder="输入推送消息"></textarea>
    <p style="text-align:center"><button class="btn submit-btn" @click="sendMessage">发送</button></p>
    <div class="fog" v-if="showSuccessBox" @click="back"></div>
    <div class="alertBox" v-if="showSuccessBox">
      <image class="image" :src="'/static/images/my/check.png'"></image>
      <span>发送成功</span>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      showSuccessBox: false,
      token: null,
      content: ""
    }
  },
  methods: {
    back: function () {
      this.showSuccessBox = false;
      clearTimeout(this.timer);
      wx.navigateBack({
        delta: 1
      });
    },
    sendMessage: function () {
      this.token = this.$store.state.userInfo.token;
      this.showSuccessBox = true;
      this.$http.post({
        url: "/api/wxapp.user/otherNews",
        data: {
          content: this.content
        },
        header: {
          token: this.token
        }
      }).then(result => {
        if (result.code == 1) {
          this.timer = setTimeout(() => {
            this.back();
          }, 1000)
        }
      })
    }
  },
}
</script>
<style lang="scss" scoped>
.container {
  position: absolute;
  height: 100%;
  background: $grey-background;
  width: 100%;
}

textarea {
  border: tovmin(2) solid #e9e9e9;
  background: $grey-background;
  border-radius: tovmin(12);
  width: tovmin(630);
  height: tovmin(306);
  box-sizing: border-box;
  margin: tovmin(40) auto auto;
  font-size: tovmin(28);
}

.btn {
  background-color: #ffc400;
  width: 40%;
  border-radius: tovmin(44);
  font-size: tovmin(32);
  margin: tovmin(120) auto auto;
  height: tovmin(88);
  width: tovmin(362);
  line-height: tovmin(88);
}

.image {
  width: tovmin(88);
  height: tovmin(88);
  margin-bottom: tovmin(40);
}

.alertBox {
  background: white;
  display: flex;
  flex-direction: column;
  height: tovmin(272);
  width: tovmin(272);
  border-radius: tovmin(22);
  position: absolute;
  top: 35%;
  left: 50%;
  margin-left: tovmin(-136);
  z-index: 1001;
  justify-content: center;
  align-items: center;
}
</style>
