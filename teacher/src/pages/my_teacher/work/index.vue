<template>
  <div class="container">
    <div class="fog" v-if="showDrop||showSuccessBox" @click="hideDrop"></div>
    <div class="alertBox" v-if="showSuccessBox">
      <image class="image" :src="'/static/images/my/check.png'" />
      <span>发送成功</span>
    </div>
    <scroll-view :style="{'height': '90vh'}" scroll-y="true">
      <div class="top">
        <input placeholder-style="color: #AFAFAF;" type="text" v-model="workname" placeholder="请输入作业名称" />
        <p class="item" @click="showGroup">{{selectGroupName}}</p>
        <p class="item" @click="showStudents">{{selectStudentsName}}</p>
      </div>
      <div class="middle">
        <p class="title">选择游戏：</p>
        <ul class="gameList">
          <li v-for="(item,index) in game" :key="index" @click="selectGameHan(item,index)">
            <em :class="{checkBox:true, active:item.selected}"></em>
            <span>{{item.name}}</span>
          </li>
        </ul>
      </div>
      <textarea cols="30" rows="10" v-if="!showDrop" v-model="remarks" placeholder="备注"></textarea>
      <p style="text-align:center">
        <button class="submit-btn btn" @click="sendMessage">发送</button>
      </p>
    </scroll-view>
    <div :class="{drop_up:true,up:showDrop,down:!showDrop}">
      <template v-if="type=='group'">
        <p class="title">组别选择</p>
        <scroll-view :style="{'height': '384rpx'}" scroll-y="true">
          <ul class="list">
            <li v-for="(item,index) in stu_list" :key="index" @click="selectGroup(index)">
              <span>{{item.name}}</span>
              <image class="icon" v-if="selectedGroup==index" :src="'/static/images/my/select.png'" />
            </li>
          </ul>
        </scroll-view>
      </template>
      <template v-else>
        <p class="title">学生选择</p>
        <scroll-view :style="{'height': '384rpx'}" scroll-y="true">
          <ul class="list">
            <li v-for="(item,index) in students" :key="index" @click="selectStudents(index,item.id)">
              <span>{{item.nickname}}</span>
              <image class="icon" v-if="item.selected" :src="'/static/images/my/select.png'" />
            </li>
          </ul>
        </scroll-view>
      </template>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      showDrop: false,
      game: [],

      showSuccessBox: false,
      token: "",
      type: "",
      students: [],
      stu_list: [],
      selectedGroup: 0,
      selectedUser: [],
      selectGroupName: "组别",
      selectStudentsName: ["学生"],
      selectGame: [],
      workname: "",
      remarks: ""
    };
  },
  onLoad () {
    Object.assign(this.$data, this.$options.data());
    this.token = this.$store.state.userInfo.token;
    this.getList();
    this.getIndexData();
  },
  methods: {
    getIndexData: function () {
      this.$http
        .get({
          url: "/api/wxapp.game/getGameList",
          header: {
            token: this.token
          }
        })
        .then(result => {
          this.game = result.data;
          this.game.map(e => {
            return {
              id: e.id,
              name: e.name,
              selected: false
            };
          });
        });
    },
    sendMessage: function () {
      if (this.game
        .filter(e => {
          return e.selected;
        }).length == 0) {
        wx.showToast({
          title: "请选择游戏",
          icon: "none"
        });
        return false
      };
      this.showSuccessBox = true;
      let params = {
        name: this.workname,
        game_ids: this.game
          .filter(e => {
            return e.selected;
          })
          .map(e => {
            return e.id;
          }),
        user_ids: this.selectedUser.join(","),
        remarks: this.remarks
      };
      this.$http
        .post({
          url: "/api/wxapp.student/publishStudentAssignments",
          data: params,
          header: {
            token: this.token
          }
        })
        .then(result => {
          this.game = this.game.map(e => {
            return {
              id: e.id,
              name: e.name,
              selected: false
            };
          });
          this.selectedUser = [];
          this.selectStudentsName = ["学生"];
          this.selectGroupName = "组别"
          this.selectedGroup = "";
          this.workname = "";
          this.remarks = "";
          this.timer = setTimeout(() => {
            this.back();
          }, 1500);
        });
    },
    getList: function () {
      this.$http
        .get({
          url: "/api/wxapp.student/myStudents",
          header: {
            token: this.token
          }
        })
        .then(result => {
          this.stu_list = result.data;
          this.stu_list[0].user.forEach(e => {
            e.selected = false;
          });
          this.students = this.stu_list[0].user || [];
        });
    },
    showGroup: function () {
      this.showDrop = true;
      this.type = "group";
    },
    showStudents: function () {
      if(this.selectGroupName==="组别"){
        wx.showToast({
          title:"请先选择组别！",
          icon:"none"
        });
        return false
      }
      this.showDrop = true;
      this.type = "students";
      this.selectStudentsName = [];
    },
    selectGroup: function (index) {
      this.selectedGroup = index;
      this.stu_list[index].user &&
        this.stu_list[index].user.forEach(e => {
          e.selected = false;
        });
      this.students = this.stu_list[index].user || [];
      this.selectGroupName = this.stu_list[index].name;
      this.showDrop = false;
    },
    selectStudents: function (index, id) {
      let item = this.students[index];
      item.selected = !this.students[index].selected;
      this.$set(this.students, index, item);
      if (item.selected) {
        this.selectedUser.push(item.id);
        this.selectStudentsName.push(item.nickname);
      } else {
        this.selectedUser.splice(this.selectedUser.indexOf(item.id), 1);
        this.selectStudentsName.splice(this.selectStudentsName.indexOf(item.nickname), 1);
      }
      
    },
    selectGameHan: function (item, index) {
      this.$set(this.game, index, {
        name: item.name,
        selected: !item.selected,
        id: item.id
      });
    },
    back: function () {
      this.showDrop = false;
      this.showSuccessBox = false;
      clearTimeout(this.timer);
      wx.navigateBack({
        delta: 1,
      })
    },
    hideDrop:function(){
      if(this.showDrop){
        this.showDrop=false;
        if(this.selectedUser.length===0){
          this.selectStudentsName=["学生"];
        }
      }else{
        this.back();
      }
      
    }
  }
};
</script>
<style lang="scss" scoped>
.top input,
.top .item {
  border-bottom: 1px solid #f3f3f3;
  line-height: tovmin(100);
  height: tovmin(100);
}

