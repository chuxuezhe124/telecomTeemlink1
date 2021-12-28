import QRCode from 'qrcodejs2';
import store from '../../store';
export default function(field, id, qrcodeViewSize, path) {
  let text = '';
  let host = window.location.protocol + "//" + window.location.host;
  let domainId =store.state.domainId;
  let uuid = "";
  let len = 16;
  let chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  let maxPos = chars.length;
  for (let i = 0; i < len; i++) {
    uuid += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  let randomCode = uuid;
  switch (field.handleType) {
    case "text": {//显示值
      text = field.value || ' '
      if(text.indexOf("?") > -1) {
        let v = text.split("?")
        text = v[0] + "?"+ v[1] //encodeURIComponent(v[1])
      }
      // text = encodeURI(text)
      break;
    }
    case "link"://打开链接
    case "callback_event": {//执行扫码事件回调脚本
      let formId = field.formId,
          docId = field.docId,
          fieldId = field.divId,
          applicationId = field.appId;
      text = host + path + "/portal/document/qrcodefield/ready?domainId=" + domainId + 
        "&formId=" + formId + 
        "&docId=" + docId + 
        "&fieldId=" + fieldId + 
        "&applicationId=" + applicationId + 
        "&_randomCode=" + randomCode;
        console.log("text-->",text)
      break;
    }
    default:
      break;
  } 
  let width ,
    height;
  if(field.displayType == 3){
    width = 0;
    height = 0;
  }else {
    width = field.size,
    height = field.size;
  }
  let qrcode = new QRCode(id, {
    width: qrcodeViewSize ? qrcodeViewSize : width,  
    height: qrcodeViewSize ? qrcodeViewSize : height,
    correctLevel: 3,
    text: text, // 二维码地址
  })
}