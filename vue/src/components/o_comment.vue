<template>
  <div :id="id" class="comment-control">
    <!-- <template
      v-if="field.displayType == Constant.PermissionType_HIDDEN || field.textType == 'hidden'"
    >
     
    </template>

    <template v-else-if="field.textType == 'readonly' || field.displayType == Constant.PermissionType_READONLY || field.displayType == Constant.PermissionType_DISABLED">
      <template v-if="field.readOnlyShowValOnly">
        
      </template>
      <template v-else>
        
      </template>
    </template>
    <template v-else-if="field.displayType == Constant.PermissionType_MODIFY"> -->
      <div class="comment-wrap" :style="{'width': field.widthd ? field.widthd + 'px' : '100%'}">
        <div class="c-head">
          <div class="c-count">
            <span class="count">{{commentDetail.commentNum}}</span>
            <span class="c-type">评论</span>
          </div>
          <div class="c-count">
            <span class="count like-count" @click="likeForm">
              <i class="fa fa-thumbs-up"></i>
            </span>
            <span class="c-type">{{commentDetail.likeNum}}</span>
          </div>
        </div>
        <div class="comment-send">
          <div class="user-face">
            <el-avatar v-if="avatar" :size="48" :src="avatar"></el-avatar>
            <el-avatar v-else :size="48" icon="el-icon-user-solid" style="background:#e5e9ef;"></el-avatar>
          </div>
          <div class="textarea-container">
            <el-input
              resize="none"
              type="textarea"
              :rows="2"
              placeholder="发一条评论吧"
              v-model="commentData.comment">
            </el-input>
          </div>
          <div class="btn-box" @click="postComment(null)">
            发表评论
          </div>
        </div>
        <div class="split-line">
          <el-divider></el-divider>
        </div>
        <div class="comment">
          <div 
            class="list-item" 
            v-for="(items, index) in commentData.list" 
            :key="items.id">
            <div class="user-false">
              <el-avatar v-if="items.avatar" :size="48" :src="items.avatar"></el-avatar>
              <el-avatar v-else :size="48" icon="el-icon-user-solid" style="background:#e5e9ef;"></el-avatar>
            </div>
            <div class="replay-container">
              <div class="r-name">
                {{items.userName}}
              </div>
              <div class="r-content">
                {{items.comment}}
              </div>
              <div class="r-detail">
                <span class="time">{{items.createDate | writeCurrentDate}}</span>
                <span class="thumbs-up" @click="clickLike(items.id, index)">
                  <i class="fa fa-thumbs-o-up"></i>
                  {{items.likeNum}}
                </span>
                <span class="thumbs-down" @click="clickUnLike(items.id, index)">
                  <i class="fa fa-thumbs-o-down"></i>
                  {{items.unlikeNum}}
                </span>
                <span class="replay" @click="replyToComments(items.id, items.isShowReleaseBox, index, items.id, items.userName, '1')">回复</span>
              </div>
              <div class="reply-wrap" v-if="items.replyList && items.replyList.length > 0">
                <div class="reply-item" v-for="(item, inx) in items.replyList" :key="item.id">
                  <div class="reply-item-top">
                    <div class="bili-avatar">
                      <el-avatar v-if="item.avatar" :size="24" :src="item.avatar"></el-avatar>
                      <el-avatar v-else :size="24" icon="el-icon-user-solid" style="background:#e5e9ef;"></el-avatar>
                    </div>
                    <div class="reply-con">
                      <div class="user">
                        <span class="user-name">{{item.userName}}</span>
                        <span class="text-con">{{item.comment}}</span>
                      </div>
                    </div>
                  </div>
                  <div class="r-detail">
                    <span class="time">{{item.createDate | writeCurrentDate}}</span>
                    <span class="thumbs-up" @click="clickLike(item.id, index, inx)">
                      <i class="fa fa-thumbs-o-up"></i>
                      {{item.likeNum}}
                    </span>
                    <span class="thumbs-down" @click="clickUnLike(item.id, index, inx)">
                      <i class="fa fa-thumbs-o-down"></i>
                       {{item.unlikeNum}}
                    </span>
                    <span class="replay" @click="replyToComments(items.id, items.isShowReleaseBox, index, item.id, items.userName, '2')">回复</span>
                  </div>
                </div>
              </div>
              <div class="comment-send comment-wrap" v-if="items.isShowReleaseBox">
                <div class="user-face">
                  <!-- <el-avatar :size="48" icon="el-icon-user-solid" style="background:#e5e9ef;"></el-avatar> -->
                  <el-avatar v-if="avatar" :size="48" :src="avatar"></el-avatar>
                  <el-avatar v-else :size="48" icon="el-icon-user-solid" style="background:#e5e9ef;"></el-avatar>
                </div>
                <div class="textarea-container">
                  <el-input
                    resize="none"
                    type="textarea"
                    :rows="2"
                    :placeholder="items.placeholder?items.placeholder:'发一条评论吧'"
                    v-model="items.commentValue">
                  </el-input>
                </div>
                <div 
                  class="btn-box" 
                  @click="postComment(items.id, items.commentValue, items.currentId, items.placeholder, index)">
                  发表评论
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    <!-- </template> -->
  </div>
