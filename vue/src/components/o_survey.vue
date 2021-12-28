<template>
    <div :id="id" class="survey-control">
			<template v-if="field.displayType == Constant.PermissionType_HIDDEN || field.textType == 'hidden'">
				<!--隐藏-->
				<input type="hidden" v-model="field.value" />
				<!-- <span>{{field.hiddenValue}}</span> -->
				<span>{{field.printHiddenValue?field.printHiddenValue:field.hiddenValue}}</span>
			</template>
			<template v-else-if="field.textType == 'readonly' || field.displayType == Constant.PermissionType_READONLY || field.displayType == Constant.PermissionType_DISABLED || field.displayType == Constant.PermissionType_PRINT">
				<template v-if="field.readOnlyShowValOnly">
        <!-- 只读（文本模式） -->
					<!-- <span>{{field.value}}</span> -->
					<div v-for="(items,index) in field.questions" :key="index" class="content">
						<span class="s-title">
							{{items.topic}}
						</span>
						<span class="s-fraction" v-if="items.grade">
							({{items.grade}}分)
						</span>
						<div v-if="field.questions.optionType == 'checkbox'" class="checkbox-wrap">
							<el-checkbox-group 
								v-model="value" @change="changeVal">
								<el-checkbox 
									disabled
									v-for="item in items.options" 
									:key="item.value" 
									:class="vertical"
									:value="item.value"
									:label="item.value"
									>{{item.text}}</el-checkbox>
							</el-checkbox-group>
						</div>
						<div v-else-if="field.questions.optionType == 'radio'" class="radio-wrap">
							<el-radio-group 
								v-for="item in items.options" 
								:key="item.value"
								v-model="items.value" 
								:class="field.layout=='horizontal'?'radio-inline obpm-radio':vertical">
								<el-radio
									disabled
									:label="item.value"
									:isRefreshOnChanged="field.refreshOnChanged">{{item.text}}</el-radio>
								<span class="displayi-b">{{item.text}}</span>
							</el-radio-group>
							<div class="sucess" v-if="items.answer && items.correctAnswer">
								<i class="el-icon-check icon-common"></i>
								答案正确
							</div>
							<div class="error" v-else-if="items.answer && !items.correctAnswer">
								<i class="el-icon-close icon-common"></i>
								正确答案为<span class="s-answer">&nbsp; {{items.showAnwerValue}}</span>
							</div>
						</div>
					</div>
				</template>

				<template v-else>
					<div v-for="(items,index) in field.questions" :key="index" class="content">
						<span class="s-title">
							{{items.topic}}
						</span>
						<span class="s-fraction" v-if="items.grade">
							({{items.grade}}分)
						</span>
						<div v-if="field.questions.optionType == 'checkbox'" class="checkbox-wrap">
							<el-checkbox-group 
								v-model="value">
								<el-checkbox 
									disabled
									v-for="item in items.options" 
									:key="item.value" 
									:text="item.text"
									:class="vertical"
									:value="item.value"
									>{{item.text}}</el-checkbox>
							</el-checkbox-group>
						</div>
						<div v-else-if="field.questions.optionType == 'radio'" class="radio-wrap">
							<el-radio-group 
								v-for="item in items.options" 
								:key="item.value"
								v-model="items.value"
								:class="field.layout=='horizontal'?'radio-inline obpm-radio':vertical">
								<el-radio
									disabled
									:label="item.value"
									:isRefreshOnChanged="field.refreshOnChanged" >{{item.text}}</el-radio>
								<span class="displayi-b">{{item.text}}</span>
							</el-radio-group>
							<div class="sucess" v-if="items.answer && items.correctAnswer">
								<i class="el-icon-check icon-common"></i>
								答案正确
							</div>
							<div class="error" v-else-if="items.answer && !items.correctAnswer">
								<i class="el-icon-close icon-common"></i>
								正确答案为<span class="s-answer">&nbsp; {{items.showAnwerValue}}</span>
							</div>
						</div>
					</div>
				</template>
			</template>

			<template v-else-if="field.displayType == Constant.PermissionType_MODIFY">
				<!--可编辑-->
				<div v-for="(items,index) in field.questions" :key="index" class="content">
					<span class="s-title">
						{{items.topic}}
					</span>
					<span class="s-fraction" v-if="items.grade">
						({{items.grade}}分)
					</span>
					<div v-if="field.questions.optionType == 'checkbox'" class="checkbox-wrap">
						<el-checkbox-group 
							v-model="value" 
							@change="changeVal($event,index)">
							<el-checkbox 
								v-for="item in items.options" 
								:key="item.value" 
								:class="vertical"
								:value="item.value"
								:label="item.value"
								>{{item.text}}</el-checkbox>
						</el-checkbox-group>
					</div>
					<div v-else-if="field.questions.optionType == 'radio'" class="radio-wrap">
							<!-- v-model="field.value"  -->
          	<el-radio-group 
							v-for="item in items.options" 
							:key="item.value"
							v-model="items.value"
							@change="changeVal($event,index)"
							:class="field.layout=='horizontal'?'radio-inline obpm-radio':vertical">
							<el-radio
								:isRefreshOnChanged="field.refreshOnChanged" 
								:label="item.value"
								>{{item.text}}</el-radio>
							<span class="displayi-b">{{item.text}}</span>
						</el-radio-group>	
						<div class="sucess" v-if="items.answer && items.correctAnswer">
							<i class="el-icon-check icon-common"></i>
							答案正确
						</div>
						<div class="error" v-else-if="items.answer && !items.correctAnswer">
							<i class="el-icon-close icon-common"></i>
							正确答案为<span class="s-answer">&nbsp; {{items.showAnwerValue}}</span>
						</div>
					</div>
				</div>
			</template>
		</div>
