<template>
    <div :id='id' style="width:100%; position:relative;">
      <template v-if="field.displayType == Constant.PermissionType_HIDDEN">
				<!--隐藏-->
				{{field.printHiddenValue?field.printHiddenValue:field.hiddenValue}}
			</template>

      <template v-else-if="field.displayType == Constant.PermissionType_PRINT">
        <div v-if="field.openType == 'dialog'">
          <el-button class="btns" @click="dialogVisible = true">{{field.name}}</el-button>
          <el-dialog
            :visible.sync="dialogVisible"
            width="50%"
            style="overflow: hidden" margin-top="8vh">
            <div> 
              <!-- <input type="button" class="btns" :value="$t('btns.query')" @click.stop.prevent="searchBox($event)"> -->
              <el-button size="mini" round @click.stop.prevent="searchBox($event)">{{$t('btns.query')}}</el-button>
              <div class="change-map">
                <span @click="normalMap()" :class="mapNum==1?'map-color':''">{{$t('map')}}</span>
                <span @click="mixMap()" :class="mapNum==2?'map-color':''">{{$t('blend')}}</span>
              </div>
              <div class="search-frame" v-if="isActive">
                <div class="frame-content">
                  <div class="header">
                    <span>{{$t('placeholder.search')}}:</span>
                    <input type="button" class="btns" :value="$t('form.close')" @click.stop.prevent="searchBox()">
                  </div>
                  <div class="wrap">
                    <span>{{$t('view.ll_search')}}</span>
                    <span>{{$t('view.longitude')}}</span>
                    <span>
                      <el-input  placeholder="" v-model="currentLongitude"></el-input>
                    </span>
                    <span>{{$t('view.latitude')}}</span>
                    <span>
                      <el-input  placeholder="" v-model="currentLatitude"></el-input>
                    </span>
                    <span>
                      <!-- <button @click="changeLAL()">$t('btns.query')</button> -->
                      <input type="button" class="btns" :value="$t('btns.query')" @click.stop.prevent="changeLAL()">
                    </span>
                    <span>{{$t('view.addr_search')}}</span>
                    <span>{{$t('view.detail_addr')}}</span>
                    <span>
                      <el-input v-model="keyword" ></el-input>
                    </span>
                    <span>
                      <input type="button" class="btns" :value="$t('btns.query')" @click.stop.prevent="searchLocation()">
                    </span>
                  </div>
                </div>
              </div>
              <baidu-map
                id="box"
                :center="center" 
                :zoom="zoom"  
                class="bm-view"
                :mapType="currentMapType"
                @dblclick="getDbclickInfo"
                :double-click-zoom = "false"
                @zoomend="zoomEnd"
                >
                  <div v-if="markerList && markerList.length>0">
                    <div v-for="(item, index) in markerList" :key="index">
                      <bm-marker :position="{ lng: item.lng, lat: item.lat}" :dragging="true" @click="infoWindowOpen(index)">
                        <bm-info-window 
                          :show="item.isShow" 
                          @close="infoWindowClose(index)" 
                          @open="infoWindowOpen(index)"
                          style="width:280px;height:220px;"
                        >
                          <div class="address-wrap">
                            <div>{{$t('address')}}：</div>
                            <div class="info">{{item.address}}</div>
                            <div class="common">
                              <div>{{$t('btns.add')}}{{$t('form.abstract_title')}}</div>
                              <el-input  placeholder="" v-model="item.title" ></el-input>
                            </div>
                            <div class="add-con">
                              <div>{{$t('btns.add')}}{{$t('label.content')}}</div>
                              <el-input  placeholder="" v-model="item.detail" ></el-input>
                            </div>
                            <div class="isEmpty" v-if="isWarring">{{$t('view.tc_notnull')}}</div>
                            <div class="add-btn">
                              <span>
                                <input type="button" class="btns" :value="$t('msg.confirm')" @click.stop.prevent="onOk(index)">
                              </span>
                              <span>
                                <input type="button" class="btns" :value="$t('reset')" @click.stop.prevent="onReset(index)">
                              </span>
                            </div>
                          </div>
                        </bm-info-window>
                      </bm-marker>
                    </div>
                  </div>
                <bm-navigation anchor="BMAP_ANCHOR_TOP_LEFT"></bm-navigation>
                <bm-geolocation anchor="BMAP_ANCHOR_BOTTOM_RIGHT" 
                  :showAddressBar="true" 
                  :autoLocation="true">
                </bm-geolocation>
                <bm-local-search 
                  :keyword="location" 
                  :auto-viewport="true" 
                  style="display: none"
                >
                </bm-local-search>
                <bm-context-menu>
                  <bm-context-menu-item :callback="setSign" :text="$t('nosign')"></bm-context-menu-item>
                  <bm-context-menu-item :callback="cancelSign" :text="$t('nosign')"></bm-context-menu-item>
                  <bm-context-menu-item :callback="enlargeMap" :text="$t('enlarge')"></bm-context-menu-item>
                  <bm-context-menu-item :callback="reduceMap" :text="$t('shrink')"></bm-context-menu-item>
                </bm-context-menu>
              </baidu-map>
            </div>
          </el-dialog> 
        </div>
        <div v-else>
          <!-- <input type="button" class="btns" :value="$t('btns.query')" @click.stop.prevent="searchBox($event)"> -->
          <el-button size="mini" round @click.stop.prevent="searchBox($event)">{{$t('btns.query')}}</el-button>
          <div class="change-map">
            <span @click="normalMap()" :class="mapNum==1?'map-color':''">{{$t('map')}}</span>
            <span @click="mixMap()" :class="mapNum==2?'map-color':''">{{$t('blend')}}</span>
          </div>
          <div class="search-frame" v-if="isActive">
            <div class="frame-content">
              <div class="header">
                <span>{{$t('placeholder.search')}}:</span>
                <input type="button" class="btns" :value="$t('form.close')" @click.stop.prevent="searchBox()">
              </div>
              <div class="wrap">
                <span>{{$t('view.ll_search')}}</span>
                <span>{{$t('view.longitude')}}</span>
                <span>
                  <el-input  placeholder="" v-model="currentLongitude"></el-input>
                </span>
                <span>{{$t('view.latitude')}}</span>
                <span>
                  <el-input  placeholder="" v-model="currentLatitude"></el-input>
                </span>
                <span>
                  <!-- <button @click="changeLAL()">$t('btns.query')</button> -->
                  <input type="button" class="btns" :value="$t('btns.query')" @click.stop.prevent="changeLAL()">
                </span>
                <span>{{$t('view.addr_search')}}</span>
                <span>{{$t('view.detail_addr')}}</span>
                <span>
                  <el-input v-model="keyword" ></el-input>
                </span>
                <span>
                  <input type="button" class="btns" :value="$t('btns.query')" @click.stop.prevent="searchLocation()">
                </span>
              </div>
            </div>
          </div>
          <baidu-map
            id="box"
            :center="center" 
            :zoom="zoom"  
            class="bm-view"
            :mapType="currentMapType"
            @dblclick="getDbclickInfo"
            :double-click-zoom = "false"
            @zoomend="zoomEnd"
            >
              <div v-if="markerList && markerList.length>0">
                <div v-for="(item, index) in markerList" :key="index">
                  <bm-marker :position="{ lng: item.lng, lat: item.lat}" :dragging="true" @click="infoWindowOpen(index)">
                    <bm-info-window 
                      :show="item.isShow" 
                      @close="infoWindowClose(index)" 
                      @open="infoWindowOpen(index)"
                      style="width:280px;height:220px;"
                    >
                      <div class="address-wrap">
                        <div>{{$t('address')}}：</div>
                        <div class="info">{{item.address}}</div>
                        <div class="common">
                          <div>{{$t('btns.add')}}{{$t('form.abstract_title')}}</div>
                          <el-input  placeholder="" v-model="item.title" ></el-input>
                        </div>
                        <div class="add-con">
                          <div>{{$t('btns.add')}}{{$t('label.content')}}</div>
                          <el-input  placeholder="" v-model="item.detail" ></el-input>
                        </div>
                        <div class="isEmpty" v-if="isWarring">{{$t('view.tc_notnull')}}</div>
                        <div class="add-btn">
                          <span>
                            <input type="button" class="btns" :value="$t('msg.confirm')" @click.stop.prevent="onOk(index)">
                          </span>
                          <span>
                            <input type="button" class="btns" :value="$t('reset')" @click.stop.prevent="onReset(index)">
                          </span>
                        </div>
                      </div>
                    </bm-info-window>
                  </bm-marker>
                </div>
              </div>
            <!-- <bm-map-type :map-types="['BMAP_NORMAL_MAP', 'BMAP_HYBRID_MAP']" anchor="BMAP_ANCHOR_TOP_RIGHT"></bm-map-type> -->
            <bm-navigation anchor="BMAP_ANCHOR_TOP_LEFT"></bm-navigation>
            <bm-geolocation anchor="BMAP_ANCHOR_BOTTOM_RIGHT" 
              :showAddressBar="true" 
              :autoLocation="true">
            </bm-geolocation>
            <bm-local-search 
              :keyword="location" 
              :auto-viewport="true" 
              style="display: none"
            >
            </bm-local-search>
            <bm-context-menu>
              <bm-context-menu-item :callback="setSign" :text="$t('nosign')"></bm-context-menu-item>
              <bm-context-menu-item :callback="cancelSign" :text="$t('nosign')"></bm-context-menu-item>
              <bm-context-menu-item :callback="enlargeMap" :text="$t('enlarge')"></bm-context-menu-item>
              <bm-context-menu-item :callback="reduceMap" :text="$t('shrink')"></bm-context-menu-item>
            </bm-context-menu>
          </baidu-map>
        </div>
      </template>

      <template v-else-if="field.displayType == Constant.PermissionType_READONLY || field.displayType == Constant.PermissionType_DISABLED">
      
      </template>

      <template v-else-if="field.displayType == Constant.PermissionType_MODIFY">
				<!--可编辑-->
        <div v-if="field.maptype === 'arcgis'">
          <div v-if="field.openType == 'dialog'">
            <el-button class="btns" @click="dialogVisible = true">{{field.name}}</el-button>
            <el-dialog
              :visible.sync="dialogVisible"
              width="50%"
              style="overflow: hidden" margin-top="8vh"
              >
              <map_arcgis :field="field" id="arcgis_dialog_id"/>
            </el-dialog>
          </div>
          <div v-else>
            <map_arcgis :field="field" />
          </div>
        </div>
        <!-- 百度地图 -->
        <div v-else>
          <div v-if="field.openType == 'dialog'">
            <el-button class="btns" @click="dialogVisible = true">{{field.name}}</el-button>
            <el-dialog
              :visible.sync="dialogVisible"
              width="50%"
              style="overflow: hidden" margin-top="8vh">
              <div> 
                <!-- <input type="button" class="btns" :value="$t('btns.query')" @click.stop.prevent="searchBox($event)"> -->
                <el-button size="mini" round @click.stop.prevent="searchBox($event)">{{$t('btns.query')}}</el-button>
                <div class="change-map">
                  <span @click="normalMap()" :class="mapNum==1?'map-color':''">{{$t('map')}}</span>
                  <span @click="mixMap()" :class="mapNum==2?'map-color':''">{{$t('blend')}}</span>
                </div>
                <div class="search-frame" v-if="isActive">
                  <div class="frame-content">
                    <div class="header">
                      <span>{{$t('placeholder.search')}}:</span>
                      <input type="button" class="btns" :value="$t('form.close')" @click.stop.prevent="searchBox()">
                    </div>
                    <div class="wrap">
                      <span>{{$t('view.ll_search')}}</span>
                      <span>{{$t('view.longitude')}}</span>
                      <span>
                        <el-input  placeholder="" v-model="currentLongitude"></el-input>
                      </span>
                      <span>{{$t('view.latitude')}}</span>
                      <span>
                        <el-input  placeholder="" v-model="currentLatitude"></el-input>
                      </span>
                      <span>
                        <!-- <button @click="changeLAL()">$t('btns.query')</button> -->
                        <input type="button" class="btns" :value="$t('btns.query')" @click.stop.prevent="changeLAL()">
                      </span>
                      <span>{{$t('view.addr_search')}}</span>
                      <span>{{$t('view.detail_addr')}}</span>
                      <span>
                        <el-input v-model="keyword" ></el-input>
                      </span>
                      <span>
                        <input type="button" class="btns" :value="$t('btns.query')" @click.stop.prevent="searchLocation()">
                      </span>
                    </div>
                  </div>
                </div>
                <baidu-map
                  id="box"
                  :center="center" 
                  :zoom="zoom"  
                  class="bm-view"
                  :mapType="currentMapType"
                  @dblclick="getDbclickInfo"
                  :double-click-zoom = "false"
                  @zoomend="zoomEnd"
                  >
                    <div v-if="markerList && markerList.length>0">
                      <div v-for="(item, index) in markerList" :key="index">
                        <bm-marker :position="{ lng: item.lng, lat: item.lat}" :dragging="true" @click="infoWindowOpen(index)">
                          <bm-info-window 
                            :show="item.isShow" 
                            @close="infoWindowClose(index)" 
                            @open="infoWindowOpen(index)"
                            style="width:280px;height:220px;"
                          >
                            <div class="address-wrap">
                              <div>{{$t('address')}}：</div>
                              <div class="info">{{item.address}}</div>
                              <div class="common">
                                <div>{{$t('btns.add')}}{{$t('form.abstract_title')}}</div>
                                <el-input  placeholder="" v-model="item.title" ></el-input>
                              </div>
                              <div class="add-con">
                                <div>{{$t('btns.add')}}{{$t('label.content')}}</div>
                                <el-input  placeholder="" v-model="item.detail" ></el-input>
                              </div>
                              <div class="isEmpty" v-if="isWarring">{{$t('view.tc_notnull')}}</div>
                              <div class="add-btn">
                                <span>
                                  <input type="button" class="btns" :value="$t('msg.confirm')" @click.stop.prevent="onOk(index)">
                                </span>
                                <span>
                                  <input type="button" class="btns" :value="$t('reset')" @click.stop.prevent="onReset(index)">
                                </span>
                              </div>
                            </div>
                          </bm-info-window>
                        </bm-marker>
                      </div>
                    </div>
                  <!-- <bm-map-type :map-types="['BMAP_NORMAL_MAP', 'BMAP_HYBRID_MAP']" anchor="BMAP_ANCHOR_TOP_RIGHT"></bm-map-type> -->
                  <bm-navigation anchor="BMAP_ANCHOR_TOP_LEFT"></bm-navigation>
                  <bm-geolocation anchor="BMAP_ANCHOR_BOTTOM_RIGHT" 
                    :showAddressBar="true" 
                    :autoLocation="true">
                  </bm-geolocation>
                  <bm-local-search 
                    :keyword="location" 
                    :auto-viewport="true" 
                    style="display: none"
                  >
                  </bm-local-search>
                  <bm-context-menu>
                    <bm-context-menu-item :callback="setSign" :text="$t('nosign')"></bm-context-menu-item>
                    <bm-context-menu-item :callback="cancelSign" :text="$t('nosign')"></bm-context-menu-item>
                    <bm-context-menu-item :callback="enlargeMap" :text="$t('enlarge')"></bm-context-menu-item>
                    <bm-context-menu-item :callback="reduceMap" :text="$t('shrink')"></bm-context-menu-item>
                  </bm-context-menu>
                </baidu-map>
              </div>
            </el-dialog> 
          </div>
          <div v-else> 
            <el-button size="mini" round @click.stop.prevent="searchBox($event)">{{$t('btns.query')}}</el-button>
            <!-- <input type="button" class="btns" :value="$t('btns.query')" @click.stop.prevent="searchBox($event)"> -->
            <div class="change-map">
              <span @click="normalMap()" :class="mapNum==1?'map-color':''">{{$t('map')}}</span>
              <span @click="mixMap()" :class="mapNum==2?'map-color':''">{{$t('blend')}}</span>
            </div>
            <div class="search-frame" v-if="isActive">
              <div class="frame-content">
                <div class="header">
                  <span>{{$t('placeholder.search')}}:</span>
                  <input type="button" class="btns" :value="$t('form.close')" @click.stop.prevent="searchBox()">
                </div>
                <div class="wrap">
                  <span>{{$t('view.ll_search')}}</span>
                  <span>{{$t('view.longitude')}}</span>
                  <span>
                    <el-input  placeholder="" v-model="currentLongitude"></el-input>
                  </span>
                  <span>{{$t('view.latitude')}}</span>
                  <span>
                    <el-input  placeholder="" v-model="currentLatitude"></el-input>
                  </span>
                  <span>
                    <!-- <button @click="changeLAL()">$t('btns.query')</button> -->
                    <input type="button" class="btns" :value="$t('btns.query')" @click.stop.prevent="changeLAL()">
                  </span>
                  <span>{{$t('view.addr_search')}}</span>
                  <span>{{$t('view.detail_addr')}}</span>
                  <span>
                    <el-input v-model="keyword" ></el-input>
                  </span>
                  <span>
                    <input type="button" class="btns" :value="$t('btns.query')" @click.stop.prevent="searchLocation()">
                  </span>
                </div>
              </div>
            </div>
            <baidu-map
              id="box"
              :center="center" 
              :zoom="zoom"  
              class="bm-view"
              :mapType="currentMapType"
              @dblclick="getDbclickInfo"
              :double-click-zoom = "false"
              @zoomend="zoomEnd"
              >
              <div v-if="markerList && markerList.length>0">
                <div v-for="(item, index) in markerList" :key="index">
                  <bm-marker :position="{ lng: item.lng, lat: item.lat}" :dragging="true" @click="infoWindowOpen(index)">
                    <bm-info-window 
                      :show="item.isShow" 
                      @close="infoWindowClose(index)" 
                      @open="infoWindowOpen(index)"
                      style="width:280px;height:220px;"
                    >
                      <div class="address-wrap">
                        <div>{{$t('address')}}：</div>
                        <div class="info">{{item.address}}</div>
                        <div class="common">
                          <div>{{$t('btns.add')}}{{$t('form.abstract_title')}}</div>
                          <el-input  placeholder="" v-model="item.title" ></el-input>
                        </div>
                        <div class="add-con">
                          <div>{{$t('btns.add')}}{{$t('label.content')}}</div>
                          <el-input  placeholder="" v-model="item.detail" ></el-input>
                        </div>
                        <div class="isEmpty" v-if="isWarring">{{$t('view.tc_notnull')}}</div>
                        <div class="add-btn">
                          <span>
                            <input type="button" class="btns" :value="$t('msg.confirm')" @click.stop.prevent="onOk(index)">
                          </span>
                          <span>
                            <input type="button" class="btns" :value="$t('reset')" @click.stop.prevent="onReset(index)">
                          </span>
                        </div>
                      </div>
                    </bm-info-window>
                  </bm-marker>
                </div>
              </div>
              <!-- <bm-map-type :map-types="['BMAP_NORMAL_MAP', 'BMAP_HYBRID_MAP']" anchor="BMAP_ANCHOR_TOP_RIGHT"></bm-map-type> -->
              <bm-navigation anchor="BMAP_ANCHOR_TOP_LEFT"></bm-navigation>
              <bm-geolocation anchor="BMAP_ANCHOR_BOTTOM_RIGHT" 
                :showAddressBar="true" 
                :autoLocation="true">
              </bm-geolocation>
              <bm-local-search 
                :keyword="location" 
                :auto-viewport="true" 
                style="display: none"
              >
              </bm-local-search>
              <bm-context-menu>
                <bm-context-menu-item :callback="setSign" :text="$t('nosign')"></bm-context-menu-item>
                <bm-context-menu-item :callback="cancelSign" :text="$t('nosign')"></bm-context-menu-item>
                <bm-context-menu-item :callback="enlargeMap" :text="$t('enlarge')"></bm-context-menu-item>
                <bm-context-menu-item :callback="reduceMap" :text="$t('shrink')"></bm-context-menu-item>
              </bm-context-menu>
            </baidu-map>
          </div>
        </div>
      </template>
    </div>
