
//收藏文件
function handleFileCollect(params) {
	var url = "../../disks/"+params.diskId+"/files/"+params.fileId+"/collect"

	toastr.options = {
		"closeButton": false,
		"debug": false,
		"positionClass": "toast-top-right",
		"onclick": null,
		"showDuration": "300",
		"hideDuration": "1000",
		"timeOut": "1000",
		"extendedTimeOut": "1000",
		"showEasing": "swing",
		"hideEasing": "linear",
		"showMethod": "fadeIn",
		"hideMethod": "fadeOut"
	}

	$.ajax({
			url: url,
			async: false,
			cache:false,
			success: function(result){
				toastr.success("收藏成功！");
			},
			error: function(result) { 
				toastr.info("文件已经收藏，收藏失败！");
			} 
		})

}


//分享文件到团队
// function handleShareFile(apiParams) {
//     var url = "../../disks/"+apiParams.diskId+"/files/"+apiParams.fileId+"/share";
// }

//下载文件
// function handleSingleFileDownload(apiParams) {
//     var downLoad_url = "../../download/"+apiParams.fileId;
//     window.open(downLoad_url);
// }

/**下载单个文件
 * apiParams={
 *      "fileId":"",
 *      "folder":false/true
 * }
 * @param {Object} apiParams
 */
function handleSingleFileDownload(apiParams){
    let downloadAble_url ="";

    const options = {
        method: 'GET',
        credentials: 'include',
        headers : { 'Accept': 'application/json', 'Content-Type': 'application/json'}
    }


    downloadAble_url = "../../downloadAble?folderIds=&fileIds="+apiParams.fileId;;
	$.ajax({
		url: downloadAble_url,
		async: false,
		cache:false,
		success: function(result){
			var downLoad_url = "../../download/"+apiParams.fileId;
    		window.open(downLoad_url);
		},
		error: function(result) { 
			var data = JSON.parse(result.responseText);
			toastr.info(data.errmsg);
		} 
	})
    
}