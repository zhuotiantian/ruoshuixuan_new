<template>
  <div class="container">
    <GameTitle :isResult="true" :showCorrectAnswerBtn="showCorrectBtn" :showMyAnswer="showMyAnswer" @showCorrectAnswer="showCorrectAnswer" @showMyAnswerHandler="showMyAnswerHandler"></GameTitle>
    <div class="list">
      <div class="row" v-for="(rows,_index) in number" :key="_index">
        <template v-if="showCorrectBtn">
          <div>
            <span :class="{item:true,wrong:item.result===1}" v-for="(item,index) in rows" :key="index">{{item.number}}</span>
            <span style="width:50px">row&nbsp;&nbsp;{{_index+1}}</span>
          </div>
        </template>
        <template v-else>
          <div>
            <span :class="{item:true}" v-for="(item,index) in rows" :key="index">{{item.correct_result}}</span>
            <span style="width:50px">row&nbsp;&nbsp;{{_index+1}}</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script>
import GameTitle from "@/components/gameTitle_new";
import Keybord from "@/components/Keybord";
import alertBox from "@/components/alertBox";
export default {
  components: {
    GameTitle,
    Keybord,
    alertBox
  },
  onShareAppMessage: function(res) {
    return {
      path: "pages/firstPage/main?id=" + this.userid,
      title: this.gameName + "，一起来玩吧！",
      success: function() {
        console.log("分享成功");
      },
      error: function() {
        console.log("分享失败");
      }
    };
  },
  onLoad() {
    Object.assign(this.$data, this.$options.data());
    this.init();
  },
  mounted() {
    wx.setNavigationBarTitle({
      title: this.gameName
    });
  },
  data() {
    return {
      number: [],
      result: [],
      userid: null,
      gameName: "",
      showCorrectBtn: true,
      showMyAnswer: false
    };
  },
  onReachBottom: function(e) {
    if (this.lastIndex < this.allNumber.length) {
      // 获取滚动条当前位置
      this.number = this.number.concat(
        this.allNumber.slice(this.lastIndex, this.lastIndex + 10)
      );
      this.lastIndex += 10;
    }
  },
  methods: {
    init: function() {
      let level = this.$store.state.level;
      this.userid = this.$store.state.userInfo.id;
      let rule = this.$store.state.rule.rules_of_the_game.filter(e => {
        return e.game_level == level;
      })[0];
      let result = this.$store.state.result;
      let correct_result = result.correct_result;
      result.right_and_wrong_results.forEach((e, index) => {
        e.correct_result = correct_result[index];
      });
      this.correct_result = correct_result;
      this.result = result.right_and_wrong_results;
      let total = rule.number;
      let per = rule.number_per_group;
      let number = [];
      for (var i = 0; i < total; i += per) {
        number.push(this.result.slice(i, i + per));
      }
      this.gameName = this.$getGameInfo("name");
      this.allNumber = number;
      this.number = number.slice(0, 10);
      this.lastIndex = 10;
    },
    showCorrectAnswer: function() {
      this.showMyAnswer = true;
      this.showCorrectBtn = false;
      wx.pageScrollTo({
        scrollTop: 0
      });
    },
    showMyAnswerHandler: function() {
      this.showMyAnswer = false;
      this.showCorrectBtn = true;
      wx.pageScrollTo({
        scrollTop: 0
      });
    }
  }
};
</script>
<style lang="scss" scoped>
page {
  height: calc(100% - 150px) !important;
}

.container {
  background: $deep-blue;
  color: white;
  height: calc(100% - 150px);
}

.list {
  margin-top: tovmin(150);
}

.row > div {
  display: flex;
  width: 80%;
  margin: 0 auto;
  margin-bottom: tovmin(30);
}

.item {
  flex: 1;
  border: tovmin(2) solid $middle-blue;
  border-right: none;
  height: tovmin(40);
  width: tovmin(28);
  text-align: center;
}

.item:nth-last-child(2) {
  border-right: tovmin(2) solid $middle-blue;
  margin-right: tovmin(20);
}

.wrong {
  color: $grey-text;
  background: $red;
}
</style>
