(function(root,factory){const api=factory(root.THREE,root.EmberglassData);if(typeof module==='object'&&module.exports)module.exports=api;else root.EmberglassScene=api;})(typeof globalThis!=='undefined'?globalThis:this,function(THREE,Data){
  'use strict';
  function create(mount){
    if(!THREE)throw new Error('Three.js is required');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene=new THREE.Scene();scene.background=new THREE.Color(0x100d12);scene.fog=new THREE.FogExp2(0x100d12,.021);
    const camera=new THREE.PerspectiveCamera(39,1,.1,140);camera.position.set(18,13,22);
    let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});}catch(error){mount.innerHTML='<div style="padding:30px;color:#eee;font-family:system-ui">WebGL could not start on this device.</div>';throw error}
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;mount.appendChild(renderer.domElement);
    const world=new THREE.Group();scene.add(world);let meshCount=0,triangles=0;
    const count=g=>{if(g.index)triangles+=g.index.count/3;else if(g.attributes.position)triangles+=g.attributes.position.count/3;meshCount++};
    const material=(color,opts={})=>new THREE.MeshStandardMaterial({color,roughness:opts.roughness??.72,metalness:opts.metalness??.05,emissive:opts.emissive||0x000000,emissiveIntensity:opts.emissiveIntensity||0,transparent:!!opts.transparent,opacity:opts.opacity??1,side:opts.side||THREE.FrontSide});
    const MAT={obsidian:material(Data.PALETTE.obsidian,{roughness:.88}),basalt:material(Data.PALETTE.basalt,{roughness:.94}),iron:material(Data.PALETTE.iron,{metalness:.72,roughness:.34}),brass:material(Data.PALETTE.brass,{metalness:.78,roughness:.3}),cream:material(Data.PALETTE.cream,{roughness:.82}),wood:material(0x3b241b,{roughness:.84}),brick:material(0x5d2d24,{roughness:.92}),ash:material(Data.PALETTE.ash,{roughness:.95}),lava:material(Data.PALETTE.lava,{emissive:0xff2b0a,emissiveIntensity:2.8,roughness:.35}),glassShelf:material(0x9ed7d8,{transparent:true,opacity:.18,roughness:.12,metalness:.05,side:THREE.DoubleSide})};
    function mesh(geometry,mat,parent=world,cast=true,receive=true){const m=new THREE.Mesh(geometry,mat);m.castShadow=cast;m.receiveShadow=receive;parent.add(m);count(geometry);return m}
    function box(w,h,d,mat,parent=world,x=0,y=0,z=0){const m=mesh(new THREE.BoxGeometry(w,h,d),mat,parent);m.position.set(x,y,z);return m}
    function cyl(rt,rb,h,seg,mat,parent=world,x=0,y=0,z=0){const m=mesh(new THREE.CylinderGeometry(rt,rb,h,seg),mat,parent);m.position.set(x,y,z);return m}
    function sph(r,seg,mat,parent=world,x=0,y=0,z=0){const m=mesh(new THREE.SphereGeometry(r,seg,Math.max(8,seg/2)),mat,parent);m.position.set(x,y,z);return m}

    scene.add(new THREE.HemisphereLight(0x6b789b,0x2b1510,1.15));const moon=new THREE.DirectionalLight(0x9fb3e8,2.2);moon.position.set(-12,18,10);moon.castShadow=true;moon.shadow.mapSize.set(1024,1024);moon.shadow.camera.left=-18;moon.shadow.camera.right=18;moon.shadow.camera.top=18;moon.shadow.camera.bottom=-18;scene.add(moon);
    const furnaceLight=new THREE.PointLight(0xff4b16,8,24,1.7);furnaceLight.position.set(-4.9,4.2,-2);furnaceLight.castShadow=true;furnaceLight.shadow.mapSize.set(512,512);scene.add(furnaceLight);
    const lavaLight=new THREE.PointLight(0xff3610,3.4,34,2);lavaLight.position.set(0,-1,1);scene.add(lavaLight);

    // Volcanic miniature base and caldera rim.
    const base=cyl(12.8,13.8,2.2,12,MAT.obsidian,world,0,-1.6,0);base.rotation.y=.15;
    const floor=cyl(11.9,12.2,.75,12,MAT.basalt,world,0,-.35,0);floor.rotation.y=.15;
    for(let i=0;i<18;i++){const a=i/18*Math.PI*2,r=12.3+Math.sin(i*2.4)*.45,rock=mesh(new THREE.DodecahedronGeometry(1.25+(i%3)*.25,0),i%2?MAT.obsidian:MAT.basalt);rock.position.set(Math.cos(a)*r,.05+Math.sin(i)*.35,Math.sin(a)*r);rock.scale.set(1.4,1.2+Math.random()*.8,.8);rock.rotation.set(i*.31,a,i*.7)}
    const lavaCurves=[];[[[-11,.1,5],[-7,-.15,4],[-3,-.25,6],[2,-.3,5]],[[10,-.05,7],[7,-.2,4],[8,-.28,0],[4,-.3,-2]],[[1,-.15,-11],[2,-.25,-8],[0,-.3,-6],[-2,-.3,-4]]].forEach(points=>{const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));lavaCurves.push(curve);mesh(new THREE.TubeGeometry(curve,40,.26,8,false),MAT.lava)});

    // Workshop floor and frame.
    box(16,.55,11,MAT.ash,world,0,.25,0);box(16.5,.45,.7,MAT.iron,world,0,.6,-5.3);box(.65,7.2,.65,MAT.iron,world,-7.7,3.7,-5.15);box(.65,7.2,.65,MAT.iron,world,7.7,3.7,-5.15);box(16.2,.6,.65,MAT.iron,world,0,7,-5.15);
    for(let i=0;i<9;i++){const pane=box(1.45,5.6,.08,MAT.glassShelf,world,-6.55+i*1.64,3.75,-5.2);pane.castShadow=false}
    for(let i=0;i<8;i++){const beam=box(.22,6.2,.24,MAT.brass,world,-6.55+i*1.87,3.8,-5.05);beam.rotation.z=i%2?.01:-.01}

    // Furnace and brick arch.
    const furnace=new THREE.Group();furnace.position.set(-4.8,.55,-1.9);world.add(furnace);box(5.2,4.7,3.8,MAT.brick,furnace,0,2.35,0);box(5.55,.5,4.15,MAT.iron,furnace,0,.2,0);box(5.55,.4,4.15,MAT.iron,furnace,0,4.8,0);
    const throat=mesh(new THREE.CircleGeometry(1.42,36),MAT.lava,furnace);throat.position.set(0,2.35,1.91);const black=mesh(new THREE.RingGeometry(1.42,1.86,36),MAT.iron,furnace);black.position.set(0,2.35,1.96);
    for(let i=0;i<42;i++){const row=Math.floor(i/14),col=i%14,a=(col/13)*Math.PI,brick=box(.62,.34,.34,MAT.brick,furnace);brick.position.set(Math.cos(a)*(1.82+row*.38),2.35+Math.sin(a)*(1.82+row*.38),2.14);brick.rotation.z=a-Math.PI/2}
    const doorL=box(1.45,3.2,.24,MAT.iron,furnace,-1.66,2.3,2.22),doorR=box(1.45,3.2,.24,MAT.iron,furnace,1.66,2.3,2.22);doorL.rotation.y=.5;doorR.rotation.y=-.5;
    const chimney=cyl(.85,1.15,4.2,12,MAT.iron,furnace,0,7,0);for(let i=0;i<4;i++){const ring=cyl(1.02,1.02,.14,16,MAT.brass,furnace,0,5.5+i*1.05,0)}

    // Benches, shelves and glass archive.
    const bench=new THREE.Group();bench.position.set(2.6,.5,1.5);world.add(bench);box(7.3,.48,2.3,MAT.wood,bench,0,2,0);for(const x of[-3,3])for(const z of[-.85,.85])box(.42,2,.42,MAT.iron,bench,x,1,z);
    box(6.9,.12,.16,MAT.brass,bench,0,2.28,1.05);for(let i=0;i<7;i++){const tool=box(.12,.12,.9,i%2?MAT.iron:MAT.brass,bench,-2.7+i*.88,2.4,.2);tool.rotation.y=-.5+i*.13}
    const shelf=new THREE.Group();shelf.position.set(5.4,.5,-3.8);world.add(shelf);for(const y of[1.1,3.0,4.9])box(5.1,.22,1.2,MAT.wood,shelf,0,y,0);for(const x of[-2.35,2.35])box(.25,5.6,.4,MAT.iron,shelf,x,2.8,0);
    const archive=[];for(let i=0;i<14;i++){const y=[1.45,3.35,5.25][i%3],x=-1.9+(Math.floor(i/3)%5)*.95,col=[0x5ab9d0,0xea7b42,0x9c73d8,0xe0bd65][i%4],gm=new THREE.MeshPhysicalMaterial({color:col,roughness:.15,metalness:0,transmission:.35,transparent:true,opacity:.82,thickness:.7,emissive:col,emissiveIntensity:.08});const v=sph(.28+(i%3)*.06,16,gm,shelf,x,y,.15);v.scale.y=.85+(i%4)*.18;archive.push(v)}

    // Annealing kiln, coal cart, buckets, pipes.
    const kiln=new THREE.Group();kiln.position.set(-.6,.5,-3.2);world.add(kiln);box(3.0,2.6,2.3,MAT.iron,kiln,0,1.3,0);const kilnGlow=mesh(new THREE.PlaneGeometry(1.85,1.25),MAT.lava,kiln);kilnGlow.position.set(0,1.45,1.17);box(2.3,.18,.15,MAT.brass,kiln,0,2.25,1.25);
    const cart=new THREE.Group();cart.position.set(-7,.5,2.9);world.add(cart);box(2.3,1.15,1.7,MAT.iron,cart,0,1.1,0);for(const x of[-.8,.8])for(const z of[-.85,.85]){const w=cyl(.35,.35,.17,12,MAT.brass,cart,x,.45,z);w.rotation.x=Math.PI/2}for(let i=0;i<10;i++){const coal=mesh(new THREE.DodecahedronGeometry(.3,0),MAT.obsidian,cart);coal.position.set(-.7+(i%4)*.45,1.8+Math.floor(i/4)*.22,-.45+(i%2)*.7)}
    for(const x of[-1,1]){const bucket=cyl(.65,.48,.95,16,MAT.iron,world,-5.8+x*.7,.95,4.3);const handle=mesh(new THREE.TorusGeometry(.55,.05,8,20,Math.PI),MAT.brass);handle.position.set(-5.8+x*.7,1.45,4.3);handle.rotation.x=Math.PI}

    function character(colors,x,z,scale=1){
      const g=new THREE.Group();g.position.set(x,.55,z);g.scale.setScalar(scale);world.add(g);const coat=material(colors[0],{roughness:.88}),skin=material(colors[1],{roughness:.8}),hair=material(colors[2],{roughness:.95});
      cyl(.38,.48,1.25,14,coat,g,0,1.3,0);sph(.34,16,skin,g,0,2.12,0);const cap=sph(.35,14,hair,g,0,2.28,-.04);cap.scale.y=.45;
      const armL=cyl(.12,.13,.92,10,coat,g,-.48,1.5,0),armR=cyl(.12,.13,.92,10,coat,g,.48,1.5,0);armL.rotation.z=-.45;armR.rotation.z=.55;
      for(const xx of[-.22,.22])cyl(.13,.14,.9,10,MAT.iron,g,xx,.35,0);return{group:g,armL,armR}
    }
    const master=character([0x6b3028,0xc58c6b,0x2a1917],.6,3.05,1.05),apprentice=character([0x264859,0xb87c61,0x3b241d],-1.2,-1.8,.88);apprentice.group.rotation.y=-.8;

    // Blowpipe and live procedural vessel.
    const pipePivot=new THREE.Group();pipePivot.position.set(.4,2.58,2.2);world.add(pipePivot);const pipe=mesh(new THREE.CylinderGeometry(.075,.075,6.5,12),MAT.iron,pipePivot);pipe.rotation.z=Math.PI/2;pipe.position.x=-.55;const grip=mesh(new THREE.CylinderGeometry(.13,.13,1.3,12),MAT.wood,pipePivot);grip.rotation.z=Math.PI/2;grip.position.x=-3.05;
    const glassMat=new THREE.MeshPhysicalMaterial({color:0xff7b3f,emissive:0xff4b18,emissiveIntensity:1.2,roughness:.08,metalness:0,transmission:.32,thickness:1.4,transparent:true,opacity:.91,clearcoat:1,clearcoatRoughness:.08});
    let glassMesh=mesh(new THREE.SphereGeometry(.55,24,16),glassMat,pipePivot);glassMesh.position.x=2.75;glassMesh.rotation.z=-Math.PI/2;let lastShape='';
    const savedVessels=[];for(let i=0;i<3;i++){const gm=glassMat.clone();gm.color.set([0xff7b3f,0x4bc6df,0xa37bff][i]);gm.emissive.copy(gm.color);gm.emissiveIntensity=.12;const v=mesh(new THREE.SphereGeometry(.42,20,12),gm,shelf);v.position.set(-1.2+i*1.2,6.05,.1);v.visible=false;savedVessels.push(v)}

    function vesselGeometry(body,neck,flare){
      const pts=[];for(let i=0;i<=24;i++){const y=-1.05+i/24*2.1,t=(y+1.05)/2.1;let r;
        if(t<.68){const u=t/.68;r=.18+Math.sin(u*Math.PI*.92)*(.25+body*.75)}else{const u=(t-.68)/.32;r=(.28+body*.26)*(1-u)+(.09+(1-neck)*.26+flare*u*.56)*u}pts.push(new THREE.Vector2(Math.max(.055,r),y))}
      return new THREE.LatheGeometry(pts,36);
    }

    // Sparks and drifting ash.
    const sparkGeo=new THREE.BufferGeometry(),sparkPos=new Float32Array(Data.SCENE_MANIFEST.sparkCount*3),sparkSeed=[];for(let i=0;i<Data.SCENE_MANIFEST.sparkCount;i++){sparkPos[i*3]=-4.8+(Math.random()-.5)*3;sparkPos[i*3+1]=1+Math.random()*6;sparkPos[i*3+2]=-1+Math.random()*3;sparkSeed.push(Math.random()*10)}sparkGeo.setAttribute('position',new THREE.BufferAttribute(sparkPos,3));const sparks=new THREE.Points(sparkGeo,new THREE.PointsMaterial({color:0xff8b42,size:.075,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false}));world.add(sparks);
    const dustGeo=new THREE.BufferGeometry(),dustPos=new Float32Array(85*3);for(let i=0;i<85;i++){dustPos[i*3]=(Math.random()-.5)*25;dustPos[i*3+1]=Math.random()*11;dustPos[i*3+2]=(Math.random()-.5)*18}dustGeo.setAttribute('position',new THREE.BufferAttribute(dustPos,3));const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xdcc3a4,size:.035,transparent:true,opacity:.28}));world.add(dust);

    // Camera orbit controls.
    let yaw=.72,pitch=.43,distance=27,drag=false,last={x:0,y:0},cinematic=false;
    const canvas=renderer.domElement;canvas.addEventListener('pointerdown',e=>{drag=true;last={x:e.clientX,y:e.clientY};canvas.setPointerCapture?.(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(!drag)return;yaw-=(e.clientX-last.x)*.006;pitch=Math.max(.14,Math.min(1.03,pitch+(e.clientY-last.y)*.004));last={x:e.clientX,y:e.clientY}});canvas.addEventListener('pointerup',()=>drag=false);canvas.addEventListener('pointercancel',()=>drag=false);canvas.addEventListener('wheel',e=>{e.preventDefault();distance=Math.max(17,Math.min(38,distance+e.deltaY*.018))},{passive:false});
    function setCinematic(v){cinematic=!!v}
    function resize(){const w=mount.clientWidth||innerWidth,h=mount.clientHeight||innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}addEventListener('resize',resize);resize();

    function update(s,time,dt){
      const phase=s.phase,working=['working','annealing','result','finished','failed'].includes(phase);glassMesh.visible=working&&phase!=='result'&&phase!=='finished';pipePivot.visible=working&&phase!=='result'&&phase!=='finished';
      if(s.commission){glassMat.color.set(s.commission.glass);glassMat.emissive.set(s.commission.glass)}
      const hot=Math.max(0,Math.min(1,(s.temperature-650)/520));glassMat.emissiveIntensity=.08+hot*1.85;glassMat.opacity=.62+hot*.32;furnaceLight.intensity=4.5+s.heat*8.5;lavaLight.intensity=2.4+Math.sin(time*.001)*.35;throat.material.emissiveIntensity=2.1+s.heat*2.2;doorL.rotation.y=.28+s.heat*.38;doorR.rotation.y=-.28-s.heat*.38;
      if(working){pipePivot.rotation.x+=dt*(.4+s.spin*7.5);const shapeKey=[s.body,s.neck,s.flare].map(v=>v.toFixed(2)).join('/');if(shapeKey!==lastShape){const old=glassMesh.geometry;glassMesh.geometry=vesselGeometry(s.body,s.neck,s.flare);old.dispose();lastShape=shapeKey}glassMesh.scale.setScalar(.73+s.breath*.06)}
      master.armL.rotation.z=-.45+Math.sin(time*.004)*.12;master.armR.rotation.z=.55-Math.sin(time*.004)*.12;apprentice.armL.rotation.z=-.45+Math.sin(time*.0024+2)*.08;
      if(!reduced){const p=sparkGeo.attributes.position.array;for(let i=0;i<Data.SCENE_MANIFEST.sparkCount;i++){p[i*3+1]+=dt*(.35+(i%7)*.08);p[i*3]+=Math.sin(time*.002+sparkSeed[i])*dt*.13;if(p[i*3+1]>8){p[i*3+1]=1;p[i*3]=-4.8+(sparkSeed[i]-.5)*3}}sparkGeo.attributes.position.needsUpdate=true;archive.forEach((v,i)=>v.rotation.y=time*.00015*(i%2?1:-1))}
      savedVessels.forEach((v,i)=>{v.visible=i<s.results.length;if(v.visible){const r=s.results[i];v.scale.set(.65+r.accuracy/220,.85+r.accuracy/160,.65+r.accuracy/220);v.rotation.y=time*.00025}});
      if(cinematic&&!drag){yaw+=dt*.055;distance=26+Math.sin(time*.00018)*2}const cp=Math.cos(pitch);camera.position.set(Math.sin(yaw)*cp*distance,5+Math.sin(pitch)*distance*.63,Math.cos(yaw)*cp*distance);camera.lookAt(0,2.2,0);renderer.render(scene,camera);
    }
    function stats(){return{meshes:meshCount,triangles:Math.round(triangles),sparks:Data.SCENE_MANIFEST.sparkCount}}
    renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault()},false);renderer.domElement.addEventListener('webglcontextrestored',()=>resize(),false);
    return{scene,camera,renderer,update,resize,setCinematic,stats};
  }
  return{create};
});
