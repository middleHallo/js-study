/**
 * 微信开放数据域
 * 使用 Canvas2DAPI 在 SharedCanvas 渲染一个排行榜，
 * 并在主域中渲染此 SharedCanvas
 */
/**
 * 资源加载组，将所需资源地址以及引用名进行注册
 * 之后可通过assets.引用名方式进行获取
 */
const assetsUrl = {
  icon: "openDataContext/assets/icon.png",
  box: "resource/assets/rankItenRender.png",
  panel: "resource/assets/rankBack.png",
  left: "resource/assets/left.png",
  right: "resource/assets/right.png",
  title: "openDataContext/assets/rankingtitle.png"
};

/**
 * 资源加载组，将所需资源地址以及引用名进行注册
 * 之后可通过assets.引用名方式进行获取
 */
let assets = {};
/**
 * canvas 大小
 * 这里暂时写死
 * 需要从主域传入
 */
let canvasWidth;
let canvasHeight;



//获取canvas渲染上下文
const context = sharedCanvas.getContext("2d");
context.globalCompositeOperation = "source-over";


/**
 * 所有头像数据
 * 包括姓名，头像图片，得分
 * 排位序号i会根据parge*perPageNum+i+1进行计算
 */
let totalGroup = [];
wx.getFriendCloudStorage({
  keyList:['dogName','level','coin_num','coin_str'],
  success:function(res){
    totalGroup = res.data;
    sortTotalGroup();
  }
})

function sortTotalGroup(){
  totalGroup.sort(function(elment1, elment2){
    let kvdata1 = elment1.KVDataList;
    let kvdata2 = elment2.KVDataList;
    let kvdata1Level = Number(kvdata1[1].value);
    let kvdata2Level = Number(kvdata2[1].value)
    
    if (kvdata1Level > kvdata2Level) {
      return -1;
    } else if (kvdata1Level < kvdata2Level) {
      return 1;
    } else {
      var coin_num1 = kvdata1[2].value + "";
      var coin_num2 = kvdata2[2].value + "";
      if (coin_num1.length > 16 || coin_num2.length > 16) {
        return 0;
      }
      if (coin_num1.length > coin_num2.length) {
        return -1;
      } else if (coin_num1.length < coin_num2.length) {
        return 1;
      } else {
        return (Number(coin_num1) > Number(coin_num2)) ? -1 : 1;
      }
    }
  })
}

/**
 * 创建排行榜
 */
function drawRankPanel() {
  //绘制背景
  context_drawImage(assets.panel, offsetX_rankToBorder, offsetY_rankToBorder, rankWidth, rankHeight);
  //绘制标题
  const title = assets.title;
  //根据title的宽高计算一下位置;
  const titleX = offsetX_rankToBorder + (rankWidth - title.width) / 2;
  const titleY = offsetY_rankToBorder;
  context_drawImage(title, titleX, titleY);
  //获取当前要渲染的数据组

  //起始id
  const startID = perPageMaxNum * page;
  currentGroup = totalGroup.slice(startID, startID + perPageMaxNum);
  //创建头像Bar
  drawRankByGroup(currentGroup);
  if(totalGroup.length > 7){
    //创建按钮
    drawButton()
  }
}
/**
 * 根据屏幕大小初始化所有绘制数据
 */
function init() {
  basicOffX = stageWidth / 1080;
  basicOffY = stageHeight / 1920;
  //排行榜绘制数据初始化,可以在此处进行修改
  rankWidth = stageWidth - basicOffX*160;
  rankHeight = stageHeight - basicOffY*460;
  barWidth = basicOffX*816;
  barHeight = basicOffY*150;
  offsetX_rankToBorder = (stageWidth - rankWidth) / 2;
  offsetY_rankToBorder = (stageHeight - rankHeight) / 2;
  preOffsetY = (rankHeight - barHeight) / (perPageMaxNum + 1);
  fontSize = Math.floor(stageWidth / 25);
  startX = offsetX_rankToBorder + (rankWidth - barWidth) / 2;
  startY = offsetY_rankToBorder + preOffsetY;
  avatarSize = barHeight;
  intervalX = barWidth / 20;
  textOffsetY = (barHeight + fontSize) / 2;
  textMaxSize = barWidth / 3;
  indexWidth = context.measureText("99").width;

  //按钮绘制数据初始化
  buttonWidth = 70;
  buttonHeight = 70;
  buttonOffset = rankWidth / 3;
  lastButtonX = stageWidth/2 - 100;
  nextButtonX = stageWidth/2 + 30;
  nextButtonY = lastButtonY = offsetY_rankToBorder + rankHeight - 30 - buttonHeight;
  let data = wx.getSystemInfoSync();
  canvasWidth = data.windowWidth;
  canvasHeight = data.windowHeight;
}