</template>
<script>
import Constant from "@/Constant.js"
import map_arcgis from "@/components/map_arcGIS.vue"
import controlHidden from "@/assets/js/controlHidden.js"
export default {
  name: "o-map",
  props: ["id"],
  components: {
    map_arcgis
  },
  computed: {
    field: function() {
      let formData = this.$parent.findField(this.id);
      this.setValue(formData.value)
      return formData
    },
  },

  mounted(){
    this.$nextTick(()=>{
      let field = this.field;
      if(field.isHideType) {
        let id = this.id,
          formShowType = field.formShowType;
        controlHidden({id, field, formShowType})
      }
    })
  },

  data: function() {
		return {
      Constant,
      dialogVisible:false,
      center: {
        lng: 116.404, 
        lat: 39.915
      },
      zoom: 3,
      currentStyle:"search-frame",
      isActive:false,
      currentMapType:"BMAP_NORMAL_MAP",
      mapNum:1,
      currentLongitude:"",
      currentLatitude:"",
      keyword: '',
      location:'',
      show: false,
      markerList: [],
      markerPoint: {
        lng:'',
        lat:'',
      },
      markerAdress:'',
      adressTitle:'',
      adressContent:'',
      markerHidden:true,
      isWarring: false,
		}
  },
  
  methods: {
    setValue(value){
      if(value && JSON.parse(value).length > 0) {
        this.markerList = JSON.parse(value);
      }else  {
        this.markerList = []
      }
    },

    onOk(index){
      this.markerList[index].isShow = false
      this.field.value = JSON.stringify(this.markerList)
    },

    onReset(index) {
      this.markerList[index].title = ''
      this.markerList[index].detail = ''
      this.$forceUpdate()
    },

    handler ({BMap, map}) {
      console.log({BMap, map})
      this.center.lng = 116.404
      this.center.lat = 39.915
      this.zoom = 3
    },

    zoomEnd(e){
      console.log(e)
      this.zoom = e.target.getZoom();
    },

    //右键$t('enlarge')
    enlargeMap(e){
      this.center = {
        lng: e.point.lng,
        lat: e.point.lat
      };
      this.zoom = this.zoom+2;
      if(this.zoom>=19){
        this.zoom = 19;
      }
      console.log(this.zoom);
    },

    //右键$t('shrink')
    reduceMap(e){
      this.center = {
        lng: e.point.lng,
        lat: e.point.lat
      };
      this.zoom = this.zoom-2;
      if(this.zoom<=0) {
        this.zoom = 1
      }
    },

    setSign(e){
      let mLng = e.point.lng,
          mLat = e.point.lat;
      this.setMark(mLng, mLat, close = true);
    },

    cancelSign({BMap, map}){
      //有问题，隐藏
      this.markerHidden = false;
    },

    infoWindowClose (index) {
      this.markerList[index].isShow = false
      this.$forceUpdate()
    },

    infoWindowOpen (index) {
      this.markerList[index].isShow = true
      this.$forceUpdate()
    },

    getDbclickInfo (e) {
      let mLng = e.point.lng,
          mLat = e.point.lat;
      this.setMark(mLng, mLat);
    },

    setMark(mLng, mLat, close){
      let that = this;
      let myGeo = new BMap.Geocoder();
      let p = new BMap.Point(mLng, mLat);
      myGeo.getLocation(p, function(rs){
        let addComp = rs.addressComponents;
        let address = addComp.province+addComp.city+addComp.district+addComp.street+addComp.streetNumber;
        if(that.markerAdress && that.markerAdress !=  address) {
          that.adressTitle = '';
          that.adressContent = '';
        }
        that.markerAdress = address;
        that.markerPoint.lng = mLng;
        that.markerPoint.lat = mLat;
        that.markerHidden = true;

        // markerList
        let obj = {
          lat: mLat,
          lng: mLng,
          address: address,
          title: that.adressTitle,
          detail: that.adressContent,
          isShow: true,
        }
        
        that.markerList.push(obj)

        that.field.value = JSON.stringify(that.markerList)
        if(close == true) {
          that.show = false
        }else {
          that.show = true;
        }
      });
    },

    normalMap(){
      if(this.mapNum == 2) {
        this.currentMapType = "BMAP_NORMAL_MAP"
        this.mapNum = 1;
      }
    },

    mixMap(){
      if(this.mapNum == 1) {
        this.currentMapType = "BMAP_HYBRID_MAP"
        this.mapNum = 2;
      }
    },

    searchLocation(){
      this.location = this.keyword;
    },

    searchBox(e) {
      this.isActive = !this.isActive;
    },

    changeLAL () {
      console.log("经纬度改变了");
      let that = this;
      if(this.currentLongitude && this.currentLatitude) {
        this.center = {
          lng: that.currentLongitude,
          lat: that.currentLatitude
        },
        this.zoom = 15;
      }
      
    },
  }
}
</script>

