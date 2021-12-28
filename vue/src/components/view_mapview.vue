<template>
  <div class="map-view" style="height:100%;overflow:auto;">
    <div class="btns" v-if="showtype != 'home'">
      <span class="btn-icon" v-for="(item, index) in view.activities" :key="index">
        <a
          class="1 vbtn btn btn-primary obpm-primary"
          :class="item.color"
          :title="item.name"
          autobuild="false"
          @click="handleBtn(item.type, item)"
          v-if="item.type == 2"
        >
          <i v-if="item.icon && item.icon.type=='font'" :class="item.icon.icon"/>
          <img v-else-if="item.icon" :src="'../../lib/icon/'+item.icon.icon" height="14">
          <i v-else class="queryBtnicon"></i>
          {{item.name}}
        </a>
      </span>
      <span class="routeBtn">
        <el-button @click.native="handleClick()" :type="wayValue?'danger':'success'" size="mini">
          {{wayValue?$t('close_route'):$t('open_route')}}
        </el-button>
      </span>
    </div>
    <div v-if="view.mapType == 'arcgis'">
      <map_arcgis :field="undefined" id="arcgis_view"/>
    </div>
    <div class="map-con" ref = "mapView" v-else>
      <div class="sw">
        <el-radio-group v-model="radio" size="mini">
          <el-radio-button :label="$t('map')" @click.native="normalMap()"></el-radio-button>
          <el-radio-button :label="$t('statellite')" @click.native="mixMap()"></el-radio-button>
        </el-radio-group>
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
        :scroll-wheel-zoom="true"
        >
        <div v-if="viewDataList.data && viewDataList.data.length>0">
          <div v-for="(item,index) in viewDataList.data" :key="index">
            <bm-marker 
              :position="item.local?item.local:{lng:'',lat:''}"
              @click="infoWindowOpen(item.id, item)">
                <bm-info-window 
                  :show="currentShowId == item.id ? true : false" 
                  @close="infoWindowClose" 
                  style="width:280px;height:150px;"
                >
                  <div class="address-wrap">
                    <div class="list" v-for="(column, inx) in view.columns" :key="inx">
                      <div v-if="column.fieldName == $t('addr_list')">
                        {{$t('address')}}：{{item.items[column.id].value}}
                      </div>
                      <div v-else>
                        {{item.items[column.id].value}}
                      </div>
                    </div>
                    <span class="del" v-if="!isReadonly" @click="delMarker(item)">{{$t('delete')}}</span>
                  </div>
                </bm-info-window>
            </bm-marker>
          </div>
        </div>
        <bm-navigation anchor="BMAP_ANCHOR_BOTTOM_RIGHT"></bm-navigation>
        <bm-geolocation anchor="BMAP_ANCHOR_TOP_RIGHT" 
          :showAddressBar="true" 
          :autoLocation="true" 
          @change="change">
        </bm-geolocation>
        
        <bm-local-search 
          :keyword="location" 
          :auto-viewport="true" 
          style="display: none"
        >
        </bm-local-search>
        <bm-context-menu>
          <bm-context-menu-item :callback="setSign" :text="$t('sign')"></bm-context-menu-item>
          <bm-context-menu-item :callback="cancelSign" :text="$t('nosign')"></bm-context-menu-item>
          <bm-context-menu-item :callback="enlargeMap" :text="$t('enlarge')"></bm-context-menu-item>
          <bm-context-menu-item :callback="reduceMap" :text="$t('shrink')"></bm-context-menu-item>
        </bm-context-menu>
      </baidu-map>
    </div>
    <!-- :style="{ width : pendingContentW}" -->
    <div class="num" v-if="view.showTotalRow">{{$t('total')}}：{{row_count}}</div>
  </div>
</template>

