/**
 * GLSL de la escena. Portado de docs/art/prototypes/signal.html (partículas)
 * y megastructure.html (estructura, niebla y haces).
 */

/* ------------------------------------------------------------------ */
/* Partículas (SIGNAL)                                                 */
/* ------------------------------------------------------------------ */

const NOISE = /* glsl */ `
float hash12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
float h13(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
vec4 noised(vec3 x){
  vec3 i=floor(x),f=fract(x);
  vec3 u=f*f*f*(f*(f*6.-15.)+10.);
  vec3 du=30.*f*f*(f*(f-2.)+1.);
  float a=h13(i),b=h13(i+vec3(1,0,0)),c=h13(i+vec3(0,1,0)),d=h13(i+vec3(1,1,0));
  float e=h13(i+vec3(0,0,1)),g=h13(i+vec3(1,0,1)),h=h13(i+vec3(0,1,1)),k=h13(i+vec3(1,1,1));
  float k0=a,k1=b-a,k2=c-a,k3=e-a,k4=a-b-c+d,k5=a-c-e+h,k6=a-b-e+g,k7=-a+b+c-d+e-g-h+k;
  return vec4(k0+k1*u.x+k2*u.y+k3*u.z+k4*u.x*u.y+k5*u.y*u.z+k6*u.z*u.x+k7*u.x*u.y*u.z,
    du*vec3(k1+k4*u.y+k6*u.z+k7*u.y*u.z,k2+k5*u.z+k4*u.x+k7*u.z*u.x,k3+k6*u.x+k5*u.y+k7*u.x*u.y));
}
vec3 curl(vec3 p){
  vec3 gx=noised(p).yzw;
  vec3 gy=noised(p+vec3(31.4,17.2,9.1)).yzw;
  vec3 gz=noised(p+vec3(-12.3,41.7,23.9)).yzw;
  return vec3(gz.y-gy.z,gx.z-gz.x,gy.x-gx.y);
}`;

/** Velocidad: campo laminar + curl, muelle a la figura, repulsor/vórtice/estela del puntero. */
export const VELOCITY_FRAG = /* glsl */ `
uniform float uTime,uDt,uAssemble,uMorph,uFlow,uScrollV,uPress,uMouseOn,uMouseR;
uniform float uFlowAngle,uCurl,uSpeed,uHot,uTrail;
uniform vec3 uMouse; uniform vec2 uMouseVel,uView; uniform sampler2D tA,tB;
${NOISE}
void main(){
  vec2 uv=gl_FragCoord.xy/resolution.xy;
  vec3 p=texture2D(texturePosition,uv).xyz;
  vec3 v=texture2D(textureVelocity,uv).xyz;
  float r=hash12(uv*437.1+3.7);
  float m=clamp(uMorph*1.8-r*.8,0.,1.); m=m*m*(3.-2.*m);
  vec3 tn=mix(texture2D(tA,uv).xyz,texture2D(tB,uv).xyz,m);
  vec3 tgt=vec3(tn.xy*uView,tn.z);
  float A0=uAssemble*(1.-clamp(uFlow,0.,1.)*.9);
  float asmb=clamp(A0*1.7-r*.7,0.,1.); asmb=asmb*asmb*(3.-2.*asmb);

  vec2 dir=vec2(cos(uFlowAngle),sin(uFlowAngle)); vec2 nrm=vec2(-dir.y,dir.x);
  float s=dot(p.xy,nrm), l=dot(p.xy,dir);
  float lane=.65+.55*sin(s*1.7+sin(l*.35+uTime*.3)*1.2);
  vec3 F=vec3(dir*lane*uSpeed+nrm*sin(l*.5+uTime*.5+s*.3)*.8,0.);
  F+=curl(p*.3+vec3(0.,0.,uTime*.08))*uCurl*1.4;
  F.y+=uScrollV*9.;
  F.z-=p.z*.4;
  vec3 acc=(F-v)*2.2*(1.-asmb);

  acc+=(tgt-p)*30.*asmb;
  acc+=curl(p*1.3+vec3(0.,0.,uTime*.15))*(1.6+90.*uHot)*asmb;

  vec3 d=p-uMouse; d.z*=.3;
  float R=uMouseR*(1.+uPress*.8);
  float dist=length(d);
  float fall=exp(-(dist*dist)/(R*R)*1.5)*uMouseOn;
  vec3 dn=d/(dist+1e-3);
  acc+=dn*fall*230.*(1.-uPress*.85);
  acc+=vec3(-dn.y,dn.x,0.)*fall*(uPress*170.+length(uMouseVel)*5.*uTrail);
  acc-=dn*fall*uPress*70.;
  acc+=vec3(uMouseVel,0.)*fall*4.5*uTrail;

  v+=acc*uDt;
  v*=1.-min(mix(.5,5.4,asmb)*uDt,.9);
  float sp=length(v); if(sp>24.) v*=24./sp;
  gl_FragColor=vec4(v,1.);
}`;

