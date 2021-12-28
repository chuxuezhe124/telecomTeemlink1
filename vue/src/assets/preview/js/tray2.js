//此托盘给km的新建文件用
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
	
	
	function setServerHost(){
		$.ajax({
			async:false,
			url: trayHost+'/setServerHost?host='+serverHost,
			dataType: 'jsonp',
		   	jsonp: 'jsonpCallback',
			success:function(result){
				if(result.state == 1){
					if(action == "edit"){
						$(".activity-edit").show();
					}
				}
			},
			error:function (XMLHttpRequest, textStatus, errorThrown) {
			}
		});
	}
		
	if(action == "edit"){
		$(".activity-edit").show().on("click",function(e){
			if(!isTrayReady){
			
				if(window.confirm('托盘程序未找到","需要下载托盘程序并安装,点击\"确定\"按钮下载')){
					//下载托盘程序
					url = encodeURI(contextPath + "/uploads/myapps_tray.exe");
					var _tmpwin = window.open(url,"_blank");
					_tmpwin.location.href = url;
				}else{
					return;
				}
			}
			
	    	$.ajax({
				async:false,
				url:trayHost+'/download?path='+path+'&name='+name,
				dataType: 'jsonp',
				jsonp: 'jsonpCallback',
				success:function(result){
					if(result.state == 1){
						console.log(result.state);
					}
				},
				error:function (XMLHttpRequest, textStatus, errorThrown) {
				}
			});
		});
	}
	
	
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
});