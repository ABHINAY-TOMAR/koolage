import React, { useRef, useState, useEffect, useCallback, useLayoutEffect } from "react";
import {
  MousePointer2, Pencil, Square, Circle, Minus, ArrowRight,
  Type, Eraser, Hand, Undo2, Redo2, Trash2, Download,
  ZoomIn, ZoomOut, Maximize2, Sparkles, Loader2,
  Triangle, Diamond, StickyNote, Minus as LineIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAI } from "@/hooks/useAI";
import { useGamificationStore } from "@/stores/useGamificationStore";
import { renderEl, drawDotGrid, hitTest, uid, WBElement, Tool, StrokeStyle, FillStyle, Pt } from "./wbEngine";

// ─── Constants ──────────────────────────────────────────────
const STROKE_COLORS = ["#0f172a","#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#8b5cf6","#ec4899","#64748b","#ffffff"];
const FILL_COLORS   = ["none","#ffffff","#fef3c7","#dbeafe","#dcfce7","#fce7f3","#ede9fe","#fee2e2"];
const WIDTHS = [1, 2, 3, 5, 8];

function blankEl(type: Tool, p: Pt, stroke: string, fill: string, sw: number, ss: StrokeStyle, fs: FillStyle, op: number): WBElement {
  return {
    id: uid(), type, x: p.x, y: p.y, w: 0, h: 0,
    points: type === "pencil" ? [p] : undefined,
    stroke, strokeWidth: sw, strokeStyle: ss, fill, fillStyle: fs, opacity: op,
    text: type === "sticky" ? "Sticky note" : undefined,
    fontSize: 14, roughness: 2,
  };
}

interface Props { tabId: string }

