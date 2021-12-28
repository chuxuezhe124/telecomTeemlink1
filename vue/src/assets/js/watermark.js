let watermark = {}

let setWatermark = (str, currentId) => {
  
  //let id = '1.23452384164.123412416';
  let id = currentId + '_0';//Date.parse(new Date());

  if (document.getElementById(id) !== null) {
    let box = document.getElementById(id);
    box.remove();
    // document.body.removeChild(document.getElementById(id));
  }

  //创建一个画布
  let can = document.createElement('canvas');
  //设置画布的长宽
  can.width = 200;
  can.height = 120;

  // can.width = 225;
  // can.height = 225;

  let cans = can.getContext('2d');
  //旋转角度
  cans.rotate(-15 * Math.PI / 180);
  cans.font = '16px Vedana';
  //设置填充绘画的颜色、渐变或者模式
  cans.fillStyle = 'rgba(200, 200, 200, 0.40)';
  //设置文本内容的当前对齐方式
  cans.textAlign = 'left';
  //设置在绘制文本时使用的当前文本基线
  cans.textBaseline = 'Middle';
  //在画布上绘制填色的文本（输出的文本，开始绘制文本的X坐标位置，开始绘制文本的Y坐标位置）
  cans.fillText(str, can.width / 8, can.height / 2);

  let div = document.createElement('div');
  div.id = id;
  div.style.pointerEvents = 'none';


  // div.style.bottom = '0px'; //2021/1/7,不能铺满有滚动条的范围
  div.style.top = '0px';
  div.style.right = '30px';
  //div.style.position = 'fixed';
  div.style.position = 'absolute';
  div.style.zIndex = '10';

  // this.formScrollHeight = document.getElementById(id).scrollHeight
  div.style.width = document.getElementById(currentId).clientWidth + 'px';
  div.style.height = document.getElementById(currentId).scrollHeight + 'px';  //document.getElementById(currentId).clientHeight + 'px';
  div.style.background = 'url(' + can.toDataURL('image/png') + ') left top repeat';
  document.getElementById(currentId).appendChild(div);
  //document.body.appendChild(div);
  return id;
}

// 该方法只允许调用一次
watermark.set = (str, currentId) => {
  let id = setWatermark(str,currentId);
  // setInterval(() => {
  //   if (document.getElementById(id) === null) {
  //     id = setWatermark(str,currentId);
  //   }
  // }, 500);
  window.onresize = () => {
    setWatermark(str, currentId);
  };
}

export default watermark;