<style lang="scss">
  .bm-view {
    margin:0 auto;
    width: 95%;
    height: 600px;
  }
  .isHidden {
    display: none;
  }
  .btns{
    padding:2px 7px;
    font-size: 11px;
  }
  .change-map {
    width:75px;
    height:20px;
    position:absolute;
    right:36px;
    top:40px;
    z-index:5000;
    display:-webkit-flex;
    display: flex;
    flex-direction: row;
    background:white;
    border:1px solid #8ea8e0;
    border-radius: 4px;
    overflow: hidden;
    -webkit-box-shadow:2px 2px 4px #8ea8e0;  
    -moz-box-shadow:2px 2px 4px #8ea8e0;  
    box-shadow:2px 2px 4px #8ea8e0; 
    span {
      cursor:pointer;
      display:block;
      width:50%;
      height:20px;
      line-height: 20px;
      text-align: center;
      font-size:12px;
    }
  }
  .map-color{
    background:#8ea8e0;
    color:white;
    font-weight:bold;
  }
  .search-frame{
    width:215px;
    border:1px solid black;
    background: white;
    position: absolute;
    left:0;
    top:30px;
    z-index:5000;
    .frame-content {
      width:100%;
      height:560px;
      .header {
        width:100%;
        height:40px;
        display: -webkit-flex;
        display: flex;
        align-items: center;
        background:#e2e2e2;
        span:first-child {
          margin-left:3px;
          width:80%;
          font-size:22px;
          font-weight: bold;
        }
      }
      .wrap {
        display: -webkit-flex;
        display: flex;
        flex-direction: column;
        padding-left:3px;
        padding-right:3px;
        span:first-child {
          width:100%;
          height:40px;
          line-height:40px;
          font-size:19px;
          font-weight:bold;
          margin-bottom:10px;
        }
        span:nth-child(2),span:nth-child(4),span:nth-child(8) {
          height:30px;
          line-height:30px;
          font-size:16px;
        }
        span:nth-child(6), span:nth-child(10){
          margin-top:10px;
        }
        span:nth-child(7) {
          margin-top:40px;
          height:40px;
          line-height:40px;
          font-size:19px;
          font-weight:bold;
          margin-bottom:10px;
        }
      }
    }
  }
  .address-wrap {
    width:100%;
    &>div{
      width:100%;
      display:-webkit-flex;
      display: flex;
      flex-direction:row;
      &>div{
        height:40px;
        line-height:40px;
        vertical-align:middle;
        white-space:nowrap;
      }
      &:first-child {
        margin: 5px 0 10px 0;
        font-weight: bold;
      }
    }
    .info {
      margin-bottom:30px;
    }
    .add-con {
      margin-top: 10px;
    }
    // .common {
    //   margin-bottom: 15px;
    // }
    .isEmpty {
      color:red;
      margin-top: 5px;
      margin-bottom: 10px;
      text-align: center;
    }
    .add-btn {
      margin-top:15px;
      display: -webkit-flex;
      display:flex;
      justify-content: center;
      &>span {
        margin-right:30px;
      }
    }
  }
</style>