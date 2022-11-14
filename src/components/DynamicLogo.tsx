import { useEffect, useState } from "react"
// https://juejin.cn/post/7160491044222533639#heading-13
export default function DynamicLogo() {
  // 设置画布大小
  const width = 400,
    height = 400
  type Logo = (typeof logos)[number]
  const logos = [
    { label: "kazimierz", url: "/Youth1.jpg" },
    { label: "rhine", url: "/Youth2.jpg" },
    { label: "rhodes", url: "/Youth3.jpg" },
    { label: "victoria", url: "/Youth4.jpg" },
    { label: "yan", url: "/Youth5.jpg" },
  ]
  // const logos = [
  //   { label: "kazimierz", url: "/src/assets/logo_kazimierz.png" },
  //   { label: "rhine", url: "/src/assets/logo_rhine.png" },
  //   { label: "rhodes", url: "/src/assets/logo_rhodes.png" },
  //   { label: "victoria", url: "/src/assets/logo_victoria.png" },
  //   { label: "yan", url: "/src/assets/logo_yan.png" },
  // ]
  const [count, setCount] = useState(0)
  // 标记激活logo
  const [activeLogo, setActiveLogo] = useState<{ name: string; src: string }>()
  // 获取上下文
  // let [context, setContext] = useState<CanvasRenderingContext2D | null>(null)
  let context: CanvasRenderingContext2D

  /** canvas实体对象 */
  let particleCanvas: ParticleCanvas
  // 设置粒子动画时长
  const animateTime = 30
  const opacityStep = 1 / animateTime
/** 中心影响的半径 */
const Radius = 40;
/** 排斥/吸引 力度 */
const Inten = 0.95;
  class Particle {
    x: number // 粒子x轴的初始位置
    y: number // 粒子y轴的初始位置
    totalX: number // 粒子x轴的目标位置
    totalY: number // 粒子y轴的目标位置
    mx?: number // 粒子x轴需要移动的距离
    my?: number // 粒子y轴需要移动的距离
    vx?: number // 粒子x轴移动速度
    vy?: number // 粒子y轴移动速度
    time: number // 粒子移动耗时
    r: number // 粒子的半径
    color: number[] // 粒子的颜色
    opacity: number // 粒子的透明度

    init_totalX: number
    init_totalY: number
    init_color: number[]
    constructor(totalX: number, totalY: number, time: number, color: number[]) {
      // 设置粒子的初始位置x、y，目标位置dx、dy，总耗时time
      this.x = (Math.random() * width) >> 0
      this.y = (Math.random() * height) >> 0
      this.totalX = totalX
      this.totalY = totalY
      this.time = time
      // 设置粒子的颜色和半径
      this.r = 1.2
      this.color = [...color]
      this.opacity = 0

      this.init_totalX = this.totalX
      this.init_totalY = this.totalY
      this.init_color = this.color
    }
    // 在画布中绘制粒子
    draw() {
      context?.beginPath()
      context.fillStyle = `rgba(${this.color.toString()})`
      // context.fillStyle = this.color
      context?.arc(this.x, this.y, this.r, 0, (360 * Math.PI) / 180)
      context?.fill()
    }
    //重置粒子数据
    reset() {
      this.x = (Math.random() * width) >> 0
      this.y = (Math.random() * height) >> 0
      this.totalX = this.init_totalX
      this.totalY = this.init_totalY
      this.color = this.init_color
    }
    // 更新粒子
    update(mouseX?: number, mouseY?: number) {
      // 设置粒子需要移动的距离
      this.mx = this.totalX - this.x
      this.my = this.totalY - this.y
      // 设置粒子移动速度
      this.vx = this.mx / this.time
      this.vy = this.my / this.time
       // 计算粒子与鼠标的距离
    if (mouseX && mouseY) {
      let dx = mouseX - this.x;
      let dy = mouseY - this.y;
      let distance = Math.sqrt(dx ** 2 + dy ** 2);
      // 粒子相对鼠标距离的比例 判断受到的力度比例
      let disPercent = Radius / distance;
      // 设置阈值 避免粒子受到的斥力过大
      disPercent = disPercent > 7 ? 7 : disPercent;
      // 获得夹角值 正弦值 余弦值
      let angle = Math.atan2(dy, dx);
      let cos = Math.cos(angle);
      let sin = Math.sin(angle);
      // 将力度转换为速度 并重新计算vx vy
      let repX = cos * disPercent * -Inten;
      let repY = sin * disPercent * -Inten;
      this.vx += repX;
      this.vy += repY;
    }
      //移动
      this.x = this.x + this.vx
      this.y += this.vy
      // 随着移动不断增加透明度
      if (this.opacity < 1) this.opacity = +opacityStep
    }
    // 切换粒子
    change(tx: number, ty: number, color: number[]) {
      this.totalX = tx
      this.totalY = ty
      this.color = [...color]
    }
  }

  class LogoImg {
    particleData: Particle[]
    url: string
    label: string
    constructor(logo: Logo) {
      this.url = logo.url
      this.label = logo.label
      this.particleData = []
      let img = new Image()
      img.src = logo?.url || "/src/assets/logo_kazimierz.png"
      img.onload = () => {
        console.log("🚀 ~ img", img)
        // 获取图片像素数据
        const tmp_canvas = document.createElement("canvas")
        const tmp_ctx = tmp_canvas.getContext("2d")
        tmp_canvas.width = width
        tmp_canvas.height = height
        // 将图片绘制到canvas中
        tmp_ctx?.drawImage(img, 0, 0, width, height)
        // document.body.appendChild(tmp_canvas)

        // 获取像素点数据
        const imgData = tmp_ctx?.getImageData(0, 0, width, height).data!
        console.log("🚀 ~ imgData", imgData)
        tmp_ctx?.clearRect(0, 0, width, height)

        // 筛选像素点  5个里面选一个
        for (let y = 0; y < height; y += 5) {
          for (let x = 0; x < width; x += 5) {
            // 像素点的索引
            const index = (x + y * width) * 4
            // 在数组中对应的值
            const r = imgData[index]
            const g = imgData[index + 1]
            const b = imgData[index + 2]
            const a = imgData[index + 3]

            //像素值相加>100  时  创建这个像素
            if (r + g + b + a > 100) {
              const particle = new Particle(x, y, animateTime, [r, g, b, a])
              console.log("🚀 ~ [r, g, b, a]", [r, g, b, a])
              this.particleData.push(particle)
            }
          }
        }

      }
    }
  }
  const logoImgs = logos.map((v) => new LogoImg(v))

  class ParticleCanvas {
    canvasEle
    ParticleArr: Particle[]
    mouseX?: number; // 鼠标X轴位置
    mouseY?: number; // 鼠标Y轴位置
    constructor(canvas: HTMLCanvasElement) {
      this.canvasEle = canvas
      this.ParticleArr = []

       // 监听鼠标移动
    this.canvasEle.addEventListener("mousemove", (e) => {
      const { left, top } = this.canvasEle.getBoundingClientRect();
      const { clientX, clientY } = e;
      this.mouseX = clientX - left;
      this.mouseY = clientY - top;
    });
    this.canvasEle.onmouseleave = () => {
      this.mouseX = 0;
      this.mouseY = 0;
    };
    }
    // 改变画布数据源   复用粒子
    changeImg(logoImg: LogoImg) {
      // this.ParticleArr = logoImg.particleData
      const oleLen = this.ParticleArr.length
      console.log("🚀 ~ oleLen", oleLen)
      const newData = logoImg.particleData
      const newLen = newData.length
      console.log("🚀 ~ newLen", newLen)
      const arr = this.ParticleArr

      if (this.ParticleArr.length !== 0) {
        // debugger
        // 如果当前粒子数组大于新的粒子数组 删除多余的粒子
        // 调用change修改已存在粒子
        for (let index = 0; index < newLen; index++) {
          const newParticle = newData[index]
          const oldParticle = this.ParticleArr[index]
          newParticle.reset()

          if (oldParticle) {
            // 找到已存在的粒子 调用change 接收新粒子的属性
            const { totalX, totalY, color } = newParticle
            this.ParticleArr[index].change(totalX, totalY, color)
          } else {
            //多出来的部分  加进去
            this.ParticleArr.push(newParticle)
          }
        }
        //当新的少于老的  去除老的多的部分
        if (newLen < oleLen) this.ParticleArr = arr.slice(0, newLen)
        let tmp_len = arr.length;
        // 随机打乱粒子最终对应的位置 使切换效果更自然
        while (tmp_len) {
          // 随机的一个粒子 与 倒序的一个粒子
          let randomIdx = ~~(Math.random() * tmp_len--);
          let randomPrt = arr[randomIdx];
          let { totalX: tx, totalY: ty, color } = randomPrt;

          // 交换位置
          randomPrt.totalX = arr[tmp_len].totalX;
          randomPrt.totalY = arr[tmp_len].totalY;
          randomPrt.color = arr[tmp_len].color;
          arr[tmp_len].totalX = tx;
          arr[tmp_len].totalY = ty;
          arr[tmp_len].color = color;
        }


      } else {
        this.ParticleArr = logoImg.particleData
      }
    }
    // 画布绘制方法  动画
    drawCanvas() {
      //清除画布
      context?.clearRect(0, 0, width, height)
      //对每个粒子进行更新 绘画
      this.ParticleArr.forEach((item) => {
        item.update(this.mouseX, this.mouseY);
        item.draw()
      })
      requestAnimationFrame(() => this.drawCanvas())
      // 动画 递归调用
    }
  }

  function selectImg(logoImg: LogoImg) {
    particleCanvas.changeImg(logoImg)
    // particleCanvas.drawCanvas()
  }

  useEffect(() => {
    const canvasDom = document.querySelector(
      ".canvas-logo"
    ) as HTMLCanvasElement

    context = canvasDom.getContext("2d")!
    // new LogoImg()
    particleCanvas = new ParticleCanvas(canvasDom)
    particleCanvas.changeImg(new LogoImg(logoImgs[0]))
    particleCanvas.drawCanvas()
  }, [])
  return (
    <div className="DynamicLogo">
      123
      <canvas className="canvas-logo" width={width} height={height}></canvas>
      <div>
        {
          logoImgs.map((v) => <img key={v.url} onClick={() => selectImg(v)} style={{ width: '100px' }} src={v.url} />)
        }

      </div>
    </div>
  )
}
