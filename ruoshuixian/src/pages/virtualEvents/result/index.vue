<template>
  <div class="container">
    <GameTitle :isResult="true"></GameTitle>
    <div class="list">
      <p class="list-title">
        <span>序号</span>
        <span>时间</span>
        <span>正确答案</span>
        <span style="flex:3;">事件</span>
      </p>
      <p v-for="(item,index) in numberList" :key="index">
        <span>{{index+1}}</span>
        <span :class="{input:true, wrong:!item.isRight}">{{item.answer}}</span>
        <span class="year">{{item.date}}</span>
        <span style="flex:3;">{{item.event}}</span>
      </p>
    </div>
  </div>
</template>
<script>
import GameTitle from "@/components/gameTitle_new"
export default {
  components: {
    GameTitle
  },
  onLoad () {
    Object.assign(this.$data, this.$options.data())
    this.init();
  },
  onShareAppMessage: function (res) {
    let userid = this.$store.state.userInfo.id;
    return {
      path: "pages/firstPage/main?id=" + userid,
      title: "虚拟事件和日期，一起来玩吧！",
      success: function () {
        console.log("分享成功");
      },
      error: function () {
        console.log("分享失败");
      }
    }
  },
  data () {
    return {
      isResult: true,
      rule: {},
      numberList: [],
      userid: null
    }
  },
  methods: {
    init: function () {
      this.result = this.$store.state.result.right_and_wrong_results;

      let list = this.$store.state.ruleList.list;
      this.numberList = list.date.map((e, index) => {
        return {
          date: e,
          event: list.event[index],
          answer: this.result[index].number,
          isRight: this.result[index].result == 0,
        }
      });
    }
  }
}
</script>
<style lang="scss" scoped>
.list {
  margin: tovmin(100) tovmin(30) auto tovmin(130);
  color: white;
}

.list p {
  display: flex;
  align-items: center;
  text-align: center;
  height: tovmin(86);
}

.list p span {
  flex: 1;
  line-height: tovmin(60);
}

.list-title {
  color: $yellow;
}

.input {
  width: tovmin(164);
  height: tovmin(66);
  border: tovmin(2) solid $blue-border;
  border-radius: tovmin(8);
  margin: 0 auto;
}

.wrong {
  background: $red;
  border-radius: tovmin(8);
  border: none;
}

.answer {
  color: $green;
}
</style>