export const POSITION_FRAG = /* glsl */ `
uniform float uDt; uniform vec3 uBound;
void main(){
  vec2 uv=gl_FragCoord.xy/resolution.xy;
  vec3 q=texture2D(texturePosition,uv).xyz;
  vec3 v=texture2D(textureVelocity,uv).xyz;
  vec3 p=q+v*uDt;
  p=mod(p+uBound,2.*uBound)-uBound;
  gl_FragColor=vec4(p,1.);
}`;

/** Color en reposo = --ink; con velocidad y calor, el color de señal (uSig). */
export const POINTS_VERT = /* glsl */ `
uniform sampler2D tPos,tVel; uniform float uPx,uGain,uHot,uAcid,uDepth; uniform vec3 uSig;
attribute vec2 aRef; varying vec3 vC; varying float vA;
void main(){
  vec3 p=texture2D(tPos,aRef).xyz; vec3 v=texture2D(tVel,aRef).xyz;
  vec4 mv=modelViewMatrix*vec4(p,1.);
  gl_Position=projectionMatrix*mv;
  float sp=length(v);
  float t=smoothstep(.6,9.,sp);
  float h=fract(sin(dot(aRef,vec2(12.9898,78.233)))*43758.5453);
  t=clamp(t+uHot*step(h,.45)+uAcid*step(h,.16),0.,1.);
  vC=mix(vec3(.91,.941,.949),uSig,t);
  gl_PointSize=clamp(uPx*(1.55+1.7*t)*(uDepth/max(-mv.z,.1)),1.,16.);
  vA=uGain*(.85+.5*t)*clamp(1.2-abs(p.z)*.1,.3,1.);
}`;

export const POINTS_FRAG = /* glsl */ `
varying vec3 vC; varying float vA;
void main(){
  float d=length(gl_PointCoord-.5);
  if(d>.5) discard;
  float a=smoothstep(.5,.05,d);
  gl_FragColor=vec4(vC*a*vA,1.);
}`;

/* ------------------------------------------------------------------ */
/* Atmósfera (MEGASTRUCTURE)                                           */
/* ------------------------------------------------------------------ */

export const FULLSCREEN_VERT = /* glsl */ `
varying vec2 vUv;
void main(){ vUv=position.xy*.5+.5; gl_Position=vec4(position.xy,0.,1.); }`;

/**
 * Estructura: retícula de vigas y bloques huecos en la lejanía, con niebla y haz de linterna.
 * Se renderiza a media resolución (o menos) y luego se compone con STRUCTURE_COMPOSITE_FRAG.
 */
export const STRUCTURE_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec2 uRes;
uniform float uTime,uBlk,uDens,uCross,uBeam,uFog,uWarm,uLamp,uFlash,uSigMix,uRhythm,uFl,uDim;
uniform int uSteps;
uniform vec3 uRo,uAng,uSigCol,uTint;
uniform vec2 uMouse;

const vec3 UV=vec3(0.482,0.361,1.0);
const vec3 CORAL=vec3(1.0,0.302,0.18);
const vec3 C0=vec3(0.082,0.075,0.122);
const vec3 C1=vec3(0.165,0.149,0.251);

float gT; float gS;
vec3 gLo; vec3 gLd;

float hash13(vec3 p){p=fract(p*0.1031);p+=dot(p,p.zyx+31.32);return fract((p.x+p.y)*p.z);}
float hash11(float n){return fract(sin(n*127.1)*43758.5453);}
float box2(vec2 v,float k){vec2 w=abs(v)-k;return length(max(w,0.0))+min(max(w.x,w.y),0.0);}
float sdBox(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.0))+min(max(q.x,max(q.y,q.z)),0.0);}
vec2 pathXY(float z){return vec2(sin(z*0.045)*1.6+sin(z*0.11)*0.6,cos(z*0.037)*0.8);}

vec3 tubeCol(vec3 p){
  vec3 cell=floor((p+4.0)/8.0);
  float hc=hash13(cell+vec3(11.0,5.0,2.0));
  vec3 base=mix(UV,CORAL,step(hc,0.03+uWarm*0.5));
  base=mix(base,uSigCol,uSigMix);
  float tt=uTime*uRhythm;
  float pulse=0.65+0.35*sin(p.z*0.35-tt*6.2832);
  float idle=0.82+0.18*sin(uTime*0.9+hc*6.2832);
  return base*mix(idle,pulse,uSigMix);
}

