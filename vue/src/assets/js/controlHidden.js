export default function({id, field, formShowType}) {
  let dom = '';
  let isHidden = field.displayType == 3 ? true : false;
  if(formShowType && formShowType == 'old') { //旧表单
    switch(field.hideType) {
      case "parent":
        dom = document.getElementById(id).parentNode
        dom.style.display = isHidden ? "none" : "";
        break;
      case "tableRow":
        if(document.getElementById(id).className && document.getElementById(id).className == 'qrcode') {
          dom = document.getElementById(id).parentNode.parentNode.parentNode //二维码比其他控件多一级才到tr
        }else {
          dom = document.getElementById(id).parentNode.parentNode
        }
        dom.style.display = isHidden ? "none" : "";
        break;
      case "table":
        dom = document.getElementById(id).parentNode.parentNode.parentNode.parentNode
        dom.style.display = isHidden ? "none" : "";
        break;
      default:
        break
    }
  }else {
    let scope = ''
    switch(field.hideType) {
      case "parent":
        dom = document.getElementById(id).parentNode
        dom.style.display = isHidden ? "none" : "";
        break;
      case "tableRow": //可能container会一层套一层，先判断只有一层的
        dom = document.getElementById(id).parentNode.parentNode
        scope = dom.attributes["scope"].value
        if(scope == 'container') {
          dom.style.display = isHidden ? "none" : "";
        }else {
          dom = document.getElementById(id).parentNode
          dom.style.display = isHidden ? "none" : "";
        }
        // dom = document.getElementById(id).parentNode
        // dom.style.display = isHidden ? "none" : "";
        break;
      case "table": //可能container会一层套一层，先判断只有一层的
        dom = document.getElementById(id).parentNode.parentNode //.parentNode
        scope = dom.attributes["scope"].value
        if(scope == 'container') {
          document.getElementById(id).parentNode.parentNode.parentNode
          dom.style.display = isHidden ? "none" : "";
        }else {
          dom.style.display = isHidden ? "none" : "";
        }
        // dom.style.display = isHidden ? "none" : "";
        break;
      default:
        break
    }
  }
}