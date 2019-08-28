let data = [{
    value: 'time:5,color:red speed:1,fontSize:22',
    time: 1,
    color: 'red',
    speed: 1,
    fontSize: 22
  },
  {
    value: 'time:10,color:00a1f5 speed:1,fontSize:30',
    time: 10,
    color: '#00a1f5',
    speed: 3,
    fontSize: 30
  },
  {
    value: 'time:2',
    time: 2
  },
  {
    value: 'time:3',
    time: 3
  },
  {
    value: 'time:4',
    time: 4
  },
  {
    value: 'time:5',
    time: 5
  },
  {
    value: 'time:6',
    time: 6
  },
  {
    value: 'time:7',
    time: 7
  },
  {
    value: 'time:8',
    time: 8
  },

  {
    value: 'time:15',
    time: 15
  },
]

let $ = document.querySelector.bind(document)
let canvasDOM = $("#barrage-content")
let videoDOM = $("#video-content")
let bTxt = $("#text-barrage")
let btn = $("#send-barrage")
let bColor = $("#color-barrage")
let bSize = $("#size-barrage")
class BarrageCanvas {
  // canvasDom videoDOM, option默认配置项，默认为{{} ES6
  constructor(cDom, vDom, options = {}) {
    // 建议版判断是否传入了DOM节点

    if (!cDom || !vDom) return
    this.canvas = cDom
    this.video = vDom
    this.canvas.width = vDom.width
    this.canvas.height = vDom.height
    // 上下文
    this.ctx = cDom.getContext('2d')
    // 弹幕默认参数
    let defaultOpt = {
      color: '#fff',
      speed: 1,
      fontSize: 20,
      data: []
    }
    Object.assign(this, defaultOpt, options);
    this.isPaused = true
    this.barrages = this.data.map(item => new Barrages(item, this))
    this.render()
  }
  render() {
    // 每次渲染弹幕都要清除上一次的画布
    this.clear()
    // 渲染弹幕
    this.renderBarrage()
    // 如果没有暂停就继续渲染弹幕
    if (this.isPaused === false) {
      // 注意这里的递归this，不改变this指向的话指向domcument
      requestAnimationFrame(this.render.bind(this))
    }
  }
  clear() {
    // 清除整块画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
  renderBarrage() {
    let currentTime = this.video.currentTime
    this.barrages.forEach(barrage => {
      // 判断弹幕是否在这个时间点出现，并且是否已经渲染过弹幕,true的时候代表已经离开video位置
      if (currentTime >= barrage.time && !barrage.outRange) {
        if (!barrage.isInit) {
          // 初始化为弹幕确定颜色，大小，出现位置（x,y），位置
          barrage.init()
          barrage.isInit = true
        }

        //弹幕移动
        barrage.showX = barrage.showX - barrage.speed
        barrage.render()

        // 判断是否已经离开可视范围，即超出video宽度+本身弹幕宽度
        if (barrage.showX < -barrage.width) {
          barrage.outRange = true
        }
      }
    });
  }
  add(obj) {
    // 实际上就是往barrages数组里再添加一项Barrage的实例而已
    this.barrages.push(new Barrages(obj, this));
  }
  reset() {
    this.clear()
    let currentTime = this.video.currentTime
    this.barrages.forEach(barrage => {
      // 设定弹幕没有超出范围
      barrage.outRange = false
      // 当弹幕出现时间比当前时间大或者等于则重置
      if (currentTime <= barrage.time) {
        // 就把isInit重设为false，这样才会重新初始化渲染
        barrage.isInit = false;
      } else { // 其他时间对比不匹配的，flag还是true不用重新渲染
        barrage.outRange = true;
      }
    });
  }
}
// 弹幕类
class Barrages {
  constructor(barrageObj, bcCTX) {
    // 弹幕文本
    this.txt = barrageObj.value
    // 弹幕出现时间
    this.time = barrageObj.time
    // 弹幕数据
    this.barrageObj = barrageObj
    // 上下文
    this.bcCTX = bcCTX
  }
  // 初始化弹幕
  init() {
    // 如果弹幕data没有对应属性，则取default里面的配置
    this.color = this.barrageObj.color || this.bcCTX.color
    this.speed = this.barrageObj.speed || this.bcCTX.speed
    this.fontSize = this.barrageObj.fontSize || this.bcCTX.fontSize

    // 获取弹幕文本的对应宽以计算对应弹幕的“离场位置”
    let pDOM = document.createElement('span');
    pDOM.innerText = this.txt
    pDOM.style.fontSize = this.fontSize + 'px'
    pDOM.style.position = 'absolute'
    document.body.appendChild(pDOM)

    this.width = pDOM.clientWidth
    document.body.removeChild(pDOM)
    // 弹幕的X轴出现 位置。应该在canvas的最右端
    this.showX = this.bcCTX.canvas.width
    // 弹幕的Y轴出现位置，随机
    this.showY = this.bcCTX.canvas.height * Math.random()
    // 因为弹幕是从左上角开始绘制，所以当弹幕出现y轴位置小于本身弹幕高度即显示不完整，须控制
    if (this.showY < this.fontSize) {
      this.showY = this.fontSize
    } else if (this.Y > this.bcCTX.canvas.height - this.fontSize) {
      // 当弹幕“溢出”Y轴范围时，需要拉回范围内
      this.showY = this.bcCTX.canvas.height - this.fontSize;
    }
  }
  render() {
    this.bcCTX.ctx.font = `${this.fontSize}px Arial`;
    this.bcCTX.ctx.fillStyle = this.color
    this.bcCTX.ctx.fillText(this.txt, this.showX, this.showY);
  }
}
let barrageCanvas = new BarrageCanvas(canvasDOM, videoDOM, {
  data
})
videoDOM.addEventListener('play', () => {
  barrageCanvas.isPaused = false
  barrageCanvas.render()
})
videoDOM.addEventListener('pause', () => {
  barrageCanvas.isPaused = true
})
// 拖动
videoDOM.addEventListener('seeked', () => {
  barrageCanvas.reset()
})

btn.addEventListener('click', send)

function send() {
  let value = bTxt.value
  let time = videoDOM.currentTime
  let color = bColor.value
  let fontSize = bSize.value
  let obj = {
    value,
    time,
    color,
    fontSize
  }
  // 添加弹幕数据
  barrageCanvas.add(obj);
  bTxt.value = ''
}