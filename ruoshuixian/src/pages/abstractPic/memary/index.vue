<template>
  <div class="container">
    <GameTitle :showIntervalTime="true" ref="title" :showFinishMemoryBtn="true" @finishMemary="finishMemary"></GameTitle>
    <div class="list">
      <div class="row" v-for="(rows, _index) in number" :key="_index">
        <div class="image" v-for="(item, index) in rows" :key="index">
          <image class="image" :src="domain + item.img" lazy-load="true" />
        </div>
        <span>row&nbsp;&nbsp;{{ _index + 1 }}</span>
      </div>
    </div>
  </div>
</template>
<script>
import GameTitle from "@/components/gameTitle_new";
export default {
  components: {
    GameTitle
  },
  data() {
    return {
      numberList: [],
      number: [],
      counts: 0,
      total: 0,
      per: 0,
      domain: this.$http.domain,
      numberList: []
    };
  },
  onLoad(option) {
    Object.assign(this.$data, this.$options.data());
    this.init();
  },
  onReachBottom: function(e) {
    if (this.lastIndex < this.allNumber.length) {
      // 获取滚动条当前位置
      this.number = this.number.concat(
        this.allNumber.slice(this.lastIndex, this.lastIndex + 4)
      );
      this.lastIndex += 4;
    }
  },
  methods: {
    init: function() {
      let level = this.$store.state.level;
      let rule = this.$store.state.rule.rules_of_the_game.filter(e => {
        return e.game_level == level;
      })[0];
      let total = rule.number,
        per = rule.number_per_group,
        number = [];
      this.numberList = this.$store.state.ruleList.list.map((e, index) => {
        return {
          img: e,
          index: index % 5
        };
      });
      for (var i = 0; i < total; i += per) {
        let arr = this.numberList.slice(i, i + per);
        number.push(arr);
      }
      this.allNumber = number.concat();
      this.number = number.slice(0, 4);
      this.lastIndex = 4;
    },
    finishMemary: function() {
      wx.reLaunch({
        url: "../answer/main?list=" + JSON.stringify(this.number)
      });
    }
  }
};
</script>
<style lang="scss" scoped>
page {
  height: calc(100% - 75px) !important;
}

.container {
  background: $deep-blue;
  color: white;
  height: calc(100% - 75px);
}

.list {
  margin-top: tovmin(160);
  margin-left: tovmin(200);
}

.row {
  display: flex;
  width: 80%;
  margin: 0 auto;
  height: tovmin(140);
  line-height: tovmin(140);
  color: $grey-text;
  margin-bottom: tovmin(44);
}

.image {
  height: tovmin(140);
  width: tovmin(140);
  background: white;
  margin-right: tovmin(50);
}
</style>