<script>
import map_arcgis from "@/components/map_arcGIS.vue"
export default {
  inject:['reload'],
  name: "view-mapview",
  props: [
    "view", 
    "info", 
    "openParams", 
    "showtype",
    "includeDisplayType",
  ],
  components: {
    map_arcgis
  },
  data: function() {
		return {
      center: {
        lng: 113.261503, 
        lat: 23.131377
      },
      zoom: 14,
      isActive:false,
      currentMapType:"BMAP_NORMAL_MAP",
      currentLongitude:"",
      currentLatitude:"",
      keyword: '',
      location:'',
      show: false,
      markerPoint: {
        
      },
      markerAdress:'',
      adressTitle:'',
      adressContent:'',
      markerHidden:true,
      viewDataList:'',
      markerList:[],
      localDetail:'',
      id:'',
      pendingContentH: "",
      pendingContentW: "",
      row_count:'',
      wayValue: false,
      tableData: [],
      currentShowId:'',
      radio: '地图',
      isReadonly:false,
		}
  },
  mounted() {
    let view = this.view
    if(view.mapType != 'arcgis'){
      let iType = this.includeDisplayType        
      if(view.readonly || (iType && (iType == Constant.PermissionType_READONLY || iType == Constant.PermissionType_DISABLED))) { //只读或者包含元素为只读，视图都要只读
        this.isReadonly = true
      }
      this.getData();
      this.$nextTick(function() {
        if(this.$refs.mapView) {
          this.pendingContentH =
            document.documentElement.clientHeight -
            this.$refs.mapView.getBoundingClientRect().top;
          this.pendingContentW = document.getElementsByClassName("map-view")[0].offsetWidth + "px";
        }
      });
    }
  },
  methods: {
    handleClick(){
      this.wayValue = !this.wayValue
    },

    delMarker(item){
      let docIds = [];
      docIds.push(item.id);
      this.$confirm(this.$t('msg.delConfirm'), this.$t('tip'), {
        confirmButtonText: this.$t('msg.confirm'),
        cancelButtonText: this.$t('btns.cancel'),
        type: 'warning'
      }).then(() => {
        this.$api.batchRemoveDocuments(this.openParams.appId, docIds, {
          onSucess: (res) => {
            if(res.data.errcode == 0) {
              this.$notify({
                title:this.$t('success'),
                message:'',
                type: 'success'
              })
              this.getData();
            }
          }
        });
      }).catch(() => {
                
      });
     
    },

    reloadListView(){
      this.getData();
    },

    change(){
       
    },

    handleBtn(type, item) {
      let params = {
        linkType: "00",
        appId: this.openParams.appId,
        active: true,
        name:this.$t('view.mapview'),
        actionContent: item.onActionForm,
        refreshId: this.openParams.id,
      };
      this.$emit("add-tab", params)
    },

    getData() {
      let view = this.view;
      let currentLocation = view.town + view.city + view.province;
      if(!currentLocation){
        this.zoom=4
      }
      let that = this;
      setTimeout(()=>{
        let ls = new BMap.LocalSearch('北京',{renderOptions: {map: '',  autoViewport: true,  selectFirstResult: false}});
        ls.search( currentLocation );
        ls.setSearchCompleteCallback( function (rs){
          let point = ''
          if(rs.Hr) {
            point = rs.Hr[0].point
          }else if(rs.Ir) {
            point = rs.Ir[0].point;
          }

          if(point) {
            that.center = {
              lng: point.lng,
              lat: point.lat
            }
          }
        })
        this.$api.getViewData(
          this.openParams.appId,
          this.view.id,
          {},
          {},
          {
            onSucess: res => {
              let viewData = res.data.data
              this.row_count = viewData.row_count
              // let map = new BMap.Map();
              // let myGeo = new BMap.Geocoder();
              let view = this.view
              for(let i=0; i<viewData.data.length; i++) {
                for(let j=0; j < view.columns.length; j++) {
                  let obj = {};
                  if(view.columns[j].mappingField == "addresscolumn") {
                    let addressData = viewData.data[i].items[this.view.columns[j].id];
                    let address = addressData.value; 
                    var ls = new BMap.LocalSearch('北京',{renderOptions: {map: '',  autoViewport: true,  selectFirstResult: false}});
                    ls.search( address );
                    ls.setSearchCompleteCallback( function (rs){
                      if(rs.Ir) {
                        let point = rs.Ir[0].point
                        obj.lng = point.lng
                        obj.lat = point.lat
                        let ssws = that.wgs84togcj02(obj.lng, obj.lat)
                        ssws = that.gcj02tobd09(ssws[0]  , ssws[1])
                        // //解决定位偏移
                        // let newLat = ssws[1] - 0.000160
                        // let newLng = ssws[0] - 0.000160
                        // obj.lng = newLng
                        // obj.lat = newLat
                        viewData.data[i].local = obj
                      }
                    })
                  }
                }
              }
              this.$nextTick(() => {
                setTimeout(() => {
                  this.viewDataList = viewData
                  this.$forceUpdate()
                }, 2000)
              })  
            }
          }
        );
      },500)
    },

    //地图定位精确方法
    /**
     * WGS84转GCj02
     * @param lng
     * @param lat
     * @returns {*[]}
    */
    wgs84togcj02(lng, lat) {
      let that=this
      // let x_PI = 3.14159265358979324 * 3000.0 / 180.0;
      let PI = 3.1415926535897932384626;
      let a = 6378245.0;
      let ee = 0.00669342162296594323;
      if (that.out_of_china(lng, lat)) {
        return [lng, lat]
      }else {
        let dlat = that.transformlat(lng - 105.0, lat - 35.0);
        let dlng = that.transformlng(lng - 105.0, lat - 35.0);
        let radlat = lat / 180.0 * PI;
        let magic = Math.sin(radlat);
        magic = 1 - ee * magic * magic;
        let sqrtmagic = Math.sqrt(magic);
        dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
        dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
        let mglat = lat + dlat;
        let mglng = lng + dlng;
        return [mglng, mglat]
      }
    },
    /**
     * 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换
     * 即谷歌、高德 转 百度
     * @param lng
     * @param lat
     * @returns {*[]}
     */
    gcj02tobd09(lng, lat) {
      // let that = this
      let x_PI = 3.14159265358979324 * 3000.0 / 180.0;
      // let PI = 3.1415926535897932384626;
      // let a = 6378245.0;
      // let ee = 0.00669342162296594323;
      let z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_PI);
      let theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_PI);
      let bd_lng = z * Math.cos(theta) + 0.0065;
      let bd_lat = z * Math.sin(theta) + 0.006;
      return [bd_lng, bd_lat]
    },
    
    transformlat(lng, lat) {
      // let x_PI = 3.14159265358979324 * 3000.0 / 180.0;
      let PI = 3.1415926535897932384626;
      // let a = 6378245.0;
      // let ee = 0.00669342162296594323;
      let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
      ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
      ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
      ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
      return ret
    },
  
    transformlng(lng, lat) {
      // let x_PI = 3.14159265358979324 * 3000.0 / 180.0;
      let PI = 3.1415926535897932384626;
      // let a = 6378245.0;
      // let ee = 0.00669342162296594323;
      let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
      ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
      ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
      ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
      return ret
    },
  
    /**
     * 判断是否在国内，不在国内则不做偏移
     * @param lng
     * @param lat
     * @returns {boolean}
     */
    out_of_china(lng, lat) {
      return (lng < 72.004 || lng > 137.8347) || ((lat < 0.8293 || lat > 55.8271) || false);
    },



    handler ({BMap, map}) {
      this.center.lng = 113.261503;
      this.center.lat = 23.131377;
      this.zoom = 9
    },
    zoomEnd(e){
      console.log(e)
      this.zoom = e.target.getZoom();
    },
    //右键放大
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
    //右键缩小
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
      this.setMark(mLng, mLat);
    },
    cancelSign({BMap, map}){
      //有问题，隐藏
      this.markerHidden = false;
      console.log(BMap);
      console.log(map);
    },
    infoWindowClose(){
      this.currentShowId = ''
      // this.show = false;
    },
    infoWindowOpen (id) {
      this.currentShowId = id;
      this.show = true;
    },
    getDbclickInfo (e) {
      let mLng = e.point.lng,
          mLat = e.point.lat;
      this.setMark(mLng, mLat);
    },
    normalMap(){
      if(this.currentMapType == "BMAP_HYBRID_MAP"){
        this.currentMapType = "BMAP_NORMAL_MAP"
      }  
    },
    mixMap(){
      if(this.currentMapType == "BMAP_NORMAL_MAP"){
        this.currentMapType = "BMAP_HYBRID_MAP"
      }  
    },
    searchLocation(){
      this.location = this.keyword;
    },
    searchBox(e) {
      this.isActive = !this.isActive;
      console.log(e);
    },
    Delete(id){
      let that = this;
      console.log('删除',id)
      let arr =[];
      arr.push(id);
      this.$api.batchRemoveDocuments(this.openParams.appId, arr, {
        onSucess: () => {
          Toast({
            message: this.$t('msg.es'),
            iconClass: 'fa fa-check fa-2x'
          });
          that.reload();
        }
      });
    }
  }
}
</script>

<style lang="scss">

</style>