float map(vec3 p){
  vec2 pa=pathXY(p.z);
  vec3 q=vec3(p.x-pa.x,p.y-pa.y,0.0);
  vec3 g=(p+4.0)/8.0;
  vec3 c=floor(g);
  vec3 l=(fract(g)-0.5)*8.0;
  vec3 cid=c+(step(0.0,l)-0.5);
  float h=hash13(c);
  float h2=hash13(c+vec3(7.3,1.9,4.1));
  float cw=2.6+0.5*sin(p.z*0.13);
  float corr=sdBox(q,vec3(cw,2.5,1.0));

  float d=1e3;
  if(h2<uDens){
    float s=uBlk*4.0;
    d=sdBox(l,vec3(s));
    float k=s*uCross*(0.75+0.5*h);
    float cr=min(min(box2(l.xy,k),box2(l.yz,k)),box2(l.zx,k));
    d=max(d,-cr);
    d=max(d,-corr);
    vec3 bq=vec3(q.x,q.y,l.z);
    float m=mod(c.z,3.0);
    float bay=m<0.5?sdBox(bq-vec3(-(cw+1.2),0.0,0.0),vec3(2.6,2.3,2.7))
            :(m<1.5?sdBox(bq-vec3(cw+1.2,0.0,0.0),vec3(2.6,2.3,2.7))
                   :sdBox(bq-vec3(0.0,3.7,0.0),vec3(2.4,2.8,2.4)));
    d=max(d,-bay);
  }

  float bt=uBeam;
  float a=4.0-abs(l.x),b=4.0-abs(l.y),e=4.0-abs(l.z);
  float gz=hash13(vec3(cid.x,cid.y,c.z)+vec3(1.0,0.0,0.0))<0.55?0.0:1e3;
  float gx=hash13(vec3(c.x,cid.y,cid.z)+vec3(0.0,2.0,0.0))<0.45?0.0:1e3;
  float gy=hash13(vec3(cid.x,c.y,cid.z)+vec3(0.0,0.0,3.0))<0.45?0.0:1e3;
  float bz=box2(vec2(a,b),bt)+gz;
  float bx=box2(vec2(b,e),bt)+gx;
  float by=box2(vec2(a,e),bt)+gy;
  float bm=max(min(bz,min(bx,by)),-corr);

  float gl=hash11(cid.z*3.7+1.3)<0.5?0.0:1e3;
  float lin=sdBox(vec3(q.x,q.y-2.7,e),vec3(cw+1.6,0.18,0.45))+gl;
  float walk=sdBox(vec3(q.x,q.y+2.45,0.0),vec3(2.3,0.12,1.0));
  float s2=min(min(d,bm),min(lin,walk));

  float tw=sdBox(vec3(abs(q.x)-2.15,q.y+2.3,0.0),vec3(0.05,0.05,1.0));
  float tl=sdBox(vec3(q.x,q.y-2.5,e),vec3(cw+1.6,0.04,0.12))+gl;
  float blz=sdBox(vec3(a,b,0.0),vec3(0.05,bt+0.03,1.0))+gz;
  float blx=sdBox(vec3(0.0,b,e),vec3(1.0,0.05,bt+0.03))+gx;
  float bl=max(min(blz,blx),-corr);
  float t2=min(min(tw,tl),bl);

  gS=s2; gT=t2;
  return min(s2,t2);
}

vec3 calcN(vec3 p){
  vec2 e=vec2(1.0,-1.0)*0.0022;
  return normalize(e.xyy*map(p+e.xyy)+e.yyx*map(p+e.yyx)+e.yxy*map(p+e.yxy)+e.xxx*map(p+e.xxx));
}

float spotAt(vec3 p,out float dist){
  vec3 v=p-gLo; dist=length(v);
  float cs=dot(v/max(dist,1e-3),gLd);
  return smoothstep(0.80-uFlash*0.25,0.95,cs);
}

