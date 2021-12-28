<template>
  <div 
    class="sign-wrap" 
    v-if="showLink" 
    ref="report" 
    :style="{height:wgt.wgt.height +'px'}">
    <div 
      :style="{background:wgt.wgt.titleBarColor}"
      class="clearfix" 
      @mouseenter="cardShow"
      @mouseleave="cardNone"
    >
      <div class="flow-title">
        <span class="img" v-if="wgt.wgt.icon && wgt.wgt.icon.icontype == 'img'">
          <img :src="contextPath +'/'+ wgt.wgt.icon.icon" alt="">
        </span>
        <i v-if="wgt.wgt.icon && wgt.wgt.icon.icontype == 'font'" :class="wgt.wgt.icon.icon" :style="{color:wgt.wgt.icon.iconFontColor}"></i>
        <span :style="{color:wgt.wgt.titleColor,background:wgt.wgt.titleBColor}">{{wgt.wgt.name}}</span>
      </div>
      <div class="btn">
        <div class="btn-icon">
          <i class="el-icon-refresh" v-show="conceal" @click="Partialrefresh"></i>
        </div>
      </div>
    </div>
    <div class="link-content">
      <el-alert
        v-if="showWarnTip"
        class="warn-tip"
        title="今天已签到"
        type="warning"
        :closable="false"
        show-icon>
      </el-alert>
      <div class="top flex flex-pack-center">
        <div class="out-1 flex flex-align-center flex-pack-center" id="signIn" style="cursor:pointer;" @click="clickSignIn">
          <div class="out-2 flex flex-align-center flex-pack-center">
            <div class="signBtn">
              <strong id="sign-txt">{{isNotCheckedIn?'已签到':'签到'}}</strong>
              <span>连续<em id="sign-count">{{signCount}}</em>天</span>
            </div>
          </div>
        </div>
      </div>
      <div class="sign-tips">累计签到{{signCount}}天<span v-if="signCount>20">，获得5个积分</span></div>
    </div>
  </div>
</template>
<script>
  export default {
    inject: ["reload"],
    props: ["wgt"],
    created() {
      this.contextPath = obpmConfig.obpmFilePath;
      this.init();
    },
    data(){
      return {
        contextPath:'',
        showLink: true,
        conceal: false,
        isNotCheckedIn: false,
        userData:'',
        signCount:'0',
        showWarnTip:false,
        isClick: false,
      }
    },
    methods: {
      init(){
        let {id, wgt:{applicationId}} = this.wgt
        this.$api.getCheckin(
          applicationId,
          id,
          {
            onSucess: res => {
              this.isNotCheckedIn = res.data.data;
            }
          }
        )
        this.$api.signInStatistics(
          applicationId,
          id,
          this.wgt.wgt.countType,
          {
            onSucess: res => {
              this.signCount = res.data.data
              if(res.data.data == 20) {
                this.$message({
                  message: '恭喜你，获得5个积分',
                  type: 'success'
                });
              }
            }
          }
        )
      },

      clickSignIn(){
        if(this.isNotCheckedIn) {
          this.showWarnTip = true
          setTimeout(() => {
            this.showWarnTip = false
          }, 1500)
        }else {
          if(!this.isClick) {
            this.isClick = true
            let {id, wgt:{applicationId}} = this.wgt
            let jsonData = {
              applicationId,
              widgetId:id,
            }
            this.$api.setCheckin(
              applicationId,
              id,
              jsonData,
              {
                onSucess: res => {
                  this.userData = res.data.data
                  setTimeout(() => {
                    this.isClick = false
                  }, 200)
                  this.init()
                }
              }
            )
          }
        }
      },
      cardShow() {
        this.conceal = true;
      },
      cardNone() {
        this.conceal = false;
      },
      Partialrefresh(){

      },
    },
  };
</script>