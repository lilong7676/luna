import Component, { IComponentOptions } from '../share/Component'
import { exportCjs, drag, eventPage } from '../share/util'
import ResizeSensor from 'licia/ResizeSensor'
import $ from 'licia/$'
import isHidden from 'licia/isHidden'

const $document = $(document as any)

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Image src. */
  image: string
  /** Initial coverage. */
  initialCoverage?: number
}

interface IImageData {
  left: number
  top: number
  width: number
  height: number
  rotate: number
  naturalWidth: number
  naturalHeight: number
}

/**
 * Single image viewer.
 *
 * @example
 * const imageViewer = new LunaImageViewer(container, {
 *   image: 'https://res.liriliri.io/luna/pic1.jpg',
 * })
 * imageViewer.zoom(0.1)
 */
export default class ImageViewer extends Component<IOptions> {
  private imageData: IImageData = {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    rotate: 0,
    naturalWidth: 0,
    naturalHeight: 0,
  }
  private resizeSensor: ResizeSensor
  private $image: $.$
  private image: HTMLImageElement
  private startX = 0
  private startY = 0
  constructor(container: HTMLElement, options: IOptions) {
    super(container, { compName: 'image-viewer' })
    this.initOptions(options, {
      initialCoverage: 0.9,
    })

    this.resizeSensor = new ResizeSensor(container)

    this.initTpl()
    this.$image = this.find('.image')
    this.image = this.$image.get(0) as HTMLImageElement

    this.bindEvent()

    this.setImage(this.options.image)
  }
  /** Rotate image with a relative degree. */
  rotate(degree: number) {
    this.rotateTo(this.imageData.rotate + degree)

    this.render()
  }
  /** Rotate image to an absolute degree. */
  rotateTo(degree: number) {
    this.imageData.rotate = degree
  }
  /** Zoom image with a relative ratio. */
  zoom(ratio: number) {
    const { imageData } = this

    ratio = ratio < 0 ? 1 / (1 - ratio) : 1 + ratio

    this.zoomTo((imageData.width * ratio) / imageData.naturalWidth)
  }
  /** Zoom image to an absolute ratio. */
  zoomTo(ratio: number) {
    const { imageData } = this
    const { naturalWidth, naturalHeight, width, height } = imageData

    const newWidth = naturalWidth * ratio
    const newHeight = naturalHeight * ratio
    const offsetWidth = newWidth - width
    const offsetHeight = newHeight - height

    imageData.width = newWidth
    imageData.height = newHeight
    imageData.left -= offsetWidth / 2
    imageData.top -= offsetHeight / 2

    this.render()
  }
  /** Reset image to initial state. */
  reset = () => {
    if (isHidden(this.container)) {
      return
    }

    const { image, $container } = this
    const { initialCoverage } = this.options
    const { width: viewerWidth, height: viewerHeight } = $container.offset()
    const naturalWidth = image.naturalWidth || image.width
    const naturalHeight = image.naturalHeight || image.height
    const aspectRatio = naturalWidth / naturalHeight

    let width = viewerWidth
    let height = viewerHeight
    if (viewerHeight * aspectRatio > viewerWidth) {
      height = viewerWidth / aspectRatio
    } else {
      width = viewerHeight * aspectRatio
    }
    width = Math.min(width * initialCoverage, naturalWidth)
    height = Math.min(height * initialCoverage, naturalHeight)

    const left = (viewerWidth - width) / 2
    const top = (viewerHeight - height) / 2

    this.imageData = {
      left,
      top,
      width,
      height,
      rotate: 0,
      naturalWidth,
      naturalHeight,
    }

    this.render()
  }
  destroy() {
    super.destroy()
    this.resizeSensor.destroy()
  }
  private onMoveStart = (e: any) => {
    e.preventDefault()
    e = e.origEvent
    this.startX = eventPage('x', e)
    this.startY = eventPage('y', e)
    this.$image.rmClass(this.c('image-transition'))
    this.$container.on(drag('move'), this.onMove)
    $document.on(drag('end'), this.onMoveEnd)
  }
  private onMove = (e: any) => {
    const { imageData } = this
    e = e.origEvent
    const deltaX = eventPage('x', e) - this.startX
    const deltaY = eventPage('y', e) - this.startY
    const newLeft = imageData.left + deltaX
    const newTop = imageData.top + deltaY
    this.$image.css({
      marginLeft: newLeft,
      marginTop: newTop,
    })
  }
  private onMoveEnd = (e: any) => {
    const { imageData } = this

    e = e.origEvent
    const deltaX = eventPage('x', e) - this.startX
    const deltaY = eventPage('y', e) - this.startY
    imageData.left += deltaX
    imageData.top += deltaY
    this.render()

    this.$image.addClass(this.c('image-transition'))
    this.$container.off(drag('move'), this.onMove)
    $document.off(drag('end'), this.onMoveEnd)
  }
  private setImage(image: string) {
    const { c, $image } = this

    $image.rmClass(c('image-transition'))
    $image.addClass(c('hidden')).attr('src', image)
  }
  private bindEvent() {
    const { image } = this

    image.onload = () => {
      const { c, $image } = this
      $image.rmClass(c('hidden'))
      this.reset()
      setTimeout(() => $image.addClass(c('image-transition')), 0)
    }
    image.onerror = (err) => {
      this.emit('error', err)
    }

    this.resizeSensor.addListener(this.reset)

    this.$container.on(drag('start'), this.onMoveStart)

    this.on('optionChange', (name, val) => {
      switch (name) {
        case 'image':
          this.setImage(val)
          break
      }
    })
  }
  private render() {
    const { imageData } = this

    this.$image.css({
      width: imageData.width,
      height: imageData.height,
      marginLeft: imageData.left,
      marginTop: imageData.top,
      transform: `rotate(${imageData.rotate}deg)`,
    })
  }
  private initTpl() {
    this.$container.html(this.c(`<img class="image"></img>`))
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, ImageViewer)
}