/**
 * 创建两个点击按钮
 */
function drawButton() {
  
  context_drawImage(assets.left, lastButtonX, lastButtonY, buttonWidth, buttonHeight);
  context_drawImage(assets.right, nextButtonX, nextButtonY, buttonWidth, buttonHeight);
}


/**
 * 根据当前绘制组绘制排行榜
 */
function drawRankByGroup(currentGroup) {
  for (let i = 0; i < currentGroup.length; i++) {
    const data = currentGroup[i];
    drawByData(data, i);
  }
}

/**
 * 根据绘制信息以及当前i绘制元素
 */
function drawByData(data, i) {
  let x = startX;
  //绘制底框
  let itemY = startY + i * preOffsetY;
  context_drawImage(assets.box,startX,itemY,barWidth,barHeight);
  x += 20;
  //设置字体
  context.font = 40 + "px Arial";
  //绘制序号
  if(i === 0){
    context.fillStyle = "#f8c500";
  }else if(i === 1){
    context.fillStyle = "#9fc6f2";
  }else if(i === 2){
    context.fillStyle = "#f4b282";
  }else{
    context.fillStyle = "#c55e00";
  }
  let no = page * 7 + i + 1 + "";
  context.fillText(no, x, startY + i * preOffsetY + textOffsetY, textMaxSize);
  x += indexWidth + intervalX;

  let avatar = wx.createImage();
  avatar.onload = function(){
    let avatarX = x;
    let avatarY = startY + i * preOffsetY + (barHeight - avatarSize) / 2 + 10 ;
    let myAvatarSize = avatarSize - 20;
     //绘制头像
    context_drawImage(avatar,avatarX,avatarY,myAvatarSize,myAvatarSize);
    x += avatarSize + intervalX + 20;

    //绘制昵称
    context.font = 30 + "px Arial";
    context.fillStyle = '#888888';
    let nicknameY = itemY + 35;
    context.fillText(data.nickname, x, nicknameY,textMaxSize);
    
    //绘制昵称
    context.font = 26 + "px Arial";
    context.fillStyle = '#c55e00';
    //绘制狗狗名称
    let dogName = data.KVDataList[0].value;
    let dogNameY = itemY + 75;
    context.fillText(dogName,x,dogNameY,textMaxSize);

    x += textMaxSize + intervalX;

    context.font = 26 + "px Arial";
    context.fillStyle = '#c55e00';
    let coin_strY = itemY + 60;
    let coin_str = data.KVDataList[3].value;
    context.fillText(coin_str,x,coin_strY, textMaxSize);

    let avatarMask = wx.createImage();
    avatarMask.onload = function(){
      context_drawImage(avatarMask, avatarX, avatarY, myAvatarSize, myAvatarSize);
    }
    avatarMask.src = 'resource/assets/avatarBack.png';
  }
  avatar.src = data.avatarUrl
 
}

/**
 * 点击处理
 */
function onTouchEnd(event) {
  let x = event.clientX * sharedCanvas.width / canvasWidth;
  let y = event.clientY * sharedCanvas.height / canvasHeight;
  if (x > lastButtonX && x < lastButtonX + buttonWidth &&
    y > lastButtonY && y < lastButtonY + buttonHeight) {
    //在last按钮的范围内
    if (page > 0) {
      buttonClick(0);

    }
  }
  if (x > nextButtonX && x < nextButtonX + buttonWidth &&
    y > nextButtonY && y < nextButtonY + buttonHeight) {
    //在next按钮的范围内
    if ((page + 1) * perPageMaxNum < totalGroup.length) {
      buttonClick(1);
    }
  }

}
/**
 * 根据传入的buttonKey 执行点击处理
 * 0 为上一页按钮
 * 1 为下一页按钮
 */
function buttonClick(buttonKey) {
  let old_buttonY;
  if (buttonKey == 0) {
    //上一页按钮
    old_buttonY = lastButtonY;
    lastButtonY += 10;
    page--;
    renderDirty = true;
    setTimeout(() => {
      lastButtonY = old_buttonY;
      //重新渲染必须标脏
      renderDirty = true;
    }, 100);
  } else if (buttonKey == 1) {
    //下一页按钮
    old_buttonY = nextButtonY;
    nextButtonY += 10;
    page++;
    renderDirty = true;
    setTimeout(() => {
      nextButtonY = old_buttonY;
      //重新渲染必须标脏
      renderDirty = true;
    }, 100);
  }

}

/////////////////////////////////////////////////////////////////// 相关缓存数据

///////////////////////////////////数据相关/////////////////////////////////////

