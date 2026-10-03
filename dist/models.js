import * as THREE from './assets/three.module.js';
import {OrbitControls} from './assets/OrbitControls.js';
const stage=document.getElementById('model-stage');
const media=window.matchMedia('(prefers-reduced-motion: reduce)');
const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.7));
renderer.setClearColor(0x000000,0);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.5;
stage.appendChild(renderer.domElement);
const fallback=stage.querySelector('img');if(fallback)fallback.hidden=true;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(36,1,.1,100);camera.position.set(0,1.5,9.7);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.07;controls.enablePan=false;controls.minDistance=6;controls.maxDistance=14;controls.autoRotate=!media.matches;controls.autoRotateSpeed=.9;controls.target.set(0,0,0);controls.enableZoom=false;
// Zoom is intentional with Ctrl/Command + wheel so normal scrolling remains available.
renderer.domElement.addEventListener('wheel',e=>{if(e.ctrlKey||e.metaKey){e.preventDefault();const d=camera.position.length();camera.position.multiplyScalar(Math.max(6,Math.min(14,d+e.deltaY*.01))/d)}},{passive:false});
renderer.domElement.style.touchAction='pan-y';controls.touches.ONE=THREE.TOUCH.ROTATE;
document.querySelector('.drag-hint').innerHTML='<i data-lucide="hand"></i> Drag to rotate <span class="zoom-hint">· Ctrl/⌘ + scroll to zoom</span> · Arrow keys to turn';
scene.add(new THREE.AmbientLight(0xd9fff3,2));
const light=new THREE.DirectionalLight(0xffffff,4);light.position.set(-3,5,4);scene.add(light);
const rim=new THREE.PointLight(0xa9edc4,35);rim.position.set(4,-1,1);scene.add(rim);
const limeLight=new THREE.PointLight(0xd5fa71,30);limeLight.position.set(-3,1,-1);scene.add(limeLight);
const network=new THREE.Group();network.rotation.set(-.18,.1,.1);scene.add(network);
const mats={node:new THREE.MeshStandardMaterial({color:0xc7ead6,metalness:.55,roughness:.24,emissive:0x355b3b,emissiveIntensity:.35}),lime:new THREE.MeshStandardMaterial({color:0xd5fa71,metalness:.2,roughness:.25,emissive:0x789b2d,emissiveIntensity:.35}),core:new THREE.MeshPhysicalMaterial({color:0x3d8c79,metalness:.7,roughness:.17,clearcoat:1,transparent:true,opacity:.78})};
const core=new THREE.Mesh(new THREE.IcosahedronGeometry(1.25,1),mats.core);network.add(core);
const coreEdges=new THREE.LineSegments(new THREE.EdgesGeometry(core.geometry),new THREE.LineBasicMaterial({color:0xa3d6ab,transparent:true,opacity:.4}));network.add(coreEdges);
const points=[];const count=155;const golden=Math.PI*(3-Math.sqrt(5));
for(let i=0;i<count;i++){const y=1-(i/(count-1))*2;const radius=Math.sqrt(1-y*y);const theta=golden*i;const p=new THREE.Vector3(Math.cos(theta)*radius*2.35,y*2.25,Math.sin(theta)*radius*2.35);points.push(p)}
const nodeGeom=new THREE.SphereGeometry(.038,9,8);const instance=new THREE.InstancedMesh(nodeGeom,mats.node,count);const dummy=new THREE.Object3D();points.forEach((p,i)=>{dummy.position.copy(p);dummy.scale.setScalar(i%7===0?1.8:1);dummy.updateMatrix();instance.setMatrixAt(i,dummy.matrix)});network.add(instance);
const linePos=[];for(let i=0;i<count;i++){for(let j=i+1;j<count;j++){const dist=points[i].distanceTo(points[j]);if(dist<.78){linePos.push(...points[i].toArray(),...points[j].toArray())}}}
const lines=new THREE.BufferGeometry();lines.setAttribute('position',new THREE.Float32BufferAttribute(linePos,3));network.add(new THREE.LineSegments(lines,new THREE.LineBasicMaterial({color:0x91c8a8,transparent:true,opacity:.34})));
const satellites=[];
for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(2.64+i*.09,.009,6,160),new THREE.MeshBasicMaterial({color:i===1?0xd5fa71:0x6ba18c,transparent:true,opacity:i===1?.58:.35}));ring.rotation.set(i*.78+.5,i*.9,.2);network.add(ring);const sat=new THREE.Mesh(new THREE.SphereGeometry(.07,16,12),mats.lime);ring.add(sat);sat.position.set(2.64+i*.09,0,0);satellites.push(ring)}
const dustGeometry=new THREE.BufferGeometry();const dust=[];for(let i=0;i<90;i++){const a=i*golden;const z=(i/count-.3)*6;dust.push(Math.cos(a)*(3.3+(i%5)*.2),Math.sin(a)*(2.6+(i%3)*.2),z)}dustGeometry.setAttribute('position',new THREE.Float32BufferAttribute(dust,3));const particles=new THREE.Points(dustGeometry,new THREE.PointsMaterial({color:0xb8dbb2,size:.018,transparent:true,opacity:.55}));scene.add(particles);
const processor=new THREE.Group();processor.rotation.set(.48,.5,.12);processor.visible=false;scene.add(processor);
function box(w,h,d,mat,x=0,y=0,z=0){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);processor.add(mesh);return mesh}
const pcb=new THREE.MeshStandardMaterial({color:0x193d34,metalness:.5,roughness:.42});const silver=new THREE.MeshStandardMaterial({color:0x9daea5,metalness:.8,roughness:.23});
box(3.6,.12,3.6,pcb,0,-.5,0);box(2.45,.35,2.45,mats.core,0,-.18,0);box(2.05,.14,2.05,silver,0,.07,0);const chipTop=box(1.85,.08,1.85,mats.core,0,.18,0);
for(let side=0;side<4;side++)for(let i=0;i<10;i++){const pin=new THREE.Mesh(new THREE.BoxGeometry(.13,.10,.46),silver);const local=new THREE.Vector3(-1.06+i*.235,-.14,1.43);local.applyAxisAngle(new THREE.Vector3(0,1,0),side*Math.PI/2);pin.position.copy(local);pin.rotation.y=side*Math.PI/2;processor.add(pin)}
for(let x=0;x<5;x++)for(let z=0;z<5;z++)box(.25,.03,.25,(x+z)%3===0?mats.lime:mats.node,-.65+x*.325,.245,-.65+z*.325);
const tracePos=[];for(let i=0;i<12;i++){let t=-1.5+i*.27;tracePos.push(t,-.425,1.18,t,-.425,1.65);tracePos.push(t,-.425,-1.18,t,-.425,-1.65);tracePos.push(1.18,-.425,t,1.65,-.425,t);tracePos.push(-1.18,-.425,t,-1.65,-.425,t)}const traces=new THREE.BufferGeometry();traces.setAttribute('position',new THREE.Float32BufferAttribute(tracePos,3));processor.add(new THREE.LineSegments(traces,new THREE.LineBasicMaterial({color:0xd5fa71,transparent:true,opacity:.55})));
const frame=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(3.85,1.5,3.85)),new THREE.LineBasicMaterial({color:0x9bbea3,transparent:true,opacity:.17}));frame.position.y=.1;processor.add(frame);
const bitGroup=new THREE.Group();processor.add(bitGroup);for(let i=0;i<9;i++){const m=new THREE.Mesh(new THREE.OctahedronGeometry(.065),mats.lime);m.position.set(Math.sin(i*2.7)*1.1,1+(i%3)*.26,Math.cos(i*2.7)*1.1);bitGroup.add(m)}
let model='network',active=true,playing=!media.matches;const clock=new THREE.Clock();
const rotationButton=document.getElementById('rotation');function syncPlay(){controls.autoRotate=playing;rotationButton.setAttribute('aria-label',playing?'Pause model rotation':'Play model rotation');rotationButton.title=playing?'Pause rotation':'Play rotation';rotationButton.innerHTML=`<i data-lucide="${playing?'pause':'play'}"></i>`;window.lucide?.createIcons()};syncPlay();
rotationButton.addEventListener('click',()=>{playing=!playing;syncPlay()});
media.addEventListener('change',e=>{if(e.matches){playing=false;syncPlay()}});
function reset(){camera.position.set(0,1.5,stage.clientWidth<stage.clientHeight?12:9.7);controls.target.set(0,0,0);network.rotation.set(-.18,.1,.1);processor.rotation.set(.48,.5,.12);controls.update()}
document.getElementById('reset-model').addEventListener('click',reset);
document.querySelectorAll('[data-model]').forEach(button=>button.addEventListener('click',()=>{model=button.dataset.model;network.visible=model==='network';processor.visible=model==='processor';document.querySelectorAll('[data-model]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button))});document.querySelector('.model-meta>span').textContent=model==='network'?'01 / THE CONNECTED MIND':'02 / THE COMPUTING CORE';document.querySelector('.model-note').innerHTML=model==='network'?'<span class="note-line"></span>Ideas connect.<br>Understanding grows.':'<span class="note-line"></span>Patterns become predictions.<br>People check the meaning.';stage.setAttribute('aria-label',`Interactive 3D ${model==='network'?'neural network':'AI processor'}. Drag to rotate or use arrow keys.`);reset()}));
stage.addEventListener('keydown',e=>{const group=model==='network'?network:processor;if(e.key==='ArrowLeft')group.rotation.y-=.15;else if(e.key==='ArrowRight')group.rotation.y+=.15;else if(e.key==='ArrowUp')group.rotation.x-=.15;else if(e.key==='ArrowDown')group.rotation.x+=.15;else if(e.key==='+'||e.key==='=')camera.position.multiplyScalar(.95);else if(e.key==='-')camera.position.multiplyScalar(1.05);else return;e.preventDefault()});
function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.position.set(0,1.5,w<h?12:9.7);camera.updateProjectionMatrix()}new ResizeObserver(resize).observe(stage);resize();
new IntersectionObserver(entries=>{active=entries[0].isIntersecting},{rootMargin:'100px'}).observe(stage);
renderer.setAnimationLoop(()=>{const delta=Math.min(clock.getDelta(),.05);if(document.hidden||!active)return;if(playing){satellites.forEach((s,i)=>s.rotation.z+=delta*.05*(i+1));core.rotation.y+=delta*.06;coreEdges.rotation.y=core.rotation.y;bitGroup.rotation.y+=delta*.14;particles.rotation.y+=delta*.012}controls.update(delta);renderer.render(scene,camera)});
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();if(fallback)fallback.hidden=false;document.querySelector('.drag-hint').textContent='3D rendering paused by this device. Reload to restore.'});