.top .item {
  color: #c6c6c6;
  word-break: break-all;
}

.container {
  padding: tovmin(60);
  position: fixed;
  height: calc(100% - 120rpx);
  width: calc(100% - 120rpx);
  background: $grey-background;
  box-sizing: content-box;
}

.title {
  color: $black;
}

.middle {
  margin-top: 31px;
}

.gameList {
  display: grid;
  grid-template-columns: 30% 30% 30%;
  grid-template-rows: 23% 23% 23% 23%;
  grid-gap: 10px;
  justify-content: center;
  align-items: center;
  margin-top: tovmin(38);
  font-size: tovmin(26);
}

.gameList {
  white-space: nowrap;
}

textarea {
  margin-top: tovmin(60);
  font-size: tovmin(26);
  height: tovmin(250);
}

.btn {
  width: tovmin(362);
  height: tovmin(88);
  line-height: tovmin(88);
  border-radius: tovmin(44);
  border: tovmin(2) solid transparent;
  font-size: 14px;
  margin: 0 auto;
}

.drop_up {
  height: tovmin(460);
  background: white;
  position: absolute;
  z-index: 1001;
  bottom: 0;
  left: 0;
  width: 100%;
  font-size: tovmin(28);
}

.drop_up .title {
  color: #b4b4b4;
  font-size: tovmin(24);
  line-height: tovmin(74);
  text-indent: tovmin(22);
}

.list {
  width: 100%;
}

.list li {
  height: tovmin(88);
  line-height: tovmin(88);
  padding: 0 tovmin(30);
}

.list li:nth-child(2n) {
  background: #f8fbff;
}

.icon {
  height: tovmin(28);
  width: tovmin(32);
  float: right;
  margin-top: tovmin(30);
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
  z-index: 99999;
  justify-content: center;
  align-items: center;
}

.down {
  animation: slide-down 0.5s;
  animation-fill-mode: forwards;
}

.up {
  animation: slide-up 0.5s;
  animation-fill-mode: forwards;
}

@keyframes slide-down {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(tovmin(1000));
    display: block;
  }
}

@keyframes slide-up {
  from {
    transform: translateY(tovmin(1000));
  }

  to {
    transform: translateY(0);
    display: none;
  }
}
</style>