/**
 * 渲染标脏量
 * 会在被标脏（true）后重新渲染
 */
let renderDirty = true;

/**
 * 当前绘制组
 */
let currentGroup = [];
/**
 * 每页最多显示个数
 */
let perPageMaxNum = 7;
/**
 * 当前页数,默认0为第一页
 */
let page = 0;
///////////////////////////////////绘制相关///////////////////////////////
/**
 * 舞台大小
 */
let stageWidth;
let stageHeight;
/**
 * 排行榜大小
 */
let rankWidth;
let rankHeight;

/**
 * 每个头像条目的大小
 */
let barWidth;
let barHeight;
/**
 * 条目与排行榜边界的水平距离
 */
let offsetX_barToRank
/**
 * 绘制排行榜起始点X
 */
let startX;
/**
 * 绘制排行榜起始点Y
 */
let startY;
/**
 * 每行Y轴间隔offsetY
 */
let preOffsetY;
/**
 * 按钮大小
 */
let buttonWidth;
let buttonHeight;
/**
 * 上一页按钮X坐标
 */
let lastButtonX;
/**
 * 下一页按钮x坐标
 */
let nextButtonX;
/**
 * 上一页按钮y坐标
 */
let lastButtonY;
/**
 * 下一页按钮y坐标
 */
let nextButtonY;
/**
 * 两个按钮的间距
 */
let buttonOffset;

/**
 * 字体大小
 */
let fontSize;
/**
 * 文本文字Y轴偏移量
 * 可以使文本相对于图片大小居中
 */
let textOffsetY;
/**
 * 头像大小
 */
let avatarSize;
/**
 * 名字文本最大宽度，名称会根据
 */
let textMaxSize;
/**
 * 绘制元素之间的间隔量
 */
let intervalX;
/**
 * 排行榜与舞台边界的水平距离
 */
let offsetX_rankToBorder;
/**
 * 排行榜与舞台边界的竖直距离
 */
let offsetY_rankToBorder;
/**
 * 绘制排名的最大宽度
 */
let indexWidth;

/**
 * 计算屏幕和设计图的比例
 */
let basicOffX;
let basicOffY;

//////////////////////////////////////////////////////////
/**
 * 监听点击
 */
wx.onTouchEnd((event) => {
  const l = event.changedTouches.length;
  for (let i = 0; i < l; i++) {
    onTouchEnd(event.changedTouches[i]);
  }
});


/**
 * 是否加载过资源的标记量
 */
let hasLoadRes;

/**
 * 资源加载
 */
function preloadAssets() {
  let preloaded = 0;
  let count = 0;
  for (let asset in assetsUrl) {
    count++;
    const img = wx.createImage();
    img.onload = () => {
      preloaded++;
      if (preloaded == count) {
        hasLoadRes = true;
      }

    }
    img.src = assetsUrl[asset];
    assets[asset] = img;
  }
}


/**
 * 绘制屏幕
 * 这个函数会在加载完所有资源之后被调用
 */
function createScene() {
  if (sharedCanvas.width && sharedCanvas.height) {
    stageWidth = sharedCanvas.width;
    stageHeight = sharedCanvas.height;
    init();
    return true;
  } else {
    console.log('创建开放数据域失败，请检查是否加载开放数据域资源');
    return false;
  }
}


//记录requestAnimationFrame的ID
let requestAnimationFrameID;
let hasCreateScene;

/**
 * 增加来自主域的监听函数
 */
function addOpenDataContextListener() {
  
  wx.onMessage((data) => {
    if (data.command == 'open') {
      if (!hasCreateScene) {
        //创建并初始化
        hasCreateScene = createScene();
      }
      requestAnimationFrameID = requestAnimationFrame(loop);
    } else if (data.command == 'close' && requestAnimationFrameID) {
      cancelAnimationFrame(requestAnimationFrameID);
      requestAnimationFrameID = null
    } else if (data.command == 'loadRes' && !hasLoadRes) {
      /**
       * 加载资源函数
       * 只需要加载一次
       */
      preloadAssets();
    }
  });
}

addOpenDataContextListener();

/**
 * 循环函数
 * 每帧判断一下是否需要渲染
 * 如果被标脏，则重新渲染
 */
function loop() {
  if (renderDirty) {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height);
    drawRankPanel();
    renderDirty = false;
  }
  requestAnimationFrameID = requestAnimationFrame(loop);
}

/**
 * 图片绘制函数
 */
function context_drawImage(image, x, y, width, height) {
  if (image.width != 0 && image.height != 0 && context) {
    if (width && height) {
      context.drawImage(image, x, y, width, height);
    } else {
      context.drawImage(image, x, y);
    }
  }
}