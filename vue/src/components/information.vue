<template>
  <div class="information" id="information">
    <!--以下注释的都是vue写的信息管理，不要删除-->
    <el-tabs v-model="currentActiveName" :tab-position="tabPosition" @tab-click="handleClick" class="tab-wraper">
      <!--企业动态-->
      <el-tab-pane :label="$t('view.qy')" name="first">
        <div class="info-wrap" :style="{'display':isAnnouncementPage?'none':'block'}">
          <el-scrollbar class="scrollbar">
            <div class="enterprise">
              <div class="enterprise-header">
                <div class="pull-left">
                  <span>
                    <img src="../assets/images/msg_write_text.png" />
                  </span>
                </div>
                <div class="pull-right num">
                  {{$t('view.still_enter')}}
                  <span>{{remnant}}</span>
                  {{$t('view.font')}}
                </div>
              </div>
              <el-input
                class="textarea"
                type="textarea"
                :rows="5"
                :placeholder="$t('placeholder.content')"
                v-model="information"
                @input="descInput"
                maxlength="140"
              ></el-input>
              <div class="information-content">
               <div class="themeList" v-if="topicListShow">
                 <span class="themeTitele">话题:</span>
              <ul class="main-tab" >
                <li v-for="(item,index) in topicList" :key="item">
                  <div
                    class="main-sortable"
                  >
                    <cite>{{item}}</cite>
                    <!-- <i class="glyphicon glyphicon-remove" @click.stop="onCloseBtnClick(tab)"></i> -->
                    <i class="el-icon-close" @click="onCloseTheme(index)" ></i>
                  </div>
                </li>
              </ul>

               </div>
                <div class="msg-setting">
                  <div class="msg-wrap">
                    <div class="pull-left">
                      <div>
                        <el-upload
                          class="upload-demo"
                          multiple
                          action=""
                          name="files"
                          :on-remove="handleRemove"
                          :on-preview="handlePreview"
                          :http-request='uploadFile'
                          :file-list="fileList">
                          <span>
                            <i class="fa fa-plus-square-o func-attachement-icon add-icon"></i>
                            {{$t('view.upload_file')}}
                          </span>
                        </el-upload>
                      </div>
                      <div class="msg-func-item">
                        <span calss="icon-p" @click.stop="showEmotionDialog('')">
                          <i class="fa fa-smile-o func-attachement-icon"></i>
                          {{$t('view.emjoy')}}
                          <div class="face-box" v-show="showEmotion">
                            <div class="facelist-close">
                              <i class="fa fa-times facelist-ficon_close" aria-hidden="true" @click.stop="showEmotionDialog('false')"></i>
                            </div>
                            <ul class="face-list">
                              <li v-for="(item,index) in emotionList" :key="index">
                                <img :src="(statiContextPath?statiContextPath:contextPath)+item.url" @click.stop.prevent="getEmoticons(item)"/>
                              </li>
                            </ul>
                          </div>
                        </span>
                      </div>
                      <div class="msg-func-item" style="margin-left:60px">
                       <el-popover
                       placement="right-start"
                       width="400"
                       trigger="click"
                       >
                        <div class="face-box">
                            <div class="topic">
                            <div>
                               <h4 style="margin:10px 0">新话题</h4>
                              <div style="  display: flex;align-items: center;justify-content: start; margin:10px 0;">
                                <el-input placeholder="输入新话题" style="width:70%;" height="30px" v-model="newTopic" ></el-input>
                                <el-button @click="newTheme()" style="padding:8px 10px;margin-left:10px">创建</el-button>
                              </div>
                               <h4 style="margin:10px 0">热门话题</h4>
                             <div>                    
                            <div class="face-list">
                               <div v-for="item in topicHot" :key="item.id" @click="hotTheme(item.topic)">
                                    {{item.topic}}
                               </div>
                                 
                            </div>
                            </div>
                          </div>
                            </div>
                          </div>
                         <div slot="reference">
                            <i class="fa fa-hashtag  func-attachement-icon"></i>
                            <span style="margin-left:8px">话题</span>
                         </div>
                      </el-popover>
                      </div>                
                    </div>
                    <div class="pull-right">
                      <div class="msg-right">
                        <el-button @click="centerDialogVisible = true">
                          {{$t('view.publish')}} 
                          <i class="fa fa-volume-up"></i>
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="msg-submit clearfix">
                  <div class="pull-left">
                    <label for>{{$t('view.send_range')}}:</label>
                    <el-input v-model="sendRangeName" ref="scope" readonly></el-input>
                    <span>
                      <el-button class="el-icon-plus" @click="PlusSign(true)"></el-button>
                      <el-button class="el-icon-close" @click="minus"></el-button>
                    </span>
                  </div>
                  <div class="pull-right">
                    <div class="msg-right">
                      <el-button size="medium" type="success" @click="adhibition">{{$t('view.release')}}</el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="tabpanel">
              <el-tabs v-model="activeName" @tab-click="announcementClick">
                <el-tab-pane :label="$t('view.all')" name="first">
                  <div>
                    <el-input placeholder="搜索话题" style="margin:10px 0;width:30%" v-model="searchTopic"></el-input>
                    <el-button style="margin:0 10px" @click="searchTheme()">搜索</el-button>
                  </div>
                  <div class="tabpanel-box" v-for="(item, index) in messagesList" :key="index">
                    <ul class="tabpanel-item" v-if="item.type == 0">
                      <li>
                        <div class="tabpanel-list">
                          <div class="tabpanel-list-top">
                            <span class="avatar">
                              <i>da</i>
                            </span>
                            <span class="tabpanel-info">
                              <span class="tabpanel-b">
                                {{item.sender}}
                                <br />{{item.createTime}}
                              </span>
                              <span class="tabpanel-close" @click="deleteMessage(item, '1')">
                                <i class="fa fa-remove icon-color"></i>
                              </span>
                            </span>
                          </div>
                          <div class="tabpanel-list-bottom">
                            <p>
                              <span style="color:#4e74f2" v-for="topicitem in item.topic" :key=topicitem>#{{topicitem}}</span>
                              <!-- <span>#{{item}}#</span>渲染不同的话题 -->
                              {{item.content}}
                              </p>
                            <div v-if="item.attachment">
                              <!-- {{item.attachment}} -->
                              <span class="file" v-for="(el, i) in JSON.parse(item.attachment)" :key="i" @click="handlePreview(el)">
                                <span v-if="el.type =='image'">
                                  <img :src="'/obpm/'+ el.url" />
                                </span>
                                <span v-else-if="el.type == 'file' ">
                                  {{el.name}}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="msg-handle" @click="showComments(index, item.id)">
                          <i class="fa fa-comment">&nbsp;&nbsp;{{$t('view.discuss')}}{{item.commentCount}}</i>
                        </div>
                        <div class="reply-box" v-if="currentArray.indexOf(index) > -1">
                          <el-input
                            type="textarea"
                            :rows="4"
                            :placeholder="$t('placeholder.content')"
                            v-model="item.tabpanelComment"
                            @input="tabpanelInput(item.tabpanelComment)"
                            maxlength="140"
                          ></el-input>
                          <div class="msg-enter">
                            <span>{{$t('view.still')}}<span class="special">{{Howmanywords}}</span>{{$t('view.w')}}</span>
                            <span class="publish">
                              <el-button size="small"  id="publish" @click="doComment(item,index)">{{$t('view.discuss')}}</el-button>
                            </span>
                          </div>
                          <div class="comments">
                            <div class="comm-list" v-for="(el, i) in item.replayData" :key="i">
                              <div class="list-left">
                                <span class="left-one">{{el.sender.substring(el.sender.length-2,el.sender.length)}}</span>
                                <span class="left-two">{{el.sender}}：</span>
                                <span class="left-three">
                                  <span>{{el.content}}</span>
                                  <span class="time">( {{el.createTime}} )</span>
                                </span>
                              </div>
                              <div class="list-right">
                                <span class="del" @click="replyToComment(el, item, index)">
                                  {{$t('reply')}}
                                </span>
                                <span class="reply" @click.stop="deleteReplyMessage(el, i, index)">
                                  {{$t('delete')}}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    </ul>
                    <div class="placard-box" v-if="item.type == 1">
                      <div class="p-header">
                        <div class="p-header-left" @click="viewAnnouncement(item.id)">
                          <i class="fa fa-star icon-color"></i>
                          <span class="title">{{item.title}}</span>
                          <span class="top" v-show="item.sticky">{{$t('view.top')}}</span>
                        </div>
                        <div @click="deleteMessage(item, '1')">
                          <i class="fa fa-remove icon-color"></i>
                        </div>
                      </div>
                      <div class="p-wrap">
                        <span v-html="item.content"></span>
                      </div>
                      <div class="p-footer">
                        <span class="self">
                          {{item.sender}}

                        </span>
                        <span class="release-time">
                          {{$t('view.release')}}{{$t('view.yu')}}{{item.createTime}}
                        </span>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
                <el-tab-pane :label="$t('notice')" name="second">
                  <div class="announcement-box" v-for="(item, index) in announcementList" :key="index">
                    <div class="placard-box" >
                      <div class="p-header">
                        <div  @click="viewAnnouncement(item.id)">
                          <i class="fa fa-star icon-color"></i>
                          <span class="title">{{item.title}}</span>
                        </div>
                        <div @click="deleteMessage(item, '2')">
                          <i class="fa fa-remove icon-color"></i>
                        </div>
                      </div>
                      <div class="p-wrap">
                        <span v-html="item.content"></span>
                      </div>
                      <div class="p-footer">
                        <span class="self">
                          {{item.sender}}
                        </span>
                        <span class="release-time">
                          {{$t('view.send_on')}}{{item.createTime}}
                        </span>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </el-scrollbar>
        </div>
        <div class="announcement-info" :style="{'display':isAnnouncementPage?'block':'none'}">
          <div class="back-button-wrap">
            <el-button size="small" plain @click="backToDynamic">{{$t('form.back')}}</el-button>
          </div>
          <div class="notice-wrap">
            <el-scrollbar class="scrollbar">
              <div class="notice-title">
                {{announcementData.title}}
              </div>
              <div class="public-info">
                {{$t('view.send_people')}}:&nbsp;{{announcementData.sender}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                {{$t('view.send_date')}}:&nbsp;{{announcementData.createTime?announcementData.createTime.time:'' | writeCurrentDate}}
              </div>
              <div class="notice-content">
                <span v-html="announcementData.content"></span>
              </div>
            </el-scrollbar>
          </div>
        </div>
      </el-tab-pane>

      <!--工作事项-->
      <el-tab-pane :label="$t('j_event')" name="second">
        <span slot="label">
          {{$t('j_event')}}
          <span class="info-notice" v-if="openParams.notice">{{openParams.notice>99?'99+':openParams.notice}}</span>
        </span>
        <div class="wordmatters">
          <div class="workImage">
            <span class="el-icon-bell"></span>
            <span class="workRemind">{{$t('view.notice')}}</span>
          </div>
          <div class="elTabs">
            <div class="tab-box">
              <div class="select-tab">
                <span 
                  :class="[labelSwitchVal=='first' ? 'tabActive' : '']" 
                  @click="labelSwitch('first')">
                  {{$t('view.noread')}}
                </span>
                <span 
                  :class="[labelSwitchVal=='second' ? 'tabActive' : '']" 
                  @click="labelSwitch('second')">
                  {{$t('view.all')}}
                </span>
              </div>
              <el-dropdown>
                <span class="el-dropdown-link">
                  {{currentFlowType?currentFlowType:$t('form.type')}}
                  <i class="el-icon-caret-bottom el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item @click.native="workHandleClick(0, $t('view.all'))">{{$t('view.all')}}</el-dropdown-item>
                  <el-dropdown-item @click.native="workHandleClick(3, $t('view.help_do'))">{{$t('view.help_do')}}</el-dropdown-item>
                  <el-dropdown-item @click.native="workHandleClick(6, $t('view.cc'))">{{$t('view.cc')}}</el-dropdown-item>
                  <el-dropdown-item @click.native="workHandleClick(4, $t('view.push_for'))">{{$t('view.push_for')}}</el-dropdown-item>
                  <el-dropdown-item @click.native="workHandleClick(2, $t('flow.back'))">{{$t('flow.back')}}</el-dropdown-item>
                  <el-dropdown-item @click.native="workHandleClick(5, $t('view.timeout'))">{{$t('view.timeout')}}</el-dropdown-item>
                  <el-dropdown-item @click.native="workHandleClick(1, $t('view.has_send'))">{{$t('view.has_send')}}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
            <div class="btn-red">
              <el-button type="primary" size="midium" class="btn" @click="setAllRead">{{$t('view.all_submit')}}</el-button>
            </div>
          </div>
        </div>
        <div v-if="labelSwitchVal == 'first'" class="work-box">
          <div class="emptyPage" v-if="isEmptyPage">
            <div class="placeholder-content"></div>
          </div>
          <div class="work-list" v-if="!isEmptyPage">
            <el-scrollbar class="scrollbar">
              <div class="one-list" v-for="(item, index) in unreadWorkItems" :key="index">
                <div class="list-content" @click.stop.prevent="doJump(item, index)">
                  <div style="width: 600px">
                    <span :class="[!item.read?'is-read':'','img']">
                      <img v-if="item.subjectType == 1" src="../assets/images/icon_main_msg_01.png" class="icon_main_msg">
                      <img v-else-if="item.subjectType == 2" src="../assets/images/icon_main_msg_02.png" class="icon_main_msg">
                      <img v-else-if="item.subjectType == 3" src="../assets/images/icon_main_msg_03.png" class="icon_main_msg">
                      <img v-else-if="item.subjectType == 4" src="../assets/images/icon_main_msg_04.png" class="icon_main_msg">
                      <img v-else-if="item.subjectType == 5" src="../assets/images/icon_main_msg_05.png" class="icon_main_msg">
                      <img v-else-if="item.subjectType == 6" src="../assets/images/icon_main_msg_06.png" class="icon_main_msg">
                      <span ></span>
                    </span>
                    <span class="summary-content">
                      <span v-html="item.summary"></span>
                    </span>
                  </div>
                  <div>
                    <span class="del" @click.stop="deleteWorkItem(item.id, index, 'isUnread')">
                      <i class="el-icon-delete"></i>
                      {{$t('delete')}}
                    </span>
                  </div>
                  <div class="timer">
                    {{timeAgo(item.createTime)}}
                  </div>
                </div>
              </div>
            </el-scrollbar>
          </div>
          <div class="count"  v-if="!isEmptyPage">
            <!-- 总条数：{{unreadWorkNum}} -->
            <el-pagination
              background
              small
              layout="total, prev, pager, next,jumper"
              :page-size="30"
              :current-page="unReadCurrentPage"
              :total="unreadWorkNum"
              @current-change="handleCurrentChange($event, 'unread')"
            ></el-pagination>
          </div>
        </div>
        <div v-if="labelSwitchVal == 'second'" class="work-box">
          <div class="emptyPage" v-if="allIsEmptyPage">
            <div class="placeholder-content"></div>
          </div>
          <div class="work-list" v-if="!allIsEmptyPage">
            <el-scrollbar class="scrollbar">
              <div class="one-list" v-for="(item, index) in allNotice" :key="index">
                <div class="list-content" @click.stop.prevent="doJump(item,'',$event)">
                  <div style="width: 600px">
                    <span :class="[!item.read?'is-read':'','img all']">
                      <img v-if="item.subjectType == 1" src="../assets/images/icon_main_msg_01.png" class="icon_main_msg">
                      <img v-else-if="item.subjectType == 2" src="../assets/images/icon_main_msg_02.png" class="icon_main_msg">
                      <img v-else-if="item.subjectType == 3" src="../assets/images/icon_main_msg_03.png" class="icon_main_msg">
                      <img v-else-if="item.subjectType == 4" src="../assets/images/icon_main_msg_04.png" class="icon_main_msg">
                      <img v-else-if="item.subjectType == 5" src="../assets/images/icon_main_msg_05.png" class="icon_main_msg">
                      <img v-else-if="item.subjectType == 6" src="../assets/images/icon_main_msg_06.png" class="icon_main_msg">
                    </span>
                    <span class="summary-content">
                      <span v-html="item.summary"></span>
                    </span>
                  </div>
                  <div>
                    <span class="del" @click.stop="deleteWorkItem(item.id, index,'isHaveRead')">
                      <i class="el-icon-delete"></i>
                      {{$t('delete')}}
                    </span>
                  </div>
                  <div class="timer">
                    {{timeAgo(item.createTime)}}
                  </div>
                </div>
              </div>
            </el-scrollbar>
          </div>
          <div class="count" v-if="!allIsEmptyPage">
              <!-- 总条数：{{allNoticeNum}} -->
              <el-pagination
              background
              small
              layout="total, prev, pager, next,jumper"
              :page-size="30"
              :current-page="allNoticeCurrentPage"
              :total="allNoticeNum"
              @current-change="handleCurrentChange($event, 'allNotice')"
            ></el-pagination>
          </div>
        </div>
      </el-tab-pane>
      
      <!--我{{$t('reply')}}的-->
      <el-tab-pane :label="$t('view.my_reply')" name="third" class="my-replay-box">
        <el-tabs v-model="activekeep" @tab-click="replyClick">
          <el-tab-pane :label="$t('view.my_reply')" name="first">
            <div v-if="noReply" class="no-reply">
              <div class="placeholder-content"></div>
            </div>
            <div class="my-reply" v-if="!noReply">
              <el-scrollbar class="scrollbar">
                <div class="reply-list" v-for="(item, index) in myReplyData" :key="index">
                  <!-- {{$t('view.admin')}} -->
                  <div class="img">
                    <span>
                      {{$t('view.admin')}}
                    </span>
                  </div>
                  <div class="right-box">
                    <div class="top">
                      <span>{{item.sender}}</span>
                      <span class="top-close" @click="deleteReply(item,index, '1')">
                        <i class="fa fa-remove icon-color"></i>
                      </span>
                    </div>
                    <div class="reply-content">
                      {{item.content}}
                    </div>
                    <div class="comment">
                      {{$t('reply')}}{{item.toUser}}{{$t('view.d_disscuss')}}：{{item.toContent}}
                    </div>
                    <div class="date">
                      {{item.createTime}}
                    </div>
                  </div>
                </div>
              </el-scrollbar>
            </div>
            <div class="page" v-if="!noReply">
              <el-pagination
                background
                small
                layout="prev, pager, next,jumper"
                :page-size="30"
                :current-page="1"
                :total="myReplyNum"
                @current-change="paging"
              ></el-pagination>
            </div>
          </el-tab-pane>
          <el-tab-pane :label="$t('view.reply_me')" name="second">
            <div v-if="noReplyMy" class="no-reply">
              <div class="placeholder-content"></div>
            </div>
            <div class="my-reply" v-if="!noReplyMy">
              <el-scrollbar class="scrollbar">
                <div class="reply-list" v-for="(item, index) in receiveData" :key="index">
                  <div class="img">
                    <span>
                      {{$t('view.admin')}}
                    </span>
                  </div>
                  <div class="right-box">
                    <div class="top">
                      <span>{{item.sender}}</span>
                      <span class="top-close" @click="deleteReply(item,index, '2')">
                        <i class="fa fa-remove icon-color"></i>
                      </span>
                    </div>
                    <div class="reply-content">
                      {{item.content}}
                    </div>
                    <div class="comment">
                      {{$t('reply')}}{{item.toUser}}{{$t('view.d_disscuss')}}：{{item.toContent}}
                    </div>
                    <div class="date">
                      {{item.createTime}}
                    </div>
                  </div>
                </div>
              </el-scrollbar>
            </div>
            <div class="page" v-if="!noReplyMy">
              <el-pagination
                background
                small
                layout="prev, pager, next,jumper"
                :page-size="30"
                :current-page="1"
                :total="receiveNum"
                @current-change="paging"
              ></el-pagination>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>
    </el-tabs>

    <!--发公告弹窗-->
    <el-dialog class="bulletin-dialog" :title="$t('view.publish')" :visible.sync="centerDialogVisible" width="55%" center>
      <div class="dialog-box">
        <el-scrollbar class="scrollbar">
          <el-form :label-position="labelPosition" label-width="80px">
            <el-form-item :label="$t('view.title')">
              <el-input v-model="headline"></el-input>
            </el-form-item>
            <el-form-item :label="$t('view.receiver')">
              <el-input v-model="recipient" class="recipientVisible" readonly ref="recipient"></el-input>
              <el-button icon="el-icon-plus" @click="PlusSign(false)"></el-button>
              <el-button icon="el-icon-close" class="minus-msg" @click="eduiminus"></el-button>
            </el-form-item>
            <el-form-item :label="$t('view.notice_content')" class="edit-html">
              <div class="html-box">
                <div>
                  <vue-html5-editor
                    z-index="2002"
                    @change="updateData" 
                    :content="textarea">
                  </vue-html5-editor>
                </div>
                <div class="text-num">
                  {{$t('view.has_enter')}}{{currentWordCount}}{{$t('view.n_word')}}{{wordsRemaining}}{{$t('view.num_w')}}
                </div>
              </div>
            </el-form-item>
            <el-form-item :label="$t('view.other_set')">
              <el-checkbox v-model="otherSettings">{{$t('view.set_top')}}</el-checkbox>
            </el-form-item>
          </el-form>
        </el-scrollbar>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" @click="hiddenBulletinDialog()">{{$t('btns.cancel')}}</el-button>
        <el-button size="medium" type="primary" @click="eduirelease">{{$t('view.release')}}</el-button>
      </span>
    </el-dialog>

    <!--部门树弹窗-->

    <el-dialog 
      :title="$t('view.select_dept')" 
      class="dept-dialog" 
      v-if="Receivedby"
      :visible.sync="Receivedby" 
      width="40%">
      <div class="msg-pull-box">
        <el-scrollbar class="scrollbar">
          <el-tree 
            :empty-text="$t('view.loading')"
            :props="propsPull" 
            :load="loadNodeDept" 
            node-key="id" 
            ref="deptTree" 
            lazy 
            show-checkbox
            :check-strictly="true"
            :default-checked-keys="defaultCheckedKeys"
            @check-change="Receivethetitle($event)">
          </el-tree>
        </el-scrollbar>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" @click="Receivedby = false">{{$t('btns.cancel')}}</el-button>
        <el-button size="medium" type="primary" @click="getDeptData">{{$t('msg.confirm')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import API from "@/api.js"
import Constant from "@/Constant.js"
import escapeHTML from "@/assets/js/escapeHTML.js"
export default {
  // props: ["openParams"],
  data() {
    return {
      Constant,
      showEmotion:false,
      showTheme:false,//控制话题的显隐
      imag:'<img src="/message/img/face/qlx_thumb.gif" />',
      emotionList:[
        {
          type:'[去旅行]',
          path:'<img src="/message/img/face/qlx_thumb.gif" />',
          url:'/message/img/face/qlx_thumb.gif'
        },
        {
          type:'[广告]',
          path:'<img src="/message/img/face/ad_new0902_thumb.gif" />',
          url:'/message/img/face/ad_new0902_thumb.gif'
        },
        {
          type:'[doge]',
          path:'<img src="/message/img/face/doge_thumb.gif" />',
          url:'/message/img/face/doge_thumb.gif'
        },
        {
          type:'[喵喵]',
          path:'<img src="/message/img/face/mm_thumb.gif" />',
          url:'/message/img/face/mm_thumb.gif'
        },
        {
          type:'[二哈]',
          path:'<img src="/message/img/face/moren_hashiqi_thumb.png" />',
          url:'/message/img/face/moren_hashiqi_thumb.png'
        },
        {
          type:'[哆啦A梦吃惊]',
          path:'<img src="/message/img/face/dorachijing_thumb.gif" />',
          url:'/message/img/face/dorachijing_thumb.gif'
        },
        {
          type:'[哆啦A梦花心]',
          path:'<img src="/message/img/face/dorahaose_thumb.gif" />',
          url:'/message/img/face/dorachijing_thumb.gif'
        },
        {
          type:'[哆啦A梦微笑]',
          path:'<img src="/message/img/face/jqmweixiao_thumb.gif" />',
          url:'/message/img/face/jqmweixiao_thumb.gif'
        },
        {
          type:'[笑cry]',
          path:'< src="/message/img/face/xiaoku_thumb.gif" />',
          url:'/message/img/face/xiaoku_thumb.gif'
        },
        {
          type:'[摊手]',
          path:'<img src="/message/img/face/pcmoren_tanshou_thumb.png" />',
          url:'/message/img/face/pcmoren_tanshou_thumb.png'
        },
        {
          type:'[抱手]',
          path:'<img src="/message/img/face/pcmoren_baobao_thumb.png" />',
          url:'/message/img/face/pcmoren_baobao_thumb.png'
        },
        {
          type:'[群体围观]',
          path:'<img src="/message/img/face/lxhweiguan_thumb.gif" />',
          url:'/message/img/face/lxhweiguan_thumb.gif'
        },

        //12
        {
          type:'[坏笑]',
          path:'<img src="/message/img/face/pcmoren_huaixiao_thumb.png" />',
          url:'/message/img/face/pcmoren_huaixiao_thumb.png'
        },
        {
          type:'[舔屏]',
          path:'<img src="/message/img/face/pcmoren_tian_thumb.png" />',
          url:'/message/img/face/pcmoren_tian_thumb.png'
        },
        {
          type:'[污]',
          path:'<img src="/message/img/face/pcmoren_wu_thumb.png" />',
          url:'/message/img/face/pcmoren_wu_thumb.png'
        },
        {
          type:'[微笑]',
          path:'<img src="/message/img/face/huanglianwx_thumb.gif" />',
          url:'/message/img/face/huanglianwx_thumb.gif'
        },
        {
          type:'[嘻嘻]',
          path:'<img src="/message/img/face/tootha_thumb.gif" />',
          url:'/message/img/face/tootha_thumb.gif'
        },
        {
          type:'[哈哈]',
          path:'<img src="/message/img/face/laugh.gif" />',
          url:'/message/img/face/laugh.gif'
        },
        {
          type:'[挖鼻]',
          path:'<img src="/message/img/face/wabi_thumb.gif" />',
          url:'/message/img/face/wabi_thumb.gif'
        },
        {
          type:'[可爱]',
          path:'<img src="/message/img/face/tza_thumb.gif" />',
          url:'/message/img/face/tza_thumb.gif'
        },
        {
          type:'[可怜]',
          path:'<img src="/message/img/face/kl_thumb.gif" />',
          url:'/message/img/face/kl_thumb.gif'
        },
        {
          type:'[吃惊]',
          path:'<img src="/message/img/face/cj_thumb.gif" />',
          url:'/message/img/face/cj_thumb.gif'
        },
        {
          type:'[害羞]',
          path:'<img src="/message/img/face/shamea_thumb.gif" />',
          url:'/message/img/face/shamea_thumb.gif'
        },
        {
          type:'[挤眼]',
          path:'<img src="/message/img/face/zy_thumb.gif" />',
          url:'/message/img/face/zy_thumb.gif'
        },
        //24
        {
          type:'[闭嘴]',
          path:'<img src="/message/img/face/bz_thumb.gif" />',
          url:'/message/img/face/bz_thumb.gif'
        },
        {
          type:'[鄙视]',
          path:'<img src="/message/img/face/bs2_thumb.gif" />',
          url:'/message/img/face/bs2_thumb.gif'
        },
        {
          type:'[爱你]',
          path:'<img src="/message/img/face/lovea_thumb.gif" />',
          url:'/message/img/face/lovea_thumb.gif'
        },
        {
          type:'[泪]',
          path:'<img src="/message/img/face/sada_thumb.gif" />',
          url:'/message/img/face/sada_thumb.gif'
        },
        {
          type:'[偷笑]',
          path:'<img src="/message/img/face/heia_thumb.gif" />',
          url:'/message/img/face/heia_thumb.gif'
        },
        {
          type:'[亲亲]',
          path:'<img src="/message/img/face/qq_thumb.gif" />',
          url:'/message/img/face/qq_thumb.gif'
        },
        {
          type:'[生病]',
          path:'<img src="/message/img/face/sb_thumb.gif" />',
          url:'/message/img/face/sb_thumb.gif'
        },
        {
          type:'[太开心]',
          path:'<img src="/message/img/face/mb_thumb.gif" />',
          url:'/message/img/face/mb_thumb.gif'
        },
        {
          type:'[白眼]',
          path:'<img src="/message/img/face/landeln_thumb.gif" />',
          url:'/message/img/face/landeln_thumb.gif'
        },
        {
          type:'[右哼哼]',
          path:'<img src="/message/img/face/yhh_thumb.gif" />',
          url:'/message/img/face/yhh_thumb.gif'
        },
        {
          type:'[左哼哼]',
          path:'<img src="/message/img/face/zhh_thumb.gif" />',
          url:'/message/img/face/zhh_thumb.gif'
        },
        {
          type:'[嘘]',
          path:'<img src="/message/img/face/x_thumb.gif" />',
          url:'/message/img/face/x_thumb.gif'
        },
        //36
        {
          type:'[哀]',
          path:'<img src="/message/img/face/cry.gif" />',
          url:'/message/img/face/cry.gif'
        },
        {
          type:'[委屈]',
          path:'<img src="/message/img/face/wq_thumb.gif" />',
          url:'/message/img/face/wq_thumb.gif'
        },

        {
          type:'[吐]',
          path:'<img src="/message/img/face/t_thumb.gif" />',
          url:'/message/img/face/t_thumb.gif'
        },
        {
          type:'[哈欠]',
          path:'<img src="/message/img/face/haqianv2_thumb.gif" />',
          url:'/message/img/face/haqianv2_thumb.gif'
        },
        {
          type:'[抱抱_旧]',
          path:'<img src="/message/img/face/bba_thumb.gif" />',
          url:'/message/img/face/bba_thumb.gif'
        },
        {
          type:'[怒]',
          path:'<img src="/message/img/face/angrya_thumb.gif" />',
          url:'/message/img/face/angrya_thumb.gif'
        },
        {
          type:'[疑问]',
          path:'<img src="/message/img/face/yw_thumb.gif" />',
          url:'/message/img/face/yw_thumb.gif'
        },
        {
          type:'[馋嘴]',
          path:'<img src="/message/img/face/cza_thumb.gif" />',
          url:'/message/img/face/cza_thumb.gif'
        },
        {
          type:'[拜拜]',
          path:'<img src="/message/img/face/88_thumb.gif" />',
          url:'/message/img/face/88_thumb.gif'
        },
        {
          type:'[思考]',
          path:'<img src="/message/img/face/sk_thumb.gif" />',
          url:'/message/img/face/sk_thumb.gif'
        },
        {
          type:'[汗]',
          path:'<img src="/message/img/face/sweata_thumb.gif" />',
          url:'/message/img/face/sweata_thumb.gif'
        },
        {
          type:'[困]',
          path:'<img src="/message/img/face/kunv2_thumb.gif" />',
          url:'/message/img/face/kunv2_thumb.gif'
        },
        //48
        {
          type:'[睡]',
          path:'<img src="/message/img/face/huangliansj_thumb.gif" />',
          url:'/message/img/face/huangliansj_thumb.gif'
        },
        {
          type:'[钱]',
          path:'<img src="/message/img/face/money_thumb.gif" />',
          url:'/message/img/face/money_thumb.gif'
        },
        {
          type:'[失望]',
          path:'<img src="/message/img/face/sw_thumb.gif" />',
          url:'/message/img/face/sw_thumb.gif'
        },
        {
          type:'[酷]',
          path:'<img src="/message/img/face/cool_thumb.gif" />',
          url:'/message/img/face/cool_thumb.gif'
        },
        {
          type:'[色]',
          path:'<img src="/message/img/face/huanglianse_thumb.gif" />',
          url:'/message/img/face/huanglianse_thumb.gif'
        },
        {
          type:'[哼]',
          path:'<img src="/message/img/face/hatea_thumb.gif" />',
          url:'/message/img/face/hatea_thumb.gif'
        },
        {
          type:'[鼓掌]',
          path:'<img src="/message/img/face/gza_thumb.gif" />',
          url:'/message/img/face/gza_thumb.gif'
        },
        {
          type:'[晕]',
          path:'<img src="/message/img/face/dizzya_thumb.gif" />',
          url:'/message/img/face/dizzya_thumb.gif'
        },
        {
          type:'[悲伤]',
          path:'<img src="/message/img/face/bs_thumb.gif" />',
          url:'/message/img/face/bs_thumb.gif'
        },
        {
          type:'[抓狂]',
          path:'<img src="/message/img/face/crazya_thumb.gif" />',
          url:'/message/img/face/crazya_thumb.gif'
        },
        {
          type:'[黑线]',
          path:'<img src="/message/img/face/h_thumb.gif" />',
          url:'/message/img/face/h_thumb.gif'
        },
        {
          type:'[阴险]',
          path:'<img src="/message/img/face/yx_thumb.gif" />',
          url:'/message/img/face/yx_thumb.gif'
        },
        //60
        {
          type:'[怒骂]',
          path:'<img src="/message/img/face/numav2_thumb.gif" />',
          url:'/message/img/face/numav2_thumb.gif'
        },
        {
          type:'[互粉]',
          path:'<img src="/message/img/face/hufen_thumb.gif" />',
          url:'/message/img/face/hufen_thumb.gif'
        },
        {
          type:'[心]',
          path:'<img src="/message/img/face/hearta_thumb.gif" />',
          url:'/message/img/face/hearta_thumb.gif'
        },
        {
          type:'[伤心]',
          path:'<img src="/message/img/face/unheart.gif" />',
          url:'/message/img/face/unheart.gif'
        },
        {
          type:'[猪头]',
          path:'<img src="/message/img/face/pig.gif" />',
          url:'/message/img/face/pig.gif'
        },
        {
          type:'[熊猫]',
          path:'<img src="/message/img/face/panda_thumb.gif" />',
          url:'/message/img/face/panda_thumb.gif'
        },
        {
          type:'[兔子]',
          path:'<img src="/message/img/face/rabbit_thumb.gif" />',
          url:'/message/img/face/rabbit_thumb.gif'
        },
        {
          type:'[ok]',
          path:'<img src="/message/img/face/ok_thumb.gif" />',
          url:'/message/img/face/ok_thumb.gif'
        },
        {
          type:'[耶]',
          path:'<img src="/message/img/face/ye_thumb.gif" />',
          url:'/message/img/face/ye_thumb.gif'
        },
        {
          type:'[good]',
          path:'<img src="/message/img/face/good_thumb.gif" />',
          url:'/message/img/face/good_thumb.gif'
        },
        {
          type:'[NO]',
          path:'<img src="/message/img/face/buyao_org.gif" />',
          url:'/message/img/face/buyao_org.gif'
        },
        {
          type:'[赞]',
          path:'<img src="/message/img/face/z2_thumb.gif" />',
          url:'/message/img/face/z2_thumb.gif'
        },
        //72
        {
          type:'[来]',
          path:'<img src="/message/img/face/come_thumb.gif" />',
          url:'/message/img/face/come_thumb.gif'
        },
        {
          type:'[弱]',
          path:'<img src="/message/img/face/sad_thumb.gif" />',
          url:'/message/img/face/sad_thumb.gif'
        },
        {
          type:'[草泥马]',
          path:'<img src="/message/img/face/shenshou_thumb.gif" />',
          url:'/message/img/face/shenshou_thumb.gif'
        },
        {
          type:'[神马]',
          path:'<img src="/message/img/face/horse2_thumb.gif" />',
          url:'/message/img/face/horse2_thumb.gif'
        },
        {
          type:'[囧]',
          path:'<img src="/message/img/face/j_thumb.gif" />',
          url:'/message/img/face/j_thumb.gif'
        },
        {
          type:'[浮云]',
          path:'<img src="/message/img/face/fuyun_thumb.gif" />',
          url:'/message/img/face/fuyun_thumb.gif'
        },
        {
          type:'[给力]',
          path:'<img src="/message/img/face/geiliv2_thumb.gif" />',
          url:'/message/img/face/geiliv2_thumb.gif'
        },
        {
          type:'[围观]',
          path:'<img src="/message/img/face/wg_thumb.gif" />',
          url:'/message/img/face/wg_thumb.gif'
        },
        {
          type:'[威武]',
          path:'<img src="/message/img/face/vw_thumb.gif" />',
          url:'/message/img/face/vw_thumb.gif'
        },
        {
          type:'[话筒]',
          path:'<img src="/message/img/face/huatongv2_thumb.gif" />',
          url:'/message/img/face/huatongv2_thumb.gif'
        },
        {
          type:'[蜡烛]',
          path:'<img src="/message/img/face/lazhuv2_thumb.gif" />',
          url:'/message/img/face/lazhuv2_thumb.gif'
        },
        {
          type:'[蛋糕]',
          path:'<img src="/message/img/face/cakev2_thumb.gif" />',
          url:'/message/img/face/cakev2_thumb.gif'
        },

      ],
      openParams:{},
      readStatus:'',
      currentActiveName:'first',
      currentWordCount:0,
      wordsRemaining:10000,
      isEmptyPage: false,
      noReply:false,
      noReplyMy:false,
      allIsEmptyPage: false,
      messagesListNum:'', //企业动态信息列表数量
      messagesList: [],//企业动态信息列表
      currentArray:[],
      currentIndex:'', //点击回复时的index值
      isSendRange:'',
      sendRangeList:[], //发送范围部门列表
      sendRangeName:'', //发送范围部门名字
      deptList:[],
      otherSettings:false,
      labelPosition: 'right',
      fileList: [],
      tabPosition: "left",
      information: "",
      msgsubmit: "",
      headline: "",
      recipient: "",
      selectDeptList: "", //发公告窗口选择的部门数据
      Howmanywords: 140,
      tabpanelComment: "",
      textarea: "",
      workslide: "first",
      activekeep: "first",
      activeName: "first",
      dialogVisible: false,
      Receivedby: false, //发公告里面的加号弹框
      centerDialogVisible: false,
      remnant: 140,
      eduiPlus: 0,
      eduisubtract: 10000,
      props: {
        label: "name",
        children: "zones",
        isLeaf: "leaf"
      },
      propsPull: {
        label: "name",
        children: "zones",
        isLeaf: "leaf"
      },

      //评论回复接口所需的参数缓存
      replyToUser: '',
      replyToUserId: '',
      replyMessageId: '',
      replyCommentId: '',
      replyTocontent: '',

      labelSwitchVal:'first',
      unreadWorkItems: [], //未读工作事项
      unreadWorkNum:0, // 未读工作事项总页数
      unReadCurrentPage: 1, // 未读工作事项当前页数
      allNotice:[], //全部工作事项
      allNoticeNum:0, // 全部工作事项总条数
      allNoticeCurrentPage: 1, // 全部工作事项当前页数
      myReplyData: [],
      myReplyNum: 0,
      receiveNum: 0, 
      receiveData: [],
      announcementList:[],
      currentFlowType:'',
      currentFlowTypeNum:'', // 工作事项的类型
      flowType:'first',
      defaultCheckedKeys: [],
      isAnnouncementPage: false,
      announcementData:'',
      contextPath:'',
      statiContextPath:'',
      newTopic:'',
      searchTopic:'',
      topicList:[],
      topicListShow:false,
      topicHot:[],
    };
  },
  created() {
    this.contextPath = obpmConfig.obpmFilePath;
    this.statiContextPath = obpmConfig.statiContextPath;
    //this.notices();
    this.getMessagesList();
    //点击消息提醒通过传入自定义参数，判断参数再定义currentActiveName的值即可
    if(this.openParams.remind){
      this.currentActiveName = "second";
      this.labelSwitch("first")
    }
    if(this.openParams.isWorkMatters) {
      this.currentActiveName = 'second';
      let data = {
        readStatus: 0,
        type: 0,
        _currpage: this.unReadCurrentPage,
        _rowcount: 30
      }
      this.$api.getNotice(
        data,
        {
          onSucess: res => {
            if(res.data.data.datas.length == 0) {
              this.isEmptyPage = true;
            }else {
              this.unreadWorkNum = res.data.data.rowCount;
              this.unreadWorkItems = res.data.data.datas;
            }
          }
        }
      )
    }
    //获取热门话题
    this.$api.getHotThemelist(
        6,
        {
          onSucess: res => {
            this.topicHot=res.data.data
          }
        }
      )
  },

  methods: {
    backToDynamic(){ //{{$t('form.back')}}企业动态
      this.isAnnouncementPage = false;
    },
    viewAnnouncement(id){ //预览公告
      this.isAnnouncementPage = true;
      this.$api.lockAnnouncementInfo(
        id,
        {
          onSucess: res => {
            this.announcementData = res.data.data.message;
          }
        }
      )
    },
    showEmotionDialog(val) {
      if(val) {
        this.showEmotion = false;
      }else {
        this.showEmotion = !this.showEmotion;
        this.showTheme = false;
      }
      
    },
    //控制打开或关闭话题的小窗
    
    showThemeDialog(val) {
      if(val) {
        this.showTheme = false;
      }else {
        this.showTheme = !this.showTheme;
        this.showEmotion = false;
      }
      
    },
    //创建话题
     newTheme(){
       this.topicList.push(this.newTopic);
       this.newTopic='';
       this.topicListShow=true;
        // this.information='#'+this.newTopic+'#'+this.information
        // this.newTopic='';
    },
    onCloseTheme(item,index){
      this.topicList.splice(index,1); 
      if(this.topicList.length===1){
         this.topicListShow=false;
      }
    },
    hotTheme(item){
     this.topicListShow=true; 
     this.topicList.push(item); 
    },
    //搜索话题
    searchTheme(){
      let searchTopic=this.searchTopic
    this.$api.getThemelist(searchTopic,{
       onSucess: res => {
            this.messagesListNum = res.data.data.rowCount
            //this.messagesList = res.data.data.datas;
            let newData = res.data.data.datas.map(item => {
              let topic=JSON.parse(item.topic)
              return {
                attachment: item.attachment,
                comment: item.comment,
                commentCount: item.commentCount,
                // content: this.getEmot(item.content),
                content:item.content,
                createTime: item.createTime,
                id: item.id,
                module: item.module,
                receiverDeptId: item.receiverDeptId,
                receiverId: item.receiverId,
                receiverInfo: item.receiverInfo,
                scope: item.scope,
                sender: item.sender,
                senderDept: item.senderDept,
                senderDeptId:item.senderDeptId,
                senderId: item.senderId,
                sticky: item.sticky,
                title: item.title,
                type: item.type,
                tabpanelComment: '',
                topic:topic,
              }
            })
            this.messagesList = newData;
          }
        })
    },
    getTheme(item) {
      this.information='#'+item+'#'+this.information
    },
    getEmoticons(item) {
      this.information += item.type;
    },
    deleteReplyMessage(el, index, parentIndex) {
      let commentId = el.id, 
          messageId = el.messageId;
      this.$confirm(this.$t('msg.cant_recovery'), this.$t('tip'), {
        confirmButtonText: this.$t('msg.confirm'),
        cancelButtonText: this.$t('btns.cancel'),
        type: 'warning'
      }).then(() => {
        this.$api.deleteReply(
          commentId, 
          messageId,
          {
            onSucess: res => {
              if(res.data.status == 1) {
                this.$notify({
                  title: this.$t('msg.es'),
                  message: '',
                  type: 'sucess'
                })
                this.messagesList[parentIndex].replayData.splice(index,1);
                this.messagesList[parentIndex].commentCount = this.messagesList[parentIndex].commentCount - 1//删除成功评论总数实时-1
                this.$forceUpdate();
              }
            }
          }
        )
      }).catch(() => {
                 
      });
    },
    hiddenBulletinDialog() {
      this.headline = "";
      this.recipient = "";
      this.textarea = "";
      this.centerDialogVisible = false;
    },
    deleteMessage(item, type) {
      let messageId = item.id;
      this.$confirm(this.$t('msg.cant_recovery'), this.$t('tip'), {
        confirmButtonText: this.$t('msg.confirm'),
        cancelButtonText: this.$t('btns.cancel'),
        type: 'warning'
      }).then(() => {
        this.$api.deleteMessage(
          messageId,
          {
            onSucess: response => {
              if(response.data.status == 1) {
                this.$notify({
                  title: this.$t('msg.es'),
                  message: '',
                  type: 'sucess'
                })
                if(type == '1') {
                  this.$api.getMessagesList(
                    {
                      onSucess: res => {
                        this.messagesListNum = res.data.data.rowCount
                        this.messagesList = res.data.data.datas;
                      }
                    }
                  )
                }else if(type == '2') {
                  this.$api.getAnnouncement(
                    {
                      onSucess: res => {
                        this.announcementList = res.data.data.datas;
                      }
                    }
                  )
                }
              }
            }
          }
        )
      }).catch(() => {
                 
      });

    },
    //$t('view.my_reply')（删除）
    deleteReply(item, index, num) {
      let commentId = item.id, 
          messageId = item.messageId;
      this.$confirm(this.$t('msg.cant_recovery'), this.$t('tip'), {
        confirmButtonText: this.$t('msg.confirm'),
        cancelButtonText: this.$t('btns.cancel'),
        type: 'warning'
      }).then(() => {
        this.$api.deleteReply(
          commentId, 
          messageId,
          {
            onSucess: res => {
              if(res.data.status == 1) {
                this.$notify({
                  title: this.$t('msg.es'),
                  message: '',
                  type: 'sucess'
                })
                if(num == '1') {
                  this.myReplyData.splice(index,1);
                }else if(num == '2') {
                  this.receiveData.splice(index, 1);
                }
                this.$forceUpdate();
              }
            }
          }
        )
      }).catch(() => {
                 
      });
    },

    doJump(item, index,event) {
	  if(event) {
        if(event.currentTarget.childNodes[0].childNodes[0].getAttribute('class').indexOf('all')>-1) { //确保是全部模块的dom
          if(event.currentTarget.childNodes[0].childNodes[0].getAttribute('class').indexOf('is-read') > -1) {
            event.currentTarget.childNodes[0].childNodes[0].classList.remove('is-read');  //移除全部模块的未读小红点
            if(this.openParams.notice>0){
              this.openParams.notice = this.openParams.notice - 1
            }
          }
        }
      }
      let obj = JSON.parse(item.linkParams);
      let params = {
        appId: this.$root.appid,
        linkType:'00',
        actionContent: obj._formid,
        name: this.$t('view.flow'),
        docId: obj._docid,
        _select: obj._docid,
      };
      this.$emit("add-tab", params);
      if(index >= 0) {
        this.$api.noticeRead(
          item.id,
          {
            onSucess: () => {

            }
          }
        )
        this.unreadWorkItems.splice(index,1);
        if(this.unreadWorkItems.length == 0) {
          this.isEmptyPage = true;
        }
		if(this.openParams.notice>0 && !event){
          this.openParams.notice = this.openParams.notice - 1
        }
      }
    },
    announcementClick(tab) {
      if(tab.index == 1) {
        this.$api.getAnnouncement(
          {
            onSucess: res => {
              this.announcementList = res.data.data.datas;
            }
          }
        )
      }
    },
    paging() {

    },
    /**
     * 工作事项类型切换
     */
    workHandleClick(val, currentType) {
      // console.log("----------->menu", val)
      this.currentFlowType = currentType;
      this.currentFlowTypeNum = val;
      let data;
      if(this.flowType == 'first') {
        data = {
          readStatus: 0,
          type: val,
          _currpage: 1,
          _rowcount: 30
        };
        this.$api.getNotice(
          data,
          {
            onSucess: res => {
              if(res.data.data.datas.length == 0) {
                this.isEmptyPage = true;
              }else {
                this.isEmptyPage = false;
                this.unreadWorkNum = res.data.data.rowCount;
                this.unreadWorkItems = res.data.data.datas;
              }
            }
          }
        )
      }else if(this.flowType == 'second') {
        data = {
          readStatus: '',
          type: val,
          _currpage: 1,
          _rowcount: 30
        };
        this.$api.getNotice(
          data,
          {
            onSucess: res => {
              this.allNoticeNum = res.data.data.rowCount;
              this.allNotice = res.data.data.datas;
              if(res.data.data.datas.length <= 0) {
                this.allIsEmptyPage = true;
              }else {
                this.allIsEmptyPage = false;
              }
            }
          }
        )
      }
        
      
    },

    replyClick(tab) {
      if(tab.index == 1) {
        let currpage = 1;
        let _rowcount = 30
        this.$api.getReceive(
          currpage,
          _rowcount,
          {
            onSucess: res => {
              if(res.data.data.rowCount <=0 ) {
                this.noReplyMy = true;
              }
              this.receiveNum = res.data.data.rowCount;
              this.receiveData = res.data.data.datas;
            }
          }
        )
      }
    },

    handleClick(tab) {
  
      if(tab.index == 1) {
        let readStatus = 0;
        let type=0;
        let data = {
          readStatus: 0,
          type: 0,
          _currpage: 1,
          _rowcount: 30
        }
        this.$api.getNotice(
          data,
          {
            onSucess: res => {
              if(res.data.data.datas.length == 0) {
                this.isEmptyPage = true;
              }else {
                this.unreadWorkNum = res.data.data.rowCount;
                this.unreadWorkItems = res.data.data.datas;
              }
            }
          }
        )
      }else if(tab.index == 2) {
        let currpage = 1;
        let _rowcount = 30
        this.$api.getMyreply(
          currpage,
          _rowcount,
          {
            onSucess: res => {
              if(res.data.data.rowCount <=0 ) {
                this.noReply = true;
              }
              this.myReplyNum = res.data.data.rowCount;
              this.myReplyData = res.data.data.datas;
            }
          }
        )
      }
    },

    //全部标记已读
    setAllRead() {
      this.$api.setAllRead(
        {
          onSucess: res => {
            // console.log("res-->",res);
            if(res.data.status) {
              this.readStatus = 0;
              let type=0;
              let data = {
                readStatus: 0,
                type: this.currentFlowTypeNum?this.currentFlowTypeNum:0,
                _currpage: 1,
                _rowcount: 30
              }
              this.$api.getNotice(
                data,
                {
                  onSucess: res => {
                    if(res.data.data.datas.length == 0) {
                      this.isEmptyPage = true;
                    }else {
                      this.unreadWorkNum = res.data.data.rowCount;
                      this.unreadWorkItems = res.data.data.datas;
                    }
                  }
                }
              )
            }
            
          }
        }
      )
      this.openParams.notice = ''
    },

    //删除工作事项
    deleteWorkItem(id, index, val) {
      this.$confirm(this.$t('msg.cant_recovery'), this.$t('tip'), {
        confirmButtonText: this.$t('msg.confirm'),
        cancelButtonText: this.$t('btns.cancel'),
        type: 'warning'
      }).then(() => {
        this.$api.deleteNotice (
          id,
          {
            onSucess: res => {
              if(res.data.status == 1) {
                this.$notify({
                  title: this.$t('msg.es'),
                  message: '',
                  type: 'sucess'
                })
                if(val == 'isUnread') {
                  this.$api.getNotice(
                    {
                      readStatus: 0,
                      type: 0,
                      _currpage: 1,
                      _rowcount: 30
                    },
                    {
                      onSucess: res => {
                        if(res.data.data.datas.length == 0) {
                          this.isEmptyPage = true;
                        }else {
                          this.openParams.notice = res.data.data.rowCount;
                          this.unreadWorkNum = res.data.data.rowCount;
                          this.unreadWorkItems = res.data.data.datas;
                        }
                      }
                    }
                  )
                }else if(val == 'isHaveRead') {
                  this.allNotice.splice(index, 1);
                  let data;
                  data = {
                    readStatus: '',
                    type: this.currentFlowTypeNum?this.currentFlowTypeNum:0,
                    _currpage: 1,
                    _rowcount: 30
                  };
                  this.$api.getNotice(
                    data,
                    {
                      onSucess: res => {
                        this.allNoticeNum = res.data.data.rowCount;
                      }
                    }
                  )
                  if(this.allNotice.length <= 0) {
                    this.allIsEmptyPage = true;
                  }
                }
              }
            }
          }
        )
      }).catch(() => {
                 
      });
    },

    //工作事项
    labelSwitch(val) {
      this.labelSwitchVal = val;
      //this.currentFlowType = '';
      if(val == 'first') {
        this.flowType = 'first';
        this.readStatus = 0;
        let type=0;
        let data = {
          readStatus: 0,
          type: this.currentFlowTypeNum?this.currentFlowTypeNum:0,
          _currpage: 1,
          _rowcount: 30
        }
        this.$api.getNotice(
          data,
          {
            onSucess: res => {
              if(res.data.data.datas.length == 0) {
                this.isEmptyPage = true;
              }else {
                this.isEmptyPage = false;
                this.unreadWorkNum = res.data.data.rowCount;
                this.unreadWorkItems = res.data.data.datas;
              }
            }
          }
        )
      }else if(val == 'second') {
        this.flowType = 'second';
        let readStatus = '';
        let type=0;
        let data = {
          readStatus: '',
          type: this.currentFlowTypeNum?this.currentFlowTypeNum:0,
          _currpage: 1,
          _rowcount: 30
        }

        this.$api.getNotice(
          data,
          {
            onSucess: res => {
              this.allNoticeNum = res.data.data.rowCount;
              this.allNotice = res.data.data.datas;
              if(res.data.data.datas.length <=0) {
                this.allIsEmptyPage = true;
              }else {
                this.allIsEmptyPage = false;
              }
              this.$forceUpdate();
            }
          }
        )
      }
    },
    //评论
    doComment(item, index) {
      if(item.length === 0) {
        this.$message({
          message:this.$t('view.c_notnull'),
          type:'warning'
        })
        return false
      }  
      let newData = 
          encodeURIComponent("content.toUser") + '=' + encodeURIComponent(this.replyToUser?this.replyToUser:item.sender) + '&' + 
          encodeURIComponent("content.toUserId") + '=' + encodeURIComponent(this.replyToUserId?this.replyToUserId:item.senderId) + '&' +
          encodeURIComponent("content.messageId") + '=' + encodeURIComponent(this.replyMessageId?this.replyMessageId:item.id) + '&' +
          encodeURIComponent("content.commentId") + '=' + encodeURIComponent(this.replyCommentId) + '&' +
          encodeURIComponent("toContent") + '=' + encodeURIComponent(this.replyTocontent?this.replyTocontent:item.content) + '&' +
          encodeURIComponent("content.content") + '=' + encodeURIComponent(item.tabpanelComment) + '&' +
          encodeURIComponent("content.attachment") + '=' + encodeURIComponent('');
      this.$api.doComment(
        newData,
        {
          onSucess: res => {
            if(res.data.status == 1) {
              this.messagesList[this.currentIndex?this.currentIndex:index].replayData.unshift(res.data.data);
              let commentCount = this.messagesList[this.currentIndex?this.currentIndex:index].commentCount
              this.messagesList[this.currentIndex?this.currentIndex:index].commentCount = commentCount + 1//评论总数实时+1
              this.$forceUpdate()
              this.replyToUser = '';
              this.replyToUserId = '';
              this.replyMessageId = '';
              this.replyCommentId = '';
              this.replyTocontent = '';
              item.tabpanelComment = '';
              this.$notify({
                title: this.$t('view.dis_ss'),
                message: '',
                type: 'success'
              });
            }
          }
        }
      )
    },
    //评论回复
    replyToComment(el, item, index){
      item.tabpanelComment =this.$t('reply')+ "@" + el.toUser + " ";
      this.replyToUser = el.toUser;
      this.replyToUserId = el.toUserId;
      this.replyMessageId = el.messageId;
      this.replyCommentId = el.id;
      this.replyTocontent = el.content;
      this.currentIndex = index;
    },

    //展示评论区
    showComments(index, id) {
      if(this.currentArray.indexOf(index) > -1) {
        for(let i=0; i<this.currentArray.length; i++) {
          if(index == this.currentArray[i]) {
            this.currentArray.splice(i, 1);
            return
          }
        }
      }else {
        this.currentArray.push(index);
        this.$api.getMessagesReplay(
          id,
          {
            onSucess: res => {
              this.messagesList[index].replayData = res.data.data.datas;
              this.$forceUpdate();
            }
          }
        )
      }
    },
    //上传文件
    uploadFile(e) {
      let fileArray = e.file;
			let file = fileArray;
			let that = this;
      let form = new FormData();
      let id = 'WU_FILE_0',
          name = e.file.name,
          type = e.file.type,
          lastModifiedDate = e.file.lastModifiedDate,
          size = e.file.size;
      form.append("id", id);
      form.append("name", name);
      form.append("type", type);
      form.append("lastModifiedDate", lastModifiedDate);
      form.append("size", size);
      form.append("file", file);
      this.$api.messageUploadFile(
        form,
        {
          onSucess: res => {
            let obj = {
              extName: res.data.extName,
              id:res.data.id,
              size:res.data.size,
              type:res.data.type,
              name: res.data.name,
            
              url: res.data.url,
            };
            this.fileList.push(obj);
          }
        }
      )
    },
    
    getDeptData() {
      let nodes = this.$refs.deptTree.getCheckedNodes();
      let dept = [];
      let name = [];
      let deptIdArray = [];
      if(nodes && nodes.length>0) {
        for(let i=0; i<nodes.length; i++) {
          let obj = {};
          obj.deptId = nodes[i].id;
          obj.deptName = nodes[i].name;
          name += nodes[i].name + ';'; 
          dept.push(obj);
          deptIdArray.push(nodes[i].id);
        }
        this.defaultCheckedKeys = deptIdArray;
        // this.$refs.deptTree.setCheckedKeys(deptIdArray);
        if(this.isSendRange) {
          this.sendRangeName = name;
          this.sendRangeList = dept
        }else {
          this.recipient = name;
          this.selectDeptList = dept;
        }
        
      }
      
      this.Receivedby = false;

    },

    loadNodeDept(node, resolve) {
      let appid = this.$root.appid;
      if (node.level === 0) {
        API.getDepartmentsByParentId(appid, "", {
          onSucess: function(response) {
            resolve(response.data.data);
          }
        });
      } else {
        API.getDepartmentsByParentId(appid, node.key, {
          onSucess: function(response) {
            resolve(response.data.data);
          }
        });
      }
    },
   
    //发送公告里面的加号弹框
    PlusSign(val) {
      if(val) {
        this.isSendRange = true;
      }else {
        this.isSendRange = ''
      }
      this.$api.getAllDeptList(
        {
          onSucess: res => {
            this.deptList = res.data.data;
          }
        }
      )
      this.Receivedby = true;
    },
    //把获取到的数据放到接受人里面去
    Receivethetitle(event) {
      this.recipient = event.name;
    },
    Sendthescope(event) {
      this.msgsubmit = event.name;
    },
    
    updateData(event){
      
      this.textarea = event
      // console.log("event--->",event);
      this.currentWordCount = event.length;
      this.wordsRemaining = 10000 - event.length;
    },

    eduirelease() {
      let that = this;
      if (this.headline.length == 0) {
        this.$message({
          message:this.$t('view.t_notnull'),
          type:'warning'
        })
      } else if (this.recipient.length == 0) {
        this.$message({
          message:this.$t('view.receiver_notnull'),
          type:'warning'
        })
      } else if (this.textarea.length == 0) {
        this.$message({
          message:this.$t('view.c_notnull'),
          type:'warning'
        })
      } else {
        let userData = {
          user: [],
          dept: this.selectDeptList,
        }
        let newData = encodeURIComponent("content.title") + '=' + encodeURIComponent(this.headline) + '&' + 
            encodeURIComponent("content.content") + '=' + encodeURIComponent(this.textarea) + '&' +
            encodeURIComponent("content.attachment") + '=' + encodeURIComponent('') + '&' +
            encodeURIComponent("content.scope") + '=' + encodeURIComponent(2) + '&' +
            encodeURIComponent("receiverInfo") + '=' + encodeURIComponent(JSON.stringify(userData)) + '&' +
            encodeURIComponent("content.type") + '=' + encodeURIComponent(1) + '&' +
            encodeURIComponent("content.sticky") + '=' + encodeURIComponent(this.otherSettings);
        this.$api.makeAnnouncement(
          newData,
          {
            onSucess: res => {
              if(res.data.status == 1) {
                this.otherSettings = false;
                that.getMessagesList();
                that.centerDialogVisible = false;
                that.$notify({
                  title: res.data.message,
                  message: '',
                  type: 'success'
                });
                this.$api.getAnnouncement(
                  {
                    onSucess: res => {
                      this.announcementList = res.data.data.datas;
                    }
                  }
                )
              }else {
                that.centerDialogVisible = false;
                that.$notify({
                  title: this.$t('view.publish_fail'),
                  message: '',
                  type: 'error'
                });
              }
            }
          }
        )
        this.headline = "";
        this.recipient = "";
        this.textarea = "";
      }
    },
    tabpanelInput(value) {
      let txtVal = value.length;
      this.Howmanywords = 140 - txtVal;
    },
    eduiInput() {
      let txtVal = this.textarea.length;
      this.eduisubtract = 10000 - txtVal;
      this.eduiPlus = 0 + txtVal;
    },
    descInput() {
      let txtVal = this.information.length;
      this.remnant = 140 - txtVal;
    },
    handleRemove(file,fileList) {
      let fl = this.fileList;
      if(fl && fl.length > 0) {
        for(let i=0; i<fl.length; i++){
          if(file.id == fl[i].id) {
            fl.splice(i, 1);
            break;
          }
        }
      }
      this.fileList = fl;
    },
    handlePreview(file) {
      let params = {
        id: file.id,
        extName: file.extName,
        url: file.url,
        _: new Date().getTime(),
      }
      this.$api.getPreview(
        params,
        {
          onSucess: res => {
            if(res.data.status === 1) {
              // console.log("file--->",file);
              let fileName = file.id + file.extName;
              let cp = obpmConfig.obpmFilePath;
              sessionStorage.setItem("obpmContextPath", cp);
              let statiContextPath = obpmConfig.statiContextPath;
              let pdfPath = "";
              if(statiContextPath) { //5.0 trunk
                sessionStorage.setItem("isTrunk", true);
                pdfPath = obpmConfig.statiContextPath;
              }else { //4.4 stable
                sessionStorage.setItem("isTrunk", false);
                pdfPath = cp;
              }
              let url = pdfPath + "/message/pdfviewer.html?fileName=" + fileName + 
                "&path=" + file.url + 
                "&showName=" + encodeURI(file.name) + 
                "&fileType=" + file.extName;
                let URL = encodeURI(url);
                window.open(URL);
            }
          }
        }
      )
    },
    handleExceed(files) {
      this.$message.warning(
       this.$t('view.limit')+ ` ${files.length}`+this.$t('view.all_select')+`${files.length}`+this.$t('view.n_file')
      );
    },
    beforeRemove(file) {
      return this.$confirm(this.$t('btns.comfirm_remove')+`${file.name}？`);
    },
    //重置发送范围的输入框
    minus() {
      this.sendRangeName = "";
    },
    eduiminus() {
      // console.log("this.recipient-->",this.recipient);
      // console.log("this.selectDeptList-->",this.selectDeptList);
      this.recipient = "";
      this.selectDeptList = "";
    },
    adhibition() {
      let that = this;
      if (!this.information) {
        this.$message({
          message:this.$t('view.c_notnull'),
          type:'warning'
        })
      } else if (!this.sendRangeName) {
        this.$message({
          message:this.$t('view.range_notnull'),
          type:'warning'
        })
      } else {
        let userData = {
          user: [],
          dept: this.sendRangeList,
        }
        // let content=this.information.slice(this.information.lastIndexOf('#')+1);
        // let theme=this.information.slice(this.information.indexOf('#'),this.information.lastIndexOf('#')+1);
        //分割话题和正文
        let newData = 
            encodeURIComponent("content.content") + '=' + encodeURIComponent(this.information) + '&' +
            encodeURIComponent("content.attachment") + '=' + encodeURIComponent(JSON.stringify(this.fileList)) + '&' +
            encodeURIComponent("content.scope") + '=' + encodeURIComponent(2) + '&' +
            encodeURIComponent("receiverInfo") + '=' + encodeURIComponent(JSON.stringify(userData)) + '&' +
            encodeURIComponent("content.type") + '=' + encodeURIComponent(0)+ '&' +
            encodeURIComponent("content.topic") + '=' + encodeURIComponent(JSON.stringify(this.topicList));   
        this.$api.annouce(
          newData,
          {
            onSucess: res => {
              if(res.data.status == 1) {
                this.information = '';
                this.sendRangeName = '';
                this.sendRangeList = [];
                this.topicList=[];
                this.getMessagesList();
                that.$notify({
                  title: res.data.message,
                  message: '',
                  type: 'success'
                });
                this.fileList = []; //发布成功上传附件清空
              }
            }
          }
        )
      }
    },
    //获取企业动态公告和评论
    getMessagesList() {
      this.$api.getMessagesList(
        {
          onSucess: res => {
            this.messagesListNum = res.data.data.rowCount
            //this.messagesList = res.data.data.datas;
            let newData = res.data.data.datas.map(item => {
              let topic=JSON.parse(item.topic)
              return {
                attachment: item.attachment,
                comment: item.comment,
                commentCount: item.commentCount,
                // content: this.getEmot(item.content),
                content:item.content,
                createTime: item.createTime,
                id: item.id,
                module: item.module,
                receiverDeptId: item.receiverDeptId,
                receiverId: item.receiverId,
                receiverInfo: item.receiverInfo,
                scope: item.scope,
                sender: item.sender,
                senderDept: item.senderDept,
                senderDeptId:item.senderDeptId,
                senderId: item.senderId,
                sticky: item.sticky,
                title: item.title,
                type: item.type,
                tabpanelComment: '',
                topic:topic,
              }
            })
            this.messagesList = newData;
            console.log(this.messagesList,"开始前")

          }
        }
      )
    },
    getEmot(val) {
    //   eplaceFace : function(str){
    //     if(str && str != undefined){
    //       let re = /\[.[^[]*\]/g; 
    //       let faceArr = str.match(re);
    //       if(faceArr != null && faceArr.length > 0){
    //         for(let i = 0; i < faceArr.length; i++){
    //           let fileName = Message.Util.cache.mapping["face_"+faceArr[i]];
    //           str = str.replace(faceArr[i],'<img src="img/face/'+fileName+'" border="0" />');
    //         }
    //       }
    //       return str;
    //     }
    //   },
      let value = val;
      let emo = '';
      for(let i=0; i<this.emotionList.length; i++) {
        //value = value.replace(this.emotionList[i].type,'<img src="obpm/message/img/face/ad_new0902_thumb.gif" />');
        
        value = value.replace(this.emotionList[i].type,this.emotionList[i].path);
        // console.log("value.--->",value)
      }
      //路径处理
      let path = this.statiContextPath ? this.statiContextPath : this.contextPath;
      value = value.replace(/<img src="\/message/g, '<img src="' + path + '/message');
      return value;
    },

    // 点击页数切换
    handleCurrentChange(val, name){
      switch (name){
        case 'unread':
          this.unReadCurrentPage = val;
          this.getNoticeData({ readStatus: '',
            type: this.currentFlowTypeNum?this.currentFlowTypeNum:0,
            _currpage: this.unReadCurrentPage,
            _rowcount: 30}, 'unread')
          break;
        case 'allNotice':
          this.allNoticeCurrentPage = val
          this.getNoticeData({ readStatus: '',
            type: this.currentFlowTypeNum?this.currentFlowTypeNum:0,
            _currpage: this.allNoticeCurrentPage,
            _rowcount: 30}, 'allNotice')
          break;
        default:
          break;
      }
    },

    getNoticeData(data, type){
          this.$api.getNotice(
            data,
            {
              onSucess: res => {
                if(type == 'unread'){
                  if(res.data.data.datas.length == 0) {
                    this.isEmptyPage = true;
                  }else {
                    this.isEmptyPage = false;
                    this.unreadWorkNum = res.data.data.rowCount;
                    this.unreadWorkItems = res.data.data.datas;
                  }
                }else{
                    this.allNoticeNum = res.data.data.rowCount;
                    this.allNotice = res.data.data.datas;
                    if(res.data.data.datas.length <=0) {
                      this.allIsEmptyPage = true;
                    }else {
                      this.allIsEmptyPage = false;
                    }
                }
                
                this.$forceUpdate();
              }
            }
          )
    },

    timeAgo(dateTimeStamp){
      const minute = 1000 * 60;
      const hour = minute * 60;
      const day = hour * 24;
      const halfamonth = day * 15;
      const month = day * 30;
      let time = ''
			if(dateTimeStamp==undefined){
				return false;
			}else{
				dateTimeStamp = dateTimeStamp.replace(/\-/g, "/")
				let sTime = new Date(dateTimeStamp).getTime();//把时间pretime的值转为时间戳
				let now = new Date().getTime();//获取当前时间的时间戳
				let diffValue = now - sTime;
				if(diffValue < 0){
					console.log("结束日期不能小于开始日期！");
				}
				let monthC =diffValue/month;
				let weekC =diffValue/(7*day);
				let dayC =diffValue/day;
				let hourC =diffValue/hour;
				let minC =diffValue/minute;
				if(monthC>=1){
					time = parseInt(monthC) + this.$t('view.month_ago')
				}
				else if(weekC>=1){
					time = parseInt(weekC) + this.$t('view.week_ago')
				}
				else if(dayC>=1){
					time = parseInt(dayC) +this.$t('view.day_ago')
				}
				else if(hourC>=1){
					time = parseInt(hourC) +this.$t('date.hour_ago')
				}
				else if(minC>=1){
					time = parseInt(minC) +this.$t('date.min_ago')
				}else{
					time = this.$t('date.now')
				}
			}
			return time
		}
  },
  filters: {
    writeCurrentDate(val){
      let now = new Date(val);
      let year=now.getFullYear(); 
      let month=now.getMonth()+1; 
      let date=now.getDate(); 
      let hour=now.getHours(); 
      let minute=now.getMinutes(); 
      let second=now.getSeconds(); 
      return year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second; 
    }
  }
};
</script>
