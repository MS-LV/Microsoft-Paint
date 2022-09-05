//@ts-nocheck
import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, fromEvent, map, pairwise, switchMap, takeUntil, timer} from "rxjs";
import {FiguresImages, ListColors, PointerPosition} from './ms-paint'

@Component({
  selector: 'app-ms-paint',
  templateUrl: './ms-paint.component.html',
  styleUrls: ['./ms-paint.component.scss']
})
export class MsPaintComponent implements OnInit, AfterViewInit, OnDestroy {
  urlFigures = 'assets/icons/ms-paint/figures'
  urlToolsIcons = 'assets/icons/ms-paint/tools'
  listColors = ListColors;
  figuresImages = FiguresImages;
  activeThickness = 0;
  thicknessSizes = [2, 4, 6, 8, 10, 12];
  toolsImages = ['pencil.svg', 'paint-bucket.svg', 'eraser.svg', 'pipette.svg', 'zoom-in.svg', 'letter-A.svg']
  isShowLines = false;
  selectToolButton = 'pencil.svg'
  mouseMovePosition: { x: number, y: number } = {x: 0, y: 0}
  ctx!: any;
  canvasTag!: HTMLCanvasElement;
  canvasBackground = 'white';
  eyeDropper = new EyeDropper();
  color = 'black';
  lineWidth = 2;
  primaryColor = 'white';
  isClickPrimary = false;
  rectFigure!: HTMLDivElement;
  coordsFigures = {};
  canvasSize = {};
  destroy$ = new BehaviorSubject<void>()

  @ViewChild('canvasTag') canvas!: ElementRef;
  @ViewChild('tool') tool!: ElementRef;
  @ViewChild('parentCanvas') parentCanvas!: ElementRef;
  @ViewChild('zoomRange') zoomRange!: ElementRef;
  private counter = 0;

  constructor() {
  }

  ngOnInit(): void {
    timer(400).subscribe(() => {
      const canvas: HTMLCanvasElement = this.canvas.nativeElement;
      const parentCanvas = this.parentCanvas.nativeElement;
      canvas.width = parentCanvas.offsetWidth;
      canvas.height = parentCanvas.offsetHeight;
    })
  }

  ngAfterViewInit() {
    // timer(10000).subscribe(()=>{
    //     this.destroy$.next(0);
    // });
    const canvas: HTMLCanvasElement = this.canvas.nativeElement;
    this.canvasSize = {
      width:window.getComputedStyle(this.canvas.nativeElement).width,
      height:window.getComputedStyle(this.canvas.nativeElement).height
    };
    const parentCanvas = this.parentCanvas.nativeElement;
    this.ctx = canvas.getContext("2d");
    const canvasResize = new ResizeObserver(() => {
      canvas.width = parentCanvas.offsetWidth;
      canvas.height = parentCanvas.offsetHeight;
      this.ctx.lineWidth = this.lineWidth;
    });
    canvasResize.observe(parentCanvas);
    const documentMouseUp$ = fromEvent<MouseEvent>(document, 'mouseup');
    const canvasMouseMove$ = fromEvent<MouseEvent>(canvas, 'mousemove');
    const canvasMouseDown$ = fromEvent<MouseEvent>(canvas, 'mousedown');
    const canvasMouseOut$ = fromEvent<MouseEvent>(canvas, 'mouseout');
    const canvasMouseUp$ = fromEvent<MouseEvent>(canvas, 'mouseup');
    const mouseDown$ = canvasMouseDown$;
    const canvasPointer$ = canvasMouseMove$.pipe(
      map<MouseEvent, PointerPosition>(({offsetX, offsetY}) => {
        return {
          x: offsetX,
          y: offsetY
        }
      }),
      pairwise<PointerPosition>(),
      takeUntil(documentMouseUp$),
      takeUntil(canvasMouseOut$),
    );

    canvasMouseDown$.pipe(
      map((val)=>{
        // console.log(val)
        return val
      }),
      switchMap(() => canvasPointer$),
      // takeUntil(this.destroy$)
    )
      .subscribe((next) => {
        let toolType = this.selectToolButton;
        toolType.includes('pencil') ? this.toolWriteLine(next) :
          toolType.includes('eraser') ? this.toolClearLine(next) :
            toolType.includes('pipette') ? this.toolPipette(next[1]) : ''
      })
    mouseDown$
      .subscribe((next) => {
        this.coordsFigures = {left: next.offsetX + 10, top: next.offsetY + 10}
        const isPaint = this.selectToolButton.includes('paint-bucket');
        if (!isPaint) return
        const canvas = this.canvas.nativeElement;
        canvas.style.backgroundColor = this.color;
        this.canvasBackground = this.color;
      })

    this.ctx.lineWidth = this.thicknessSizes[0];

  }

