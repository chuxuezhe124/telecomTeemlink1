<template>
  <div class="main-flow-center">
    <div class="main-flow-left">
      <div class="title">
        {{$t('p_center')}}
      </div>
      <div :class="[currentActive == '1'?'current-active':'','flow-list']" @click="onClickList(1)">
        {{$t('new_create')}}
      </div>
      <div :class="[currentActive == '2'?'current-active':'','flow-list']" @click="onClickList(2)">
        {{$t('todo')}}
      </div>
      <div :class="[currentActive == '3'?'current-active':'','flow-list']" @click="onClickList(3)">
        {{$t('track')}} 
      </div>
      <div :class="[currentActive == '4'?'current-active':'','flow-list']" @click="onClickList(4)">
        {{$t('analysis')}} 
      </div>
    </div>
    <div class="main-flow-right">
      <div class="main-flow-right-wrap" v-if="currentActive == '1'">
        <main_launch :openParams="openParams" />
        
      </div>
      <div class="main-flow-right-wrap" v-if="currentActive == '2'">
        <main_pending :openParams="openParams" />
      </div>
      <div class="main-flow-right-wrap" v-if="currentActive == '3'">
        <main_processing :openParams="openParams" />
      </div>
      <div class="main-flow-right-wrap" v-if="currentActive == '4'">
        <main_meter :openParams="openParams" />
      </div>
    </div>
  </div>
</template>
<script>
import main_pending from "@/components/main_pending.vue"
import main_launch from "@/components/main_launch.vue"
import main_processing from "@/components/main_processing.vue"
import main_meter from "@/components/main_meter"
export default {
  props: ["openParams"],
  components: {
    main_pending,
    main_launch,
    main_processing,
    main_meter
  },
  data() {
    return {
      currentActive: '2',
    };
  },
  methods: {
    onClickList(val) {
      this.currentActive = val;
    }
  }

}
</script>

<style>

</style>