export function WhiteboardTab({ tabId }: Props) {
  const cvs  = useRef<HTMLCanvasElement>(null);
  const wrap  = useRef<HTMLDivElement>(null);
  const [tool,  setTool]  = useState<Tool>("select");
  const [els,   setEls]   = useState<WBElement[]>([]);
  const [hist,  setHist]  = useState<WBElement[][]>([[]]);
  const [hidx,  setHidx]  = useState(0);
  const [selIds,setSelIds]= useState<Set<string>>(new Set());

  const [sColor, setSColor]= useState("#0f172a");
  const [fColor, setFColor]= useState("none");
  const [fStyle, setFStyle]= useState<FillStyle>("solid");
  const [sWidth, setSWidth]= useState(2);
  const [sStyle, setSStyle]= useState<StrokeStyle>("solid");
  const [opacity,setOpacity]= useState(1);

  const [showGrid,setShowGrid]= useState(true);
  const [showAI,  setShowAI]  = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [pan,  setPan]  = useState<Pt>({x:0,y:0});
  const [zoom, setZoom] = useState(1);
  const [tooltip,setTooltip]= useState<string|null>(null);

  const drawing   = useRef(false);
  const curEl     = useRef<WBElement|null>(null);
  const startPt   = useRef<Pt>({x:0,y:0});
  const panStart  = useRef<Pt>({x:0,y:0});
  const panOrigin = useRef<Pt>({x:0,y:0});
  const moveSel   = useRef<{id:string,ox:number,oy:number}[]>([]);
  const moveStart = useRef<Pt>({x:0,y:0});

  const { generateMindMap, isLoading } = useAI();
  const { trackAction } = useGamificationStore();

  // ── helpers ──────────────────────────────────────────────
  const toCanvas = useCallback((cx:number, cy:number):Pt => {
    const r = cvs.current!.getBoundingClientRect();
    return { x:(cx - r.left - pan.x)/zoom, y:(cy - r.top - pan.y)/zoom };
  },[pan,zoom]);

  const pushHist = useCallback((next: WBElement[]) => {
    setHist(h => [...h.slice(0, hidx+1), [...next]]);
    setHidx(i => i+1);
  },[hidx]);

  const undo = () => { if(hidx<=0) return; setEls([...hist[hidx-1]]); setHidx(i=>i-1); };
  const redo = () => { if(hidx>=hist.length-1) return; setEls([...hist[hidx+1]]); setHidx(i=>i+1); };

  const selEl = (p:Pt) => { for(let i=els.length-1;i>=0;i--) if(hitTest(els[i],p)) return els[i]; return null; };

  // ── render loop ───────────────────────────────────────────
  useLayoutEffect(() => {
    const c = cvs.current, w = wrap.current;
    if(!c||!w) return;
    c.width  = w.clientWidth;
    c.height = w.clientHeight;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0,0,c.width,c.height);
    ctx.fillStyle = "hsl(220,14%,93%)";
    ctx.fillRect(0,0,c.width,c.height);
    if(showGrid) drawDotGrid(ctx,c.width,c.height,pan,zoom);
    ctx.save(); ctx.translate(pan.x,pan.y); ctx.scale(zoom,zoom);
    els.forEach(el => renderEl(ctx, el, selIds.has(el.id)));
    if(curEl.current) renderEl(ctx, curEl.current, false);
    ctx.restore();
  },[els,selIds,pan,zoom,showGrid]);

  // ── pointer events (unified mouse + touch) ────────────────
  const getPoint = (e: React.MouseEvent|React.TouchEvent|MouseEvent|TouchEvent): Pt => {
    if("touches" in e) {
      const t = (e as TouchEvent).touches[0] || (e as TouchEvent).changedTouches[0];
      return toCanvas(t.clientX, t.clientY);
    }
    return toCanvas((e as MouseEvent).clientX, (e as MouseEvent).clientY);
  };

  const onPointerDown = useCallback((e:React.MouseEvent|React.TouchEvent) => {
    if("button" in e && e.button !== 0) return;
    const p = getPoint(e as any);
    drawing.current = true;
    startPt.current = p;

    if(tool === "pan") {
      const raw = "touches" in e ? {x:(e as React.TouchEvent).touches[0].clientX,y:(e as React.TouchEvent).touches[0].clientY} : {x:(e as React.MouseEvent).clientX,y:(e as React.MouseEvent).clientY};
      panStart.current  = raw;
      panOrigin.current = {...pan};
      return;
    }
    if(tool === "select") {
      const hit = selEl(p);
      if(hit) {
        setSelIds(new Set([hit.id]));
        moveStart.current = p;
        moveSel.current = [{id:hit.id, ox:hit.x, oy:hit.y}];
      } else {
        setSelIds(new Set());
        moveSel.current = [];
      }
      return;
    }
    if(tool === "eraser") return;
    curEl.current = blankEl(tool, p, sColor, fColor, sWidth, sStyle, fStyle, opacity);
  },[tool,pan,els,sColor,fColor,sWidth,sStyle,fStyle,opacity,selIds]);

  const onPointerMove = useCallback((e:React.MouseEvent|React.TouchEvent) => {
    if(!drawing.current) return;
    const p = getPoint(e as any);

    if(tool === "pan") {
      const raw = "touches" in e ? {x:(e as React.TouchEvent).touches[0].clientX,y:(e as React.TouchEvent).touches[0].clientY} : {x:(e as React.MouseEvent).clientX,y:(e as React.MouseEvent).clientY};
      setPan({ x: panOrigin.current.x + raw.x - panStart.current.x, y: panOrigin.current.y + raw.y - panStart.current.y });
      return;
    }
    if(tool === "select" && moveSel.current.length > 0) {
      const dx = p.x - moveStart.current.x, dy = p.y - moveStart.current.y;
      setEls(prev => prev.map(el => {
        const m = moveSel.current.find(m=>m.id===el.id);
        if(!m) return el;
        const moved = {...el, x:m.ox+dx, y:m.oy+dy};
        if(moved.points) moved.points = moved.points.map(pt=>({x:pt.x+dx,y:pt.y+dy}));
        return moved;
      }));
      return;
    }
    if(tool === "eraser") {
      setEls(prev => prev.filter(el => !hitTest(el, p, 16)));
      return;
    }
    if(!curEl.current) return;
    if(tool === "pencil") {
      curEl.current = {...curEl.current, points:[...(curEl.current.points||[]),p]};
    } else {
      curEl.current = {...curEl.current, w: p.x-startPt.current.x, h: p.y-startPt.current.y};
    }
    setEls(e=>[...e]); // trigger repaint
  },[tool]);

  const onPointerUp = useCallback(() => {
    drawing.current = false;
    if(moveSel.current.length>0) { pushHist([...els]); moveSel.current=[]; return; }
    if(!curEl.current) return;
    if(tool==="pan"||tool==="select"||tool==="eraser") { curEl.current=null; return; }
    const el = curEl.current;
    const tooSmall = tool!=="pencil" && Math.abs(el.w)<3 && Math.abs(el.h)<3;
    if(!tooSmall) { const n=[...els,el]; setEls(n); pushHist(n); }
    curEl.current = null;
  },[tool,els,pushHist]);

  // ── wheel zoom ────────────────────────────────────────────
  const onWheel = useCallback((e:WheelEvent) => {
    e.preventDefault();
    const r = cvs.current!.getBoundingClientRect();
    const mx = e.clientX-r.left, my = e.clientY-r.top;
    const dz = e.deltaY<0 ? 1.1 : 0.9;
    const nz = Math.min(5,Math.max(0.1,zoom*dz));
    setPan(p=>({x:mx-(mx-p.x)*(nz/zoom), y:my-(my-p.y)*(nz/zoom)}));
    setZoom(nz);
  },[zoom]);

  useEffect(() => {
    const el = cvs.current;
    if(!el) return;
    el.addEventListener("wheel",onWheel,{passive:false});
    return () => el.removeEventListener("wheel",onWheel);
  },[onWheel]);

  // ── keyboard ──────────────────────────────────────────────
  useEffect(() => {
    const fn = (e:KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if(tag==="INPUT"||tag==="TEXTAREA") return;
      if(e.key==="Delete"||e.key==="Backspace"){ const u=els.filter(el=>!selIds.has(el.id)); setEls(u); pushHist(u); setSelIds(new Set()); }
      if(e.ctrlKey&&e.key==="z") undo();
      if(e.ctrlKey&&e.key==="y") redo();
      if(e.key==="v") setTool("select");
      if(e.key==="h") setTool("pan");
      if(e.key==="p") setTool("pencil");
      if(e.key==="e") setTool("eraser");
      if(e.key==="r") setTool("rect");
      if(e.key==="o") setTool("ellipse");
      if(e.key==="l") setTool("line");
      if(e.key==="a") setTool("arrow");
      if(e.key==="t") setTool("text");
    };
    window.addEventListener("keydown",fn);
    return ()=>window.removeEventListener("keydown",fn);
  },[selIds,els,hidx,hist]);

  // ── AI mind map ───────────────────────────────────────────
  const handleAI = async () => {
    if(!aiTopic.trim()) return;
    setShowAI(false);
    const res = await generateMindMap(aiTopic);
    if(!res?.nodes) { setAiTopic(""); return; }

    const CW=164,CH=52,CCW=190,CCH=62;
    const n = res.nodes.length;
    const R = Math.max(220, n*38);
    const cx0 = (cvs.current?.width??800)/(2*zoom) - pan.x/zoom;
    const cy0 = (cvs.current?.height??600)/(2*zoom) - pan.y/zoom;

    const nodes: WBElement[] = res.nodes.map((nd:any,i:number)=>{
      const isC = i===0;
      let nx=cx0-(isC?CCW:CW)/2, ny=cy0-(isC?CCH:CH)/2;
      if(!isC){
        const ang = ((i-1)/(Math.max(n-1,1)))*2*Math.PI - Math.PI/2;
        nx = cx0+R*Math.cos(ang)-CW/2;
        ny = cy0+R*Math.sin(ang)-CH/2;
      }
      return {
        id:nd.id??uid(), type:"rect" as Tool,
        x:nx, y:ny, w:isC?CCW:CW, h:isC?CCH:CH,
        stroke:isC ? "#ea580c" : "#cbd5e1",
        strokeWidth:isC?2:1.5,
        strokeStyle:"solid" as StrokeStyle,
        fill:isC?"#fff7ed":"#ffffff",
        fillStyle:"solid" as FillStyle,
        opacity:1,
        text:nd.data?.label??nd.label??"",
        fontSize:isC?14:12,
        roughness:0, // smooth cards
        isCard:true,
      };
    });

    const center = nodes[0];
    const edges: WBElement[] = nodes.slice(1).map(ch=>({
      id:uid(), type:"arrow" as Tool,
      x:center.x+center.w/2, y:center.y+center.h/2,
      w:(ch.x+ch.w/2)-(center.x+center.w/2),
      h:(ch.y+ch.h/2)-(center.y+center.h/2),
      stroke:"#cbd5e1", strokeWidth:1.5,
      strokeStyle:"solid" as StrokeStyle,
      fill:"none", fillStyle:"none" as FillStyle,
      opacity:1, roughness:0,
    }));

    const upd=[...els,...edges,...nodes];
    setEls(upd); pushHist(upd); trackAction("mindmap");
    setAiTopic("");
  };

  const exportPNG = () => {
    const a=document.createElement("a");
    a.download="whiteboard.png"; a.href=cvs.current!.toDataURL("image/png"); a.click();
  };

  const clearAll = () => { setEls([]); pushHist([]); setSelIds(new Set()); };

  // ── Tool definitions ──────────────────────────────────────
  const tools: {id:Tool,icon:React.ElementType,label:string,key:string}[] = [
    {id:"select",   icon:MousePointer2,label:"Select",  key:"V"},
    {id:"pan",      icon:Hand,         label:"Pan",     key:"H"},
    {id:"pencil",   icon:Pencil,       label:"Draw",    key:"P"},
    {id:"eraser",   icon:Eraser,       label:"Eraser",  key:"E"},
    {id:"rect",     icon:Square,       label:"Rect",    key:"R"},
    {id:"ellipse",  icon:Circle,       label:"Ellipse", key:"O"},
    {id:"diamond",  icon:Diamond,      label:"Diamond", key:""},
    {id:"triangle", icon:Triangle,     label:"Triangle",key:""},
    {id:"line",     icon:Minus,        label:"Line",    key:"L"},
    {id:"arrow",    icon:ArrowRight,   label:"Arrow",   key:"A"},
    {id:"text",     icon:Type,         label:"Text",    key:"T"},
    {id:"sticky",   icon:StickyNote,   label:"Sticky",  key:""},
  ];

  const cursor: Record<Tool,string> = {
    select:"default", pan:"grab", pencil:"crosshair", eraser:"cell",
    rect:"crosshair", roundrect:"crosshair", ellipse:"crosshair",
    diamond:"crosshair", triangle:"crosshair", line:"crosshair",
    arrow:"crosshair", text:"text", sticky:"crosshair",
  };

  // ── Shared panel style ─────────────────────────────────────
  const panelSx: React.CSSProperties = {
    background:"hsl(220,14%,96%)",
    boxShadow:"6px 6px 16px rgba(0,0,0,0.12), -4px -4px 12px rgba(255,255,255,0.8)",
    borderRadius:16, position:"absolute", zIndex:20,
  };

  return (
    <div className="relative h-full flex overflow-hidden select-none" style={{background:"hsl(220,14%,93%)"}}>

      {/* ── TOP TOOLBAR ── */}
      <div style={{...panelSx, top:12, left:"50%", transform:"translateX(-50%)", display:"flex", alignItems:"center", gap:2, padding:"5px 8px"}}>
        {tools.map((t,i)=>{
          const sep = i===2||i===4||i===8||i===10;
          return (
            <React.Fragment key={t.id}>
              {sep && <div style={{width:1,height:22,background:"#e2e8f0",margin:"0 3px"}} />}
              <button
                title={`${t.label}${t.key?" ("+t.key+")":""}`}
                onClick={()=>setTool(t.id)}
                style={{
                  width:34, height:34, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center",
                  background:"hsl(220,14%,96%)",
                  boxShadow: tool===t.id
                    ? "inset 3px 3px 6px rgba(0,0,0,0.14), inset -2px -2px 5px rgba(255,255,255,0.6)"
                    : "3px 3px 7px rgba(0,0,0,0.1), -3px -3px 7px rgba(255,255,255,0.8)",
                  color: tool===t.id ? "#f97316" : "#475569",
                  transition:"all 0.15s",
                  cursor:"pointer", border:"none",
                }}
              >
                <t.icon size={15} />
              </button>
            </React.Fragment>
          );
        })}
        <div style={{width:1,height:22,background:"#e2e8f0",margin:"0 3px"}}/>
        {/* Undo/Redo */}
        {[{icon:Undo2,fn:undo,dis:hidx<=0,tip:"Undo (Ctrl+Z)"},{icon:Redo2,fn:redo,dis:hidx>=hist.length-1,tip:"Redo (Ctrl+Y)"}].map(({icon:IC,fn,dis,tip})=>(
          <button key={tip} title={tip} onClick={fn} disabled={dis}
            style={{width:34,height:34,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",background:"hsl(220,14%,96%)",boxShadow:"3px 3px 7px rgba(0,0,0,0.1),-3px -3px 7px rgba(255,255,255,0.8)",color:dis?"#cbd5e1":"#475569",cursor:dis?"not-allowed":"pointer",border:"none",transition:"all 0.15s"}}>
            <IC size={15}/>
          </button>
        ))}
        <div style={{width:1,height:22,background:"#e2e8f0",margin:"0 3px"}}/>
        {/* AI */}
        <button title="AI Mind Map" onClick={()=>setShowAI(true)}
          style={{height:34,padding:"0 12px",borderRadius:10,display:"flex",alignItems:"center",gap:6,background:"linear-gradient(135deg,#fb923c,#f97316)",boxShadow:"3px 3px 8px rgba(0,0,0,0.12),0 0 10px rgba(249,115,22,0.25)",color:"#fff",fontWeight:700,fontSize:12,border:"none",cursor:"pointer"}}>
          {isLoading ? <Loader2 size={13} className="animate-spin"/> : <Sparkles size={13}/>}
          AI Map
        </button>
      </div>

      {/* ── LEFT PROPERTIES PANEL ── */}
      <div style={{...panelSx, left:12, top:"50%", transform:"translateY(-50%)", padding:"10px 8px", display:"flex", flexDirection:"column", gap:10}}>
        {/* Stroke */}
        <div>
          <div style={{fontSize:9,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:1,marginBottom:5,textAlign:"center"}}>Stroke</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
            {STROKE_COLORS.slice(0,8).map(c=>(
              <button key={c} onClick={()=>setSColor(c)} title={c}
                style={{width:22,height:22,borderRadius:6,background:c,border:c==="#ffffff"?"1px solid #e2e8f0":"none",cursor:"pointer",outline:sColor===c?"2.5px solid #f97316":"none",outlineOffset:1.5,transition:"all 0.1s"}}/>
            ))}
          </div>
        </div>
        <div style={{height:1,background:"#e2e8f0"}}/>

        {/* Fill */}
        <div>
          <div style={{fontSize:9,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:1,marginBottom:5,textAlign:"center"}}>Fill</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
            {FILL_COLORS.slice(0,8).map(c=>(
              <button key={c} onClick={()=>setFColor(c)} title={c==="none"?"No fill":c}
                style={{width:22,height:22,borderRadius:6,background:c==="none"?"#fff":"" + c,border:"1px solid #e2e8f0",cursor:"pointer",outline:fColor===c?"2.5px solid #f97316":"none",outlineOffset:1.5,overflow:"hidden",position:"relative",transition:"all 0.1s"}}>
                {c==="none" && <div style={{position:"absolute",top:"50%",left:0,right:0,height:1.5,background:"#ef4444",transform:"rotate(-45deg)"}}/>}
              </button>
            ))}
          </div>
        </div>
        <div style={{height:1,background:"#e2e8f0"}}/>

        {/* Width */}
        <div>
          <div style={{fontSize:9,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:1,marginBottom:5,textAlign:"center"}}>Width</div>
          <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"center"}}>
            {WIDTHS.map(w=>(
              <button key={w} onClick={()=>setSWidth(w)} title={`${w}px`}
                style={{width:40,height:20,borderRadius:6,background:"hsl(220,14%,96%)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:sWidth===w?"inset 2px 2px 5px rgba(0,0,0,0.12)":"2px 2px 5px rgba(0,0,0,0.08),-2px -2px 5px rgba(255,255,255,0.8)"}}>
                <div style={{height:Math.min(w,4),width:26,background:sWidth===w?"#f97316":"#94a3b8",borderRadius:2}}/>
              </button>
            ))}
          </div>
        </div>
        <div style={{height:1,background:"#e2e8f0"}}/>

        {/* Stroke style */}
        <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"center"}}>
          {(["solid","dashed","dotted"] as StrokeStyle[]).map(s=>(
            <button key={s} onClick={()=>setSStyle(s)} title={s}
              style={{width:40,height:20,borderRadius:6,background:"hsl(220,14%,96%)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:sStyle===s?"inset 2px 2px 5px rgba(0,0,0,0.12)":"2px 2px 5px rgba(0,0,0,0.08),-2px -2px 5px rgba(255,255,255,0.8)"}}>
              <div style={{width:26,height:0,borderTop:`2px ${s==="dotted"?"dotted":s==="dashed"?"dashed":"solid"} ${sStyle===s?"#f97316":"#94a3b8"}`}}/>
            </button>
          ))}
        </div>
      </div>

      {/* ── RIGHT ACTIONS ── */}
      <div style={{...panelSx, right:12, top:"50%", transform:"translateY(-50%)", padding:"8px 6px", display:"flex", flexDirection:"column", gap:6, alignItems:"center"}}>
        {[
          {icon:ZoomIn,  fn:()=>setZoom(z=>Math.min(5,z*1.2)),  tip:"Zoom In"},
          {icon:ZoomOut, fn:()=>setZoom(z=>Math.max(0.1,z*0.8)),tip:"Zoom Out"},
          {icon:Maximize2, fn:()=>{setPan({x:0,y:0});setZoom(1);}, tip:"Reset view"},
        ].map(({icon:IC,fn,tip})=>(
          <button key={tip} title={tip} onClick={fn}
            style={{width:30,height:30,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",background:"hsl(220,14%,96%)",boxShadow:"2px 2px 6px rgba(0,0,0,0.1),-2px -2px 6px rgba(255,255,255,0.8)",color:"#475569",border:"none",cursor:"pointer"}}>
            <IC size={13}/>
          </button>
        ))}
        <div style={{fontSize:9,fontWeight:700,color:"#94a3b8"}}>{Math.round(zoom*100)}%</div>
        <div style={{height:1,width:24,background:"#e2e8f0"}}/>
        <button title="Toggle grid" onClick={()=>setShowGrid(v=>!v)}
          style={{width:30,height:30,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",background:"hsl(220,14%,96%)",boxShadow:showGrid?"inset 2px 2px 5px rgba(0,0,0,0.12)":"2px 2px 6px rgba(0,0,0,0.1),-2px -2px 6px rgba(255,255,255,0.8)",color:showGrid?"#f97316":"#94a3b8",border:"none",cursor:"pointer",fontSize:12,fontWeight:700}}>
          ⋮⋮
        </button>
        <div style={{height:1,width:24,background:"#e2e8f0"}}/>
        <button title="Export PNG" onClick={exportPNG}
          style={{width:30,height:30,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",background:"hsl(220,14%,96%)",boxShadow:"2px 2px 6px rgba(0,0,0,0.1),-2px -2px 6px rgba(255,255,255,0.8)",color:"#475569",border:"none",cursor:"pointer"}}>
          <Download size={13}/>
        </button>
        <button title="Clear all" onClick={clearAll}
          style={{width:30,height:30,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",background:"hsl(220,14%,96%)",boxShadow:"2px 2px 6px rgba(0,0,0,0.1),-2px -2px 6px rgba(255,255,255,0.8)",color:"#f87171",border:"none",cursor:"pointer"}}>
          <Trash2 size={13}/>
        </button>
      </div>

      {/* ── CANVAS ── */}
      <div ref={wrap} className="absolute inset-0">
        <canvas
          ref={cvs}
          style={{width:"100%",height:"100%",cursor:drawing.current&&tool==="pan"?"grabbing":cursor[tool],touchAction:"none"}}
          onMouseDown={onPointerDown as any}
          onMouseMove={onPointerMove as any}
          onMouseUp={onPointerUp}
          onMouseLeave={onPointerUp}
          onTouchStart={onPointerDown as any}
          onTouchMove={onPointerMove as any}
          onTouchEnd={onPointerUp}
        />
      </div>

      {/* ── STATUS BAR ── */}
      <div style={{...panelSx,bottom:12,left:"50%",transform:"translateX(-50%)",padding:"5px 14px",display:"flex",gap:10,fontSize:11,color:"#64748b"}}>
        <span>{els.length} element{els.length!==1?"s":""}</span>
        <span style={{opacity:0.3}}>|</span>
        <span>{Math.round(zoom*100)}%</span>
        <span style={{opacity:0.3}}>|</span>
        <span className="capitalize">{tool}</span>
        {selIds.size>0 && <><span style={{opacity:0.3}}>|</span><span style={{color:"#3b82f6"}}>{selIds.size} selected</span></>}
      </div>

      {/* ── AI MODAL ── */}
      {showAI && (
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center"}}
          onClick={()=>setShowAI(false)}>
          <div style={{...panelSx,position:"relative",width:420,padding:28}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
              <div style={{width:42,height:42,borderRadius:12,background:"linear-gradient(135deg,#fb923c,#f97316)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 14px rgba(249,115,22,0.35)"}}>
                <Sparkles size={20} color="#fff"/>
              </div>
              <div>
                <div style={{fontWeight:700,fontSize:15,color:"#0f172a"}}>AI Mind Map</div>
                <div style={{fontSize:12,color:"#94a3b8"}}>Generate a radial mind map instantly</div>
              </div>
            </div>
            <input autoFocus value={aiTopic} onChange={e=>setAiTopic(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handleAI()}
              placeholder="e.g. Photosynthesis, Machine Learning, WW2…"
              style={{width:"100%",padding:"12px 16px",borderRadius:12,fontSize:14,color:"#0f172a",border:"none",outline:"none",boxSizing:"border-box",marginBottom:16,background:"hsl(220,14%,96%)",boxShadow:"inset 3px 3px 7px rgba(0,0,0,0.11),inset -3px -3px 7px rgba(255,255,255,0.6)"}}/>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button onClick={()=>setShowAI(false)}
                style={{padding:"9px 18px",borderRadius:10,border:"none",cursor:"pointer",background:"hsl(220,14%,96%)",boxShadow:"3px 3px 7px rgba(0,0,0,0.1),-3px -3px 7px rgba(255,255,255,0.8)",color:"#475569",fontWeight:600,fontSize:13}}>
                Cancel
              </button>
              <button onClick={handleAI} disabled={!aiTopic.trim()||isLoading}
                style={{padding:"9px 20px",borderRadius:10,border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:7,background:"linear-gradient(135deg,#fb923c,#f97316)",color:"#fff",fontWeight:700,fontSize:13,boxShadow:"3px 3px 8px rgba(0,0,0,0.12),0 0 12px rgba(249,115,22,0.3)",opacity:(!aiTopic.trim()||isLoading)?0.5:1}}>
                {isLoading?<Loader2 size={14} className="animate-spin"/>:<Sparkles size={14}/>} Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