  toolWriteLine([prev, next]: PointerPosition[]) {
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = this.color;
    this.ctx.beginPath();
    this.ctx.moveTo(prev.x, prev.y);
    this.ctx.lineTo(next.x, next.y);
    this.ctx.stroke();
    console.log('_____------_____')
  }

  toolClearLine([prev, next]: PointerPosition[]) {
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = 'white';
    this.ctx.beginPath();
    this.ctx.moveTo(prev.x, prev.y);
    this.ctx.lineTo(next.x, next.y);
    this.ctx.stroke();
    // const halfSizeEraser = this.ctx.lineWidth / 2;
    // const sizeEraser = this.ctx.lineWidth;
    // this.ctx.clearRect(next.x - halfSizeEraser, next.y - halfSizeEraser, sizeEraser, sizeEraser);
    // this.ctx.clearRect(prev.x - halfSizeEraser, prev.y - halfSizeEraser, sizeEraser, sizeEraser);
  }

  toolPipette(positions: PointerPosition) {
    // const pxData = this.ctx.getImageData(positions.x, positions.y, 1, 1);
    // console.log("rgb("+pxData.data[0]+","+pxData.data[1]+","+pxData.data[2]+")");
    // console.log('positions', positions)
  }

  toolButtons(tool: string) {
    this.selectToolButton = tool;
    if (tool.includes('pipette')) {
      this.eyeDropper.open().then(data => {
        this.color = data.sRGBHex;
        this.selectToolButton = 'pencil.svg'
      });
    }
  }

  thicknessLine(size: number, idx: number) {
    this.activeThickness = idx;
    this.ctx.lineWidth = size;
    this.lineWidth = size;
    this.isShowLines = !this.isShowLines;
  }

  thicknessButton() {
    this.isShowLines = !this.isShowLines;
  }

  contentMouseMove(canvasTag: HTMLCanvasElement, event: MouseEvent) {
    this.mouseMovePosition = {x: event.offsetX, y: event.offsetY};
  }

  contentMouseLeave() {
    this.mouseMovePosition = {x: 0, y: 0}
  }
  ngOnDestroy(): void {
  }

  cursorRender() {
    return {
      'cursor': `url(../../../assets/icons/ms-paint/tools/${this.selectToolButton}), auto`
    };
  }


  setColor(color: string) {
    this.color = color;
    if (this.isClickPrimary) {
      this.primaryColor = color;
      this.isClickPrimary = false;
    }
  }

  defaultColor() {
    this.isClickPrimary = !this.isClickPrimary;
    this.color = this.primaryColor
  }

  zoomPlusMinus(number: number) {
    let zoomRange = this.zoomRange.nativeElement
    let valueOfRange = zoomRange.value;
    if (number == 0) {
      zoomRange.value = --valueOfRange;
    } else if (number == 1) {
      zoomRange.value = ++valueOfRange;
    }
    this.changeRange(zoomRange)
  }

  changeRange(zoomRange: HTMLInputElement) {
    let valueOfZoom = this.zoomRange.nativeElement.value;
    const {width, height} = this.canvasSize;
    this.parentCanvas.nativeElement.style.width = Math.abs(parseInt(width) + (zoomRange.value - 100) * 5) + 'px'
    this.parentCanvas.nativeElement.style.height = Math.abs(parseInt(height) + (zoomRange.value - 100) * 5) + 'px'
    this.canvas.nativeElement.width = Math.abs(parseInt(width) + (zoomRange.value - 100) * 5) + 'px';
    this.canvas.nativeElement.height = Math.abs(parseInt(height) + (zoomRange.value - 100) * 5) + 'px';

  }
}
