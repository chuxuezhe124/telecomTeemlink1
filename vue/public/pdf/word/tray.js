$(document).ready(function(){
	var progressId;
	
	var isTrayReady = false;
	var trayProgress;
	var wordFieldChecker;

	
	
	$.ajax({
		url: trayHost+'/ping',
		dataType: 'jsonp',
		timeout: 2000,
	   	jsonp: 'jsonpCallback',
		success:function(result){
			if(result.state == 1){
				isTrayReady = true;
				setServerHost();
			}
		},
		error:function (XMLHttpRequest, textStatus, errorThrown) {
			//测试网络连通性
			trayProgress = window.setInterval(function(){
				$.ajax({
					url: trayHost+'/ping',
					dataType: 'jsonp',
					timeout: 2000,
				   	jsonp: 'jsonpCallback',
					success:function(result){
						if(result.state == 1){
							window.clearInterval(trayProgress);
							isTrayReady = true;
							setServerHost();
						}
					},
					error:function (XMLHttpRequest, textStatus, errorThrown) {
					}
				});
			}, 4*1000);
		}
	});
	
	function intoTemp(){
		let isTrunk = sessionStorage.getItem("isTrunk");
		let cp = '';
		if(isTrunk == 'true') { //5.0
			cp = kmsContextPath
		}else {
			cp = contextPath
		}
		$.ajax({
			type : 'get',
			async : false,
			url : cp +'/office/service/getTempFile',
			dataType : 'json',
			success : function(result) {
				if(result && result.errcode == 0){
					var data=result.data;
					for(var i=0;i<data.length;i++){
						var fileMap = data[i];
						var html = '<option value="'+fileMap.filePath+'" >'+fileMap.name+'</option>'
						$("#template").find("option:last").after(html);
					}
				}
			}
		});
	}
	
	
	function setServerHost(){
		var serverHost = location.protocol + '//' + location.host + contextPath;
		$.ajax({
			async:false,
			url: trayHost+'/setServerHost?host='+serverHost,
			dataType: 'jsonp',
		   	jsonp: 'jsonpCallback',
			success:function(result){
				if(result.state == 1){
					if(action == "edit"){
						$(".activity-edit").show();
						var fileType = name.substr(name.lastIndexOf(".")).toLowerCase();
						if(selectEditPlug == "tray" && (fileType == ".doc" || fileType == ".docx")){
							intoTemp();
							$(".activity-cover").show();
						}
					}
				}
			},
			error:function (XMLHttpRequest, textStatus, errorThrown) {
			}
		});
	}
	
	function startTrayProgress(){
		progressId = window.setInterval(function(){
			$.ajax({
				async:false,
				url: trayHost+'/progress?name='+name,
				dataType: 'jsonp',
			   	jsonp: 'jsonpCallback',
			   	timeout: 2000,
				success:function(result){
					if(result.state == 1){
						var state = result.data;
						console.log('state-->'+state);
						$(".activity-edit").hide();
						switch (state) {
						case 0://下载中
							$("#progress").text("文档传输中...");
							break;
						case 11://准备上传
							$("#progress").text("文档编辑中...");
							break;
						case 12://上传中
							$("#progress").text("文档暂存中...");
							break;
						case 13://上传完成
							$("#progress").text("文档已暂存!");
							
							break;
						case 21://准备删除本地文件
							$("#progress").text("文档同步准备就绪...");
							break;
						case 22://本地文件删除中
							$("#progress").text("文档同步中（如果您想结束编辑，请关闭本地打开文档程序！）");
							break;
						case 23://本地文件删除完成
						debugger
							$("#progress").text("文档已更新！");
							var $container = $(".preview-body-container");
							$container.find("iframe").attr("src",previewUrl);
							$(".activity-edit").show();
							window.clearInterval(progressId);
							if(wordFieldChecker != null ){
								wordFieldChecker.doExixtWordField();
								wordFieldChecker = null;
							}
							
							break;
						default:
							$("#progress").text("");
							break;
						}
					}
				},
				error:function (XMLHttpRequest, textStatus, errorThrown) {
				    $(".activity-edit").hide();
				    this; // 调用本次AJAX请求时传递的options参数
				}
			});
		}, 2*1000);
	}
	
	if(action == "edit"){
		$(".activity-edit").show().on("click",function(e){
			if(selectEditPlug=="jinshan") {
				let origin = window.location.origin
				let obpmContextPath = sessionStorage.getItem("obpmContextPath")
				let fileName = origin + obpmContextPath + path
				let accessToken = localStorage.getItem("accessToken")
				let arr = path.split("/")
				let fName = arr[arr.length -1]
				var params = {
					'userId' : curEditUserId,
					'wordid' : fName
				}

				var isTrunk = sessionStorage.getItem("isTrunk");
				let cp = '';
				if(isTrunk == 'true') { //5.0
					cp = kmsContextPath;
				}else {
					cp = contextPath;
				}
				$.ajax({
					async:false,
					url : cp + '/portal/dynaform/document/checkWordFieldIsEdit',
					data : params,
					dataType : "json",
					success : function(result){
						if(result.state === false){
							alert("抱歉，其他用户正在编辑编该文档，请稍后...")
							return;
						} else {
							let urlPath = origin + "/static/portal/vue/wps/index.html#/?fileName=" + fileName + "&userName=" + userName + "&path=" + path + "&userId=" + curEditUserId + "&wordid=" + fName + "&accessToken=" + accessToken
							window.open(urlPath)

							let timer = setInterval(() => {
								$.ajax({
									async:false,
									url : window.location.origin + '/kms/api/portal/dynaform/document/wordFieldEditStatus',
									data : params,
									dataType : "json",
									complete : function(result){
										if(result.responseJSON.state === true) {
											clearInterval(timer)//清空定时器
											var $container = $(".preview-body-container");
											$container.find("iframe").attr("src",previewUrl);
										}
									}
								});
						}, 3000)
						}
					}
				});
			}else if(selectEditPlug=="jinge"){
				wordFieldChecker = new WordFieldChecker(curEditUserId,name)
				if(!wordFieldChecker.checkWordFieldIsEdit()){
					return;
				}
				var url = "webofficeWord.html?path="+path+"&name="+name;

				if(parent.PETE_temp_url){
					url = url + "&" + parent.PETE_temp_url;
				}
				url=url+"&username="+encodeURI(userName);
				//自身浏览器打开
				var mhtmlHeight = window.screen.availHeight; //获得窗口的垂直位置;
				var mhtmlWidth = window.screen.availWidth; //获得窗口的水平位置; 
				var iTop = 0; //获得窗口的垂直位置;
				var iLeft = 0; //获得窗口的水平位置;
				window.open(url);
				//利用定时器进行刷新
				document.title = '在线编辑中...';
				localStorage.removeItem("checkIsEdit");
				var timeIn = setInterval(function(){
					var checkIsEdit = localStorage.checkIsEdit;
					if(checkIsEdit){
						$.ajax({
							async:false,
							url: obpmContextPath+'/uploads/convert/'+name.replace(fileType, ".task"),
							error:function(result){
								if(result.status == 404){
									$("#progress").text("文档更新中...");
									var $container = $(".preview-body-container");
									$(".activity-edit").show();
									clearInterval(timeIn)//清空定时器
									if(wordFieldChecker != null ){
										wordFieldChecker.doExixtWordField();
										wordFieldChecker = null;
									}
									localStorage.removeItem("checkIsEdit");
									debugger
									setTimeout(function() {
										$("#progress").text("文档已更新！");
										document.title = showName;
										debugger
										$container.find("iframe").attr("src",previewUrl);
									},2000);
								}
							}
						})
					}
				}, 2000);
				//暂时利用页签切换刷新预览（84版本谷歌去掉了visibilitychange监控）
				//document.addEventListener('visibilitychange', visibilitychange,false);
				//function visibilitychange() {
				//    if (document.hidden) {
				//        document.title = '在线编辑中...';
				//    } else {
				//		$("#progress").text("文档更新中...");
				//		var $container = $(".preview-body-container");
				//		$(".activity-edit").show();
				//		window.clearInterval(progressId);
				//		if(wordFieldChecker != null ){
				//			wordFieldChecker.doExixtWordField();
				//			wordFieldChecker = null;
				//		}
				//        setTimeout(function() {
				//			$("#progress").text("文档已更新！");
				//			$container.find("iframe").attr("src",previewUrl);
				//			document.removeEventListener('visibilitychange',visibilitychange,false);
				//        },2000);
				//    }
				//}
			}else{
				debugger
				if(!isTrayReady){
					var result = confirm("托盘程序未找到,需要下载托盘程序并安装,点击\"确定\"按钮下载");
					if(result){
						url = encodeURI(obpmContextPath + "/uploads/myapps_tray.exe");
						var _tmpwin = window.open(url,"_blank");
						_tmpwin.location.href = url;
					}
					return;
				}
				
				wordFieldChecker = new WordFieldChecker(curEditUserId,name)
				if(!wordFieldChecker.checkWordFieldIsEdit()){
					return;
				}
				$.ajax({
					async:false,
					url:trayHost+'/download?path='+path.slice(0,path.lastIndexOf("/"))+'&name='+name+'&userName='+userName+'&showTrackRevisions='+showTrackRevisions,
					dataType: 'jsonp',
					jsonp: 'jsonpCallback',
					success:function(result){
						if(result.state == 1){
							if(!result.data){
								startTrayProgress();
							}else{
								OBPM.message.showWarning("抱歉，本地文档正在与服务器同步中，请稍后片刻再进行编辑操作！");
							}
						}
					},
					error:function (XMLHttpRequest, textStatus, errorThrown) {
					}
				});
			}
			
		});
	}
	
	$(".activity-download").on("click",function(e){
		var url ;
		if(selectEditPlug=="jinge"){
			var showfilename;
		if(showfilename!=undefined){
			if(parent.$('textarea[name="postingTitle"]').text()=="" && parent.$('input[name="serialNumber"]').val()==""){
				showfilename = "正文.doc";
				showName=showfilename;
			}else{
				showfilename = parent.$('textarea[name="postingTitle"]').text()+parent.$('input[name="serialNumber"]').val()+".doc";
				showName=showfilename;
			}
		}
		
		}
		if(isWaterMarkFile(waterMarkSetting,showName)){
			var isTrunk = sessionStorage.getItem("isTrunk");
			let path = ''
			if(isTrunk == 'true') { //5.0
				path = kmsContextPath;
			}else {
				path = contextPath;
			}
			url = encodeURI(path + "/portal/dynaform/document/fileDownloadWithWaterMark?filename="+ showName + "&filepath=" + fullPath + "&waterMarkSetting="+waterMarkSetting);
		}else{
			url = encodeURI(contextPath + "/runtime/file/download?filename="+ ((fieldItemValue=="undefined" || fieldItemValue==undefined)?showName:fieldItemValue) + fileType +"&filepath=" + fullPath);
		}
		window.open(url);
	});
	
	/**
	 * 是否能够获取水印文件
	 */
	function isWaterMarkFile(waterMarkSetting,filename){
		if(openWaterMark == true && waterMarkSetting != null && waterMarkSetting != undefined && waterMarkSetting != "" && waterMarkSetting != "null"){
			var setting  = eval ("(" + waterMarkSetting + ")");
			if(setting.type != null && setting.type.indexOf("download")>-1){
				var fileType = filename.substring(filename.lastIndexOf(".")+1);
				if ("doc"== fileType || "docx"== fileType
						|| "xls"== fileType || "xlsx"== fileType
						|| "pdf"== fileType || "txt"== fileType
						|| "rtf"== fileType || "et"== fileType
						|| "ppt"== fileType || "pptx"== fileType
						|| "dps"== fileType || "pot"== fileType
						|| "pps"== fileType || "wps"== fileType
						|| "html"== fileType || "htm"== fileType) {
					return true;
				}
			}
		}
		return false ;
	}
	
	
	/**
	 * work控件检查器：(乐观锁)
	 */
	function WordFieldChecker(curEditUserId,name){
		
		this.curEditUserId = curEditUserId ;
		this.name = name ;
		
		this._wordFieldIsUpdateTimer;    //检查work控件是否已更新定时器
		this._checkWordFieldIsEditTimer; //检查work控件是否在编辑定时器
		
		function checkIsEdit (){
			var params = {
					'userId' : this.curEditUserId,
					'wordid' : this.name
			};
			var _result ;
			var isTrunk = sessionStorage.getItem("isTrunk");
			let cp = '';
			if(isTrunk == 'true') { //5.0
				cp = kmsContextPath;
			}else {
				cp = contextPath;
			}
			$.ajax({
				async:false,
				url : cp + '/portal/dynaform/document/checkWordFieldIsEdit',
				data : params,
				dataType : "json",
				success : function(result){
					_result = result;
				}
			});
			return _result;
		}
		
		/**
		 * 从wordFieldIsEdit中去除wordid
		 */
		WordFieldChecker.prototype.doExixtWordField = function(){
			var workChecker = this;
			var params = {
					'userId' : this.curEditUserId,
					'wordid' : this.name
			};
			var isTrunk = sessionStorage.getItem("isTrunk");
			let cp = '';
			if(isTrunk == 'true') { //5.0
				cp = kmsContextPath;
			}else {
				cp = contextPath;
			}
			// kms/
			$.ajax({
				async:false,
				url : cp + '/portal/dynaform/document/doExixtWordField',
				data : params,
				dataType : "json",
				complete : function(){
					debugger
					clearWordFieldTimer(workChecker) //清空定时器
				}
			});
			
		}
		
		/**
		 * 清空WordFieldTimer定时器
		 */
		function clearWordFieldTimer(WordFieldChecker){
			if(WordFieldChecker._wordFieldIsUpdateTimer != null){
				window.clearInterval(WordFieldChecker._wordFieldIsUpdateTimer);
				WordFieldChecker._wordFieldIsUpdateTimer = null ;
			}
			if(WordFieldChecker._checkWordFieldIsEditTimer != null ){
				window.clearInterval(WordFieldChecker._checkWordFieldIsEditTimer);
				WordFieldChecker._checkWordFieldIsEditTimer = null ;
			}
		}
		
		if(typeof WordFieldChecker._initialized == "undefined"){
			/**
			 * 检查word文档是否可编辑(Ajax)
			 * 功能点：① _result 返回文档是否可编辑
			 *       ② 定时器，定时更新wordFieldIsEdit容器中时间状态
			 */
			WordFieldChecker.prototype.checkWordFieldIsEdit = function(){
				var _result  = checkIsEdit();
				if(_result==undefined || (_result.state == true && this._checkWordFieldIsEditTimer == null) ){ //可编辑，则定时更新wordFieldIsEdit容器中时间状态
					this._checkWordFieldIsEditTimer =  window.setInterval(function(){
						checkIsEdit();
					}
				, 1*10000);
				}else{
					var message = _result.message + "正在编辑文档，请稍后";
			    	OBPM.message.showConfirm(message,"点击\"确定\"按钮以等待更新文档",function(result){
						if(result){//确认框--确认执行
							wordFieldIsUpdateTimer()
						}
					});
				}
				return _result.state ;
			}
			
			/**
			 * 检查word文档是否被他人编辑完成
			 */
			function wordFieldIsUpdateTimer (){
				if(this._wordFieldIsUpdateTimer == null){
					this._wordFieldIsUpdateTimer = window.setInterval(function(){
						var _result  = checkIsEdit();
						if(_result.state == true){
							var wordChecker = this;
							debugger
							/*更新时因为没有清空容器里等待者的数据*/
							clearWordFieldTimer(wordChecker)//清空定时器
							$("#progress").text("文档已更新...");
							var $container = $(".preview-body-container");
							$container.find("iframe").attr("src",previewUrl);
						}else{
							var message = _result.message + "正在编辑文档...";
							$("#progress").text(message);
						}
					}, 2*1000);
				}
			}
		}
		WordFieldChecker._initialized = true ;
	}
});