</template>

<script>
import Constant from "@/Constant.js"
import controlHidden from "@/assets/js/controlHidden.js"
export default {
	name: "o-survey",
	props: ["id"],
  computed: {
    field: function() {
			let formData = this.$parent.findField(this.id);
      if(formData.displayType == 5 || formData.displayType == 3) {
        formData.printHiddenValue = formData.printHiddenValue?formData.printHiddenValue.replace(/&nbsp;/g,""):''
      }

			let transformChar = formData.questions
			if(transformChar) {
				for(let i=0; i<transformChar.length; i++) {
					if(transformChar[i].options) {
						transformChar[i].options.forEach(item => {
							if(item.type == "radio") {
								transformChar.optionType = "radio"
							}else if(item.type == "checkbox") {
								transformChar.optionType = "checkbox"
								if(!formData.value) {
									formData.value = []
								}
							}
						});
					}
					transformChar[i].topic = transformChar[i].topic.replace(/&ldquo;/g, '"').replace(/&rdquo;/g,'"')
				}
			}
			return this.setFormData(formData);
		},
		// value: {
    //   get: function() {
    //     return this.field.value.split(";");
    //   },
    //   set: function(newValue) {
		// 		let value = newValue.join(";");
    //     this.field.value = value.replace(/^(\s|;)+|(\s|;)+$/g, "");
    //   }
    // }
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

	methods: {
		setFormData(formData) {
			if(formData.questions.optionType == 'checkbox') {
				if(formData.value && typeof formData.value=='string') {
					this.value = JSON.parse(formData.value)
				}	else if(formData.value && formData.value instanceof Array){
					this.value = formData.value
				}	
			}else if(formData.questions.optionType == 'radio'){
				if(formData.value && typeof formData.value=='string') {
					let val = JSON.parse(formData.value)
					let qs = formData.questions

					qs.forEach((item, index) => {
						if(index === 0) {
							item.values = val.slice(index, 4)
						} else {
							let i = index * 4
							item.values = val.slice(i, i + 4)
						}
					});

					qs.forEach(item => {
						if(item.answer) {
							if(item.values.indexOf(item.answer) > -1) {
								item.correctAnswer = true;
							}else {
								item.options.forEach(el => {
									if(item.answer == el.value) {
										item.correctAnswer = false
										item.showAnwerValue = el.text
									}
								})
							}
						}
						item.values.forEach(el => {
							if(el !== "") {
								item.value = el
							}
						})
					});
					// val.forEach(el => {
					// 	for(let z=0; z<formData.questions.length; z++) {
					// 		let qs = formData.questions[z]
					// 		for(let i=0; i<qs.options.length; i++) {
					// 			if(el && qs.options[i].value == el) {
					// 				qs.value = el
					// 				if(formData.questions[z].answer && el == formData.questions[z].answer) {
					// 					formData.questions[z].correctAnswer = true
					// 					formData.questions[z].showAnwerValue = qs.options[i].text
					// 					continue
					// 				}
					// 				// else if(formData.questions[z].answer){
					// 				// 	formData.questions[z].correctAnswer = false
					// 				// 	formData.questions[z].showAnwerValue = qs.options[i].text
					// 				// 	console.log("qs.options-->",qs.options[i])
					// 				// }
					// 			}else if(el && qs.answer && qs.answer == qs.options[i].value){
					// 				formData.questions[z].correctAnswer = false
					// 				formData.questions[z].showAnwerValue = qs.options[i].text
					// 				continue
					// 			}
					// 		}
					// 	}
					// });
					// for(let z=0; z<formData.questions.length; z++) {
					// 	if(formData.questions[z].answer) {
					// 		if(!formData.questions[z].value) {
					// 			let qs = formData.questions[z]
					// 			for(let i=0; i<qs.options.length; i++) {
					// 				if(formData.questions[z].answer) {
					// 					if(formData.questions[z].answer == qs.options[i].value) {
					// 						formData.questions[z].correctAnswer = false
					// 						formData.questions[z].showAnwerValue = qs.options[i].text
					// 						continue
					// 					}
					// 				}
					// 			}
					// 		}
					// 	}
					// }
				}	else if(formData.value && formData.value instanceof Array){
					this.value = formData.value
				}	
			}
			return formData
		}, 

		changeVal(ev){
			let field = this.field
			let allValue = []
			field.questions.forEach((items,i) => {
				let obj = []
				items.options.forEach((item,inx) => {
					obj[inx] = ""
				})
				allValue.push(obj)
			})
			let currentVal = []
			if(field.questions.optionType == 'checkbox') {
				field.value = ev
				for(let z=0; z<field.questions.length; z++) {
					let qs = field.questions[z]
					for(let i=0; i<qs.options.length; i++) {
						for(let j=0; j<ev.length; j++) {
							if(qs.options[i].value == ev[j]) {
								allValue[z][i] = qs.options[i].value
							}
						}
					}
				}
				allValue.forEach(el => {
					currentVal = currentVal.concat(el)
				});
				field.value = currentVal;
			}else if(field.questions.optionType == 'radio'){
				for(let z=0; z<field.questions.length; z++) {
					let qs = field.questions[z]
					for(let i=0; i<qs.options.length; i++) {
						if(qs.value && qs.value == qs.options[i].value) {
							allValue[z][i] = qs.options[i].value
						}
					}
				}
				allValue.forEach(el => {
					currentVal = currentVal.concat(el)
				});
				field.value = currentVal
			}
		},
	},

	data: function() {
		return {
			Constant,
			vertical:'input-vertical',
			value: [],
		}
	},
}
</script>

<style lang="scss" scoped>
	
</style>
