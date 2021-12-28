const getDateTime = {
  calculateTime: (_time) => {
    let _timeAgo;
    let flowTime = new Date(_time);
    let timeFixArr = _time.split(/[- :]/);
    let timeFixDate = new Date(timeFixArr[0], timeFixArr[1] - 1, timeFixArr[2], timeFixArr[3], timeFixArr[4]);
    let Month = timeFixDate.getMonth() + 1;
    let Day = timeFixDate.getDate();
    let Hour = timeFixDate.getHours();
    let Minute = timeFixDate.getMinutes();
    let _date = _time.substr(0, _time.indexOf(" "));
    if (getDateTime.numOfDayCalc(_date) > 2) {
      if (Month >= 10) {
        _timeAgo = Month + "-";
      } else {
        _timeAgo = "0" + Month + "-";
      }
      if (Day >= 10) {
        _timeAgo += Day + " ";
      } else {
        _timeAgo += "0" + Day;
      }
    } else if (getDateTime.numOfDayCalc(_date) == 2) {
      _timeAgo = "前天 ";
      if (Hour >= 10) {
        _timeAgo += Hour + ":";
      } else {
        _timeAgo += "0" + Hour + ":";
      }
      if (Minute >= 10) {
        _timeAgo += Minute;
      } else {
        _timeAgo += "0" + Minute;
      }
    } else if (getDateTime.numOfDayCalc(_date) == 1) {
      _timeAgo = "昨天 ";
      if (Hour >= 10) {
        _timeAgo += Hour + ":";
      } else {
        _timeAgo += "0" + Hour + ":";
      }
      if (Minute >= 10) {
        _timeAgo += Minute;
      } else {
        _timeAgo += "0" + Minute;
      }
    } else if (getDateTime.numOfDayCalc(_date) == 0 && getDateTime.daysCalc(_time).hours > 0) {
      _timeAgo = getDateTime.daysCalc(_time).hours + " 小时前 ";
    } else if (getDateTime.numOfDayCalc(_date) == 0 && getDateTime.daysCalc(_time).hours <= 0 && getDateTime.daysCalc(_time).minutes > 5) {
      _timeAgo = getDateTime.daysCalc(_time).minutes + " 分钟前 ";
    } else {
      _timeAgo = "刚刚";
    }
    return _timeAgo;
    //return getDateTime.test2();
  },
  numOfDayCalc: (date, date2) => {
    let startDateArr = date.split(/[- :]/);
    let startDate = new Date(startDateArr[0], startDateArr[1] - 1, startDateArr[2]);
    let years,
        month,
        nowDate;
    if (!date2 || date2 == "") {
        years = new Date().getFullYear();
        month = new Date().getMonth();
        let date = new Date().getDate();
        nowDate = new Date(years, month, date);
    } else {
        nowDate = new Date(date2);
    }
    let msDate = nowDate.getTime() - startDate.getTime();
    //计算出相差天数
    let numOfDay = Math.floor(msDate / (24 * 3600 * 1000));

    return numOfDay;
  },

  daysCalc: (date, date2) => {
    let startDateArr = date.split(/[- :]/);
    let startDate = new Date(startDateArr[0], startDateArr[1] - 1, startDateArr[2], startDateArr[3], startDateArr[4], (startDateArr[5] != undefined && startDateArr[5] != "" ? startDateArr[5] : 0));
    let nowDate;
    if (!date2 || date2 == "") {
      nowDate = new Date();
    } else {
      nowDate = new Date(date2);
    }
    let msDate = nowDate.getTime() - startDate.getTime();
    //计算出相差天数
    let days = Math.floor(msDate / (24 * 3600 * 1000));
    //计算出小时数
    let leave1 = msDate % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
    let hours = Math.floor(leave1 / (3600 * 1000));
    //计算相差分钟数
    let leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
    let minutes = Math.floor(leave2 / (60 * 1000));
    //计算相差秒数
    let leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数
    let seconds = Math.round(leave3 / 1000);
    //alert(" 相差 "+days+"天 "+hours+"小时 "+minutes+" 分钟"+seconds+" 秒");
    let timeCalc = {
        "days": days,
        "hours": hours,
        "minutes": minutes,
        "seconds": seconds
    };
    return timeCalc;
  }
};


export default getDateTime;