</template>

<script>
import Constant from "@/Constant.js";
export default {
  name: "o-comment",
  props: ["id"],
  computed: {
    field: function() {
      let allData = this.$parent.findField(this.id)
      return allData
    },
  },
  mounted(){
    this.init()
  },
  data: function() {
    return { 
      Constant, 
      commentData:{
        list:[],
        comment:''
      },
      commentDetail:'',
      avatar: '',
    };
  },
  methods: {
    likeForm(){
      let {id, likeNum} = this.commentDetail
      this.$api.setLike(
        this.field.appId,
        id,
        {
          onSucess: res => {
            likeNum = res.data.data
            this.commentDetail.likeNum = likeNum
            this.$forceUpdate()
          }
        }
      )

    },

    clickLike(id, index, inx){
      let cd = this.commentData;
      this.$api.setLike(
        this.field.appId,
        id,
        {
          onSucess: res => {
            if(res.data.data) {
              if(inx >= 0) {
                cd.list[index].replyList[inx].likeNum= res.data.data
              }else {
                cd.list[index].likeNum = res.data.data
              }
              this.$forceUpdate();
            }
          }
        }
      )
    },

    clickUnLike(id, index, inx){
      let cd = this.commentData
      this.$api.setUnlike(
        this.field.appId,
        id,
        {
          onSucess: res => {
            if(res.data.data) {
              if(inx >= 0) {
                cd.list[index].replyList[inx].unlikeNum = res.data.data
              }else {
                cd.list[index].unlikeNum = res.data.data
              }
              this.$forceUpdate();
            }
          }
        }
      )
    },

    replyToComments(id, isShow, index, currentId, name) {
      let cd = this.commentData
      cd.list[index].placeholder = "回复 @" + name
      cd.list[index].currentId = currentId
      if(id == currentId) {
        cd.list[index].isShowReleaseBox = !isShow
      }else {
        cd.list[index].commentValue = ''
        // cd.list[index].placeholder = "回复 @" + name
        cd.list[index].isShowReleaseBox = true
      }
      this.$forceUpdate()
    },

    postComment(id, value, currentId, placeholder, index){
      let cd = this.commentData
      let field = this.field
      let content = {
        comment: '',
        parentId:'',
      }
      if(id) {
        if(id == currentId) { //回复第一层
          content.comment = value
          content.parentId = id
        }else { //第二层回复
          content.parentId = id
          content.comment = placeholder + "：" + value
        }
      }else {
        content.comment = cd.comment
      }
      this.$api.publishComment(this.$root.appid, field.docId, content, {
        onSucess: res => {
          let list = res.data.data
          if(id) {
            if(cd.list[index].replyList) {
              cd.list[index].replyList.unshift(list)
            }else {
              cd.list[index].replyList = [];
              cd.list[index].replyList.push(list)
            }
            cd.list[index].commentValue = ''
          }else {
            cd.comment = ''
            cd.list.unshift(list)
          }
          this.$forceUpdate()
        }
      })
    },

    init(){
      let field = this.field
      this.$api.getCommentList(
        field.appId,
        field.docId,
        {
          onSucess: res => {
            let list = res.data.data;
            if(list && list.length > 0) {
              list.forEach(el => {
                el.commentValue = ''
                el.isShowReleaseBox = false
                el.currentId = el.id
                el.placeholder = ''
              });
              this.commentData.list = list;
              list.forEach(el => {
                this.$api.getReplyList(
                  field.appId,
                  el.id,
                  {
                    onSucess: res => {
                      if(res.data.data) {
                        el.replyList = res.data.data
                      }else {
                        el.replyList = []
                      }
                      this.$forceUpdate()
                    }
                  }
                )
              })
            }
          }
        }
      )
      this.$api.getLikesCount(
        field.appId,
        field.docId,
        {
          onSucess: res => {
            this.commentDetail = res.data.data;
          }
        }
      )
      let userId = this.$store.state.userId

      this.$api.getUserAvatar(
        userId,
        {
          onSucess: res=> {
            this.avatar = res.data.data;
          }
        }
      )
    },
    onChange() {
     
    },
  },
  filters: {
    writeCurrentDate(val){
      let now = new Date(val)
      let year=now.getFullYear()
      let month=now.getMonth()+1
      let date=now.getDate()
      let hour=now.getHours()
      let minute=now.getMinutes();
      hour = hour >= 10 ? hour: '0' + hour
      minute = minute >= 10 ? minute: '0' + minute
      return year+"-"+month+"-"+date+" "+hour+":"+minute;
    }
  }
};
</script>