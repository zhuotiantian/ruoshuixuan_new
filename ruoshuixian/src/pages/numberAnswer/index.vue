<template>
  <div class="container">
    <p class="info" v-if="!showKeybord">加载中...</p>
    <div class="fog" v-if="showFog"></div>
    <alertBox :text="text" v-if="showFog" @hideFog="hideFog" @confirm="confirm"></alertBox>
    <GameTitle v-if="showKeybord" :showIntervalTime="showKeybord" :showFinishAnwserBtn="true" @finishAnwser="finishAnwser"></GameTitle>
    <div class="list">
      <div class="row" v-for="(rows, _index) in getNumbers" :key="_index">
        <span :class="{ item: true, selected: item.selected }" v-for="(item, index) in rows" :key="index" @click="selected(_index, index)">{{ item.number }}</span>
        <span style="width:50px">row&nbsp;&nbsp;{{ _index + 1 }}</span>
      </div>
    </div>
    <Keybord :showKeybord="showKeybord" @selectNumber="selectNumber" @deleteNumber="deleteNumber"></Keybord>
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
  onLoad() {
    Object.assign(this.$data, this.$options.data());

    wx.setNavigationBarTitle({
      title: this.$getGameInfo("name")
    });
    this.init();
  },
  data() {
    return {
      showKeybord: false,
      showFog: false,
      number: [],
      rowIndex: 0,
      columnIndex: 0,
      gameName: "",
      count: 10,
      lastIndex: 10
    };
  },
  onReachBottom: function(e) {
    if (this.lastIndex < this.number.length) {
      // 获取滚动条当前位置
      this.lastIndex += 10;
    }
  },
  computed: {
    getNumbers: function() {
      return this.number.slice(0, this.lastIndex);
    }
  },
  methods: {
    init: function() {
      let level = this.$store.state.level;
      let rule = this.$store.state.rule.rules_of_the_game.filter(e => {
        return e.game_level == level;
      })[0];
      let numberList = this.$store.state.ruleList.list.map(e => {
        return {
          number: "",
          selected: false
        };
      });
      let total = rule.number,
        per = rule.number_per_group,
        number = [];
      for (var i = 0; i < total; i += per) {
        number.push(numberList.slice(i, i + per));
      }
      this.number = number;
      this.startTime = new Date().getTime();
      this.showKeybord = true;
      this.selected(this.rowIndex, this.columnIndex);
    },
    finishAnwser: function() {
      this.showFog = true;
    },
    hideFog: function() {
      this.showFog = false;
    },
    confirm: function() {
      let token = this.$store.state.userInfo.token,
        game_records_id = this.$store.state.ruleList.game_records_id;
      let endTime = new Date().getTime();
      let result = [];
      this.number.forEach(e => {
        e.forEach(m => {
          result.push(m.number);
        });
      });
      this.$http
        .post({
          url: "/api/wxapp.game/submitTheGame",
          data: {
            game_records_id,
            game_time: (endTime - this.startTime) / 1000,
            content: JSON.stringify(result)
          },
          header: {
            token
          }
        })
        .then(result => {
          if (result.code == 1) {
            this.$store.commit("setResult", result.data);
            wx.reLaunch({
              url: "/pages/numberResult/main"
            });
          } else {
            wx.showToast({
              title: result.msg,
              icon: "none"
            });
          }
        });
    },
    //选中格子
    selected: function(row, column) {
      this.rowIndex = row;
      this.columnIndex = column;
      this.cleanActive();
      this.active();
    },
    //选择填写的数字
    selectNumber: function(data) {
      let current = this.number[this.rowIndex][this.columnIndex];
      if (current.selected) {
        current.number = data;
      }
      this.$set(this.number[this.rowIndex], this.columnIndex, current);
      this.$set(this.number[this.rowIndex][this.columnIndex], "selected", false);
      if (this.columnIndex < this.number[this.rowIndex].length - 1) {
        this.columnIndex++;
      } else if (this.rowIndex < this.number.length - 1 && this.columnIndex == this.number[this.rowIndex].length - 1) {
        this.rowIndex++;
        this.columnIndex = 0;
      }
      this.$set(this.number[this.rowIndex][this.columnIndex], "selected", true);
    },
    //删除填写的数字
    deleteNumber: function() {
      let current = this.number[this.rowIndex][this.columnIndex];
      if (current.number !== "") {
        current.number = "";
      }
      this.backSpace();
    },
    // 去掉所有的选中状态
    cleanActive: function() {
      let number = this.number.concat();
      number.forEach(e => {
        e.forEach(m => {
          m.selected = false;
        });
      });
      this.number = number;
    },
    // 为格子添加选中状态
    active: function() {
      let item = this.number[this.rowIndex][this.columnIndex];
      item.selected = true;
      this.$set(this.number[this.rowIndex], this.columnIndex, item);
    },
    // 退格
    backSpace: function() {
      this.$set(this.number[this.rowIndex][this.columnIndex], "selected", false);
      if (this.columnIndex === 0 && this.rowIndex > 0) {
        this.rowIndex--;
        this.columnIndex == this.number[this.rowIndex].length - 1;
      } else if (this.columnIndex > 0) {
        this.columnIndex--;
      }
      this.$set(this.number[this.rowIndex][this.columnIndex], "selected", true);
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
  margin-bottom: tovmin(360);
}

.row {
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

.selected {
  border: 1px solid red;
  margin-right: tovmin(-1);
  position: relative;
  z-index: 10;
}
</style>
