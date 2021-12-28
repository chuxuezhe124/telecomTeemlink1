<template>
  <div class="wrapper" style="width:100%;height:550px;">
    <div 
      v-if="field"
      :ref="'map' + field.id" 
      :class="'map' + field.id" 
      :id="'map' + field.id"
      style="width:100%;height:100%;">
    </div>
    <div 
      v-else
      style="width:100%;height:100%;">
    </div>
  </div>
</template>
 
<script>
import Vue from 'vue'
import esriLoader from "esri-loader";
export default {
  name: "",
 
  components: {},
 
  props: [
    "field",
  ],
 
  data() {
    return {};
  },
 
  created() {},
 
  mounted() {
    // const option = {url: 'https://js.arcgis.com/4.3/'}    //注意：不同版本的ArcGIS API的用法可能不一样
    const option = {url: 'https://js.arcgis.com/4.16/'}
    esriLoader.loadModules (
      [
        "esri/Map",
        'esri/views/MapView',
        "esri/widgets/Search",
        "esri/layers/MapImageLayer",
        "esri/widgets/Locate",
        "esri/Graphic",
        "esri/request",
        "esri/widgets/Search/SearchSource",
        "esri/geometry/geometryEngine",
        "esri/geometry/Point",
        "esri/widgets/Expand",
        "esri/widgets/BasemapGallery",
        "dojo/domReady!",
      ], option
    )
    .then (([
      Map,
      MapView,
      Search,
      MapImageLayer,
      Locate,
      Graphic,
      esriRequest,
      SearchSource,
      geometryEngine,
      Point,
      Expand,
      BasemapGallery,
    ]) => {
      const map = new Map ({
        basemap: "streets",
        backgroundColor: "#eee",
        logo: false,
        slider: false,
        setZoom: 4,
      })
      const view = new MapView ({
          backgroundColor: "#eee",
          container: this.field ? (this.field.openType === 'dialog' && this.field.maptype === 'arcgis' ? 'arcgis_dialog_id': this.field.id): 'arcgis_view',
          map: map,
          zoom: 4,
          minZoom: 4,
          center: [ 113.17, 23.8 ],
          setZoom: 4,
      });
      var search = new Search({
        view: view,
      });
      view.ui.add(search, {
        position: "top-right",
        index: 2
      });

      var locateBtn =new Locate({
        view: view,
      });
      view.ui.add(locateBtn, {
        position: "top-left"
      });

      var basemapGallery = new BasemapGallery({
        view: view,
        container: document.createElement("div")
      });
      var bgExpand = new Expand({
          view: view,
          content: basemapGallery
      });
      basemapGallery.watch("activeBasemap", function() {
          var mobileSize =
          view.heightBreakpoint === "xsmall" ||
          view.widthBreakpoint === "xsmall";

          if (mobileSize) {
            bgExpand.collapse();
          }
      });


      view.ui.add(bgExpand, "top-right");
      
    }, reason => {
        console.log (reason);
    })
  },

 
  computed: {},
 
  methods: {}
};
</script>
<style scoped>
/* @import url("https://js.arcgis.com/4.3/esri/css/main.css"); */
@import url("https://js.arcgis.com/4.16/esri/themes/light/main.css");
.map {
  width: 100%;
  height: 100vh;
}
</style>