void main(){
  vec2 uv=(gl_FragCoord.xy-0.5*uRes)/uRes.y;
  vec3 ro=uRo;
  float cy=cos(uAng.x),sy=sin(uAng.x),cp=cos(uAng.y),sp=sin(uAng.y);
  vec3 ww=normalize(vec3(sy*cp,sp,cy*cp));
  vec3 uu=normalize(cross(vec3(sin(uAng.z),cos(uAng.z),0.0),ww));
  vec3 vv=cross(ww,uu);
  vec3 rd=normalize(uv.x*uu+uv.y*vv+uFl*ww);
  gLd=normalize(uMouse.x*uu+uMouse.y*vv+uFl*ww);
  gLo=ro-vv*0.3+uu*0.35;
  vec3 fogCol=uTint;
  float lampK=uLamp*(1.0+uFlash*2.0);

  float dith=hash13(vec3(gl_FragCoord.xy,uTime*60.0));
  float t=0.25+dith*0.25;
  vec3 glow=vec3(0.0); float beam=0.0;
  bool hit=false; vec3 p=ro;
  for(int i=0;i<64;i++){
    if(i>=uSteps) break;
    p=ro+rd*t;
    float d=map(p);
    float dt=clamp(d,0.03,0.9);
    if(gT<5.0){glow+=tubeCol(p)*(1.0/(1.0+gT*gT*50.0))*dt*0.7;}
    float sd; float sp2=spotAt(p,sd);
    beam+=sp2*exp(-sd*0.035)*dt*0.05;
    if(d<0.0012*t+0.0008){hit=true;break;}
    t+=d*0.85;
    if(t>70.0) break;
  }

  vec3 col=fogCol;
  if(hit){
    vec3 n=calcN(p);
    bool em=gT<gS;
    vec3 tc=tubeCol(p);
    float gtp=gT;
    float occ=0.0,sca=1.0;
    for(int k=1;k<5;k++){float hh=0.14*float(k);float od=map(p+n*hh);occ+=(hh-od)*sca;sca*=0.7;}
    float ao=clamp(1.0-1.6*occ,0.0,1.0);
    if(em){
      col=tc*2.4;
    }else{
      vec3 cc=floor((p+4.0)/8.0);
      float m=clamp(hash13(cc)*0.6+max(n.y,0.0)*0.4,0.0,1.0);
      vec3 alb=mix(C0,C1,m);
      vec3 amb=vec3(0.30,0.27,0.46);
      vec3 tubeLit=tc*1.6/(1.0+gtp*gtp*2.5)*ao;
      vec3 tolh=gLo-p; float dl=length(tolh); vec3 L=tolh/dl;
      float diff=max(dot(n,L),0.0);
      float cs=dot(-L,gLd);
      float cone=smoothstep(0.80-uFlash*0.25,0.95,cs);
      float att=1.0/(1.0+dl*dl*0.012);
      vec3 H=normalize(L-rd);
      float spec=pow(max(dot(n,H),0.0),28.0)*0.5;
      vec3 spotC=vec3(1.0,0.94,0.86)*cone*att*(diff*1.5+spec)*lampK*1.5;
      float hd=length(ro-p); vec3 Lh=(ro-p)/hd;
      vec3 headC=vec3(0.55,0.5,0.8)*max(dot(n,Lh),0.0)/(1.0+hd*hd*0.03)*0.35;
      col=alb*(amb*ao+tubeLit*1.3+spotC+headC);
      col+=tc*0.04/(1.0+gtp*gtp*40.0);
    }
    col=mix(fogCol,col,exp(-t*uFog));
  }
  col+=glow;
  col+=vec3(1.0,0.94,0.86)*beam*lampK*0.9;
  col=col*(1.0+col*0.25)/(1.0+col);
  gl_FragColor=vec4(mix(fogCol,col,uDim),1.0);
}`;

/** Composición de la estructura al lienzo: aberración mínima, viñeta, grano y encendido. */
export const STRUCTURE_COMPOSITE_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D tMap;
uniform vec2 uRes;
uniform float uBoot,uTime;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
void main(){
  vec2 c=vUv-0.5;
  float r=length(c*vec2(uRes.x/uRes.y,1.0));
  vec2 off=c*0.0045*(0.4+r);
  vec3 col=vec3(texture2D(tMap,vUv+off).r,texture2D(tMap,vUv).g,texture2D(tMap,vUv-off).b);
  col*=mix(0.55,1.0,smoothstep(1.25,0.3,r));
  col*=smoothstep(0.0,1.0,uBoot);
  col+=(h21(vUv*uRes+fract(uTime)*91.0)-0.5)*0.03;
  gl_FragColor=vec4(max(col,0.0),1.0);
}`;

/** T1: solo niebla, tinte y tres haces suaves, sin raymarching. */
export const FOG_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec2 uRes;
uniform vec3 uTint;
uniform float uTime,uFog,uBeam,uYaw,uBoot;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
void main(){
  vec2 c=vUv-0.5; c.x*=uRes.x/uRes.y;
  float r=length(c);
  vec3 col=uTint*2.4*(1.5-r*1.1)*exp(-r*r*uFog*6.0);
  float slant=0.35+uYaw*2.0;
  for(int i=0;i<3;i++){
    float fi=float(i);
    float x=c.x-c.y*slant-(fi-1.0)*0.42-sin(uTime*0.12+fi*2.1)*0.05;
    float w=exp(-x*x*70.0)*(0.55+0.45*sin(uTime*0.2+fi*1.7));
    col+=vec3(0.482,0.361,1.0)*w*uBeam*0.3*(1.0-vUv.y*0.6);
  }
  col*=smoothstep(0.0,1.0,uBoot);
  col+=(h21(vUv*uRes+fract(uTime)*91.0)-0.5)*0.012;
  gl_FragColor=vec4(max(col,0.0),1.0);
}`;
