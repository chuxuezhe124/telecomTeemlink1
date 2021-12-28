<template>
  <div class="custom-stamp-wrap" :id="'stamp_'+formTemplateDocid" @mousedown.stop.prevent="move">
    <img :src="'/obpm/uploads/signs/' + signData.img" />
    <div class="btn-wrap">
      <span @click="confirmSignature">确 定</span>
      <span @click="cancel(false)">取 消</span>
    </div>
  </div>
</template>
<script>
  
export default {
  name: "form-stamp",
  props: [
    "openParams",
    "signData",
    "formTemplateDocid"
  ],

  mounted(){

  },

  data: function() {
    return {
      positionX:0,
      positionY:0,
    }
  },

  methods: {
    confirmSignature(){
      let signData = this.signData
      let x = this.positionX
      let y = this.positionY
      x = x < 5 ? 5 : x
      y = y < 65 ? 65 : y
      let obj = {
        left: x,
        top: y,
        img: "/uploads/signs/" + signData.img,
        userId: this.$store.state.userId,
        id: ''//signData.id,
      }
      this.$emit("event", obj)
    },
    cancel(val) {
      this.$emit("update:visible", val)
    },

    move(e){
      let id = "stamp_" + this.formTemplateDocid
      let odiv = document.getElementById(id) //e.target;  //获取目标元素
      //算出鼠标相对元素的位置
      let disX = e.clientX - odiv.offsetLeft
      let disY = e.clientY - odiv.offsetTop
      document.onmousemove = (e)=>{       //鼠标按下并移动的事件
        //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
        let left = e.clientX - disX
        let top = e.clientY - disY
        
        //绑定元素位置到positionX和positionY上面
        this.positionX = left
        this.positionY = top
        
        //移动当前元素
        odiv.style.left = left + 'px';
        odiv.style.top = top + 'px';
      };
      document.onmouseup = () => {
        document.onmousemove = null
        document.onmouseup = null
      };
    },
  }
}

</script>
