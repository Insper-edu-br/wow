(function(){
  'use strict';
  const Sim=window.EmberglassSim,Data=window.EmberglassData,$=s=>document.querySelector(s);const STORE='emberglass-caldera-v1';
  let state=load(),world,last=performance.now(),blowing=false,heldTool=null,cinematic=false,saveClock=0,audio=null;
  const ui={overlay:$('#overlay'),overlayKicker:$('#overlayKicker'),overlayTitle:$('#overlayTitle'),overlayText:$('#overlayText'),overlayAction:$('#overlayAction'),orderNo:$('#orderNo'),orderName:$('#orderName'),client:$('#client'),brief:$('#brief'),profileName:$('#profileName'),profileNote:$('#profileNote'),targetPath:$('#targetPath'),targetBody:$('#targetBody'),targetNeck:$('#targetNeck'),targetFlare:$('#targetFlare'),tempText:$('#tempText'),tempBar:$('#tempBar'),sweetBand:$('#sweetBand'),matchText:$('#matchText'),matchBar:$('#matchBar'),symText:$('#symText'),stressText:$('#stressText'),scoreText:$('#scoreText'),heat:$('#heat'),spin:$('#spin'),blow:$('#blow'),finish:$('#finish'),reheat:$('#reheat'),toast:$('#toast')};

  function load(){try{const raw=localStorage.getItem(STORE);return raw?Sim.load(raw):Sim.createState()}catch{return Sim.createState()}}
  function save(){try{localStorage.setItem(STORE,Sim.serialize(state))}catch{}}
  function toast(text){ui.toast.textContent=text;ui.toast.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>ui.toast.classList.remove('show'),1800)}
  function tone(freq,dur=.06,vol=.025){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audio=audio||new AC();const o=audio.createOscillator(),g=audio.createGain();o.type='triangle';o.frequency.value=freq;g.gain.setValueAtTime(vol,audio.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+dur);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+dur)}catch{}}
  function vesselPath(t){const cx=85,bottom=143,top=25,pts=[];for(let i=0;i<=20;i++){const u=i/20,y=bottom-u*(bottom-top);let r;if(u<.68){const q=u/.68;r=11+Math.sin(q*Math.PI*.92)*(14+t.body*42)}else{const q=(u-.68)/.32;r=(17+t.body*15)*(1-q)+(6+(1-t.neck)*14+t.flare*q*23)*q}pts.push([cx+r,y])}for(let i=20;i>=0;i--){const p=pts[i];pts.push([cx-(p[0]-cx),p[1]])}return'M '+pts.map(p=>p.map(v=>v.toFixed(1)).join(' ')).join(' L ')+' Z'}
  function setCommission(){const c=Sim.currentCommission(state);if(!c)return;ui.orderNo.textContent=`Commission ${String(state.commissionIndex+1).padStart(2,'0')} / 03`;ui.orderName.textContent=c.name;ui.client.textContent=c.client;ui.brief.textContent=c.brief;ui.profileName.textContent=c.name;ui.profileNote.textContent=c.note;ui.targetBody.textContent=Math.round(c.target.body*100)+'%';ui.targetNeck.textContent=Math.round(c.target.neck*100)+'%';ui.targetFlare.textContent=Math.round(c.target.flare*100)+'%';ui.targetPath.setAttribute('d',vesselPath(c.target));const min=(c.temp[0]-620)/660*100,max=(c.temp[1]-620)/660*100;ui.sweetBand.style.left=min+'%';ui.sweetBand.style.width=(max-min)+'%'}
  function updateUI(s){
    if(s.commission&&ui.orderName.textContent!==s.commission.name)setCommission();ui.tempText.textContent=Math.round(s.temperature)+'°C';ui.tempBar.style.width=Sim.clamp((s.temperature-620)/660*100,0,100)+'%';ui.matchText.textContent=Math.round(s.accuracy)+'%';ui.matchBar.style.width=s.accuracy+'%';ui.symText.textContent=Math.round(s.symmetry)+'%';ui.stressText.textContent=Math.round(s.stress)+'%';ui.scoreText.textContent=String(s.score).padStart(4,'0');
    ui.heat.value=Math.round(s.heat*100);ui.spin.value=Math.round(s.spin*100);const working=s.phase==='working';[ui.heat,ui.spin,ui.blow,ui.finish,ui.reheat,...document.querySelectorAll('.tool')].forEach(el=>el.disabled=!working);ui.blow.classList.toggle('active',blowing&&working);document.querySelectorAll('.tool').forEach(b=>b.classList.toggle('active',heldTool===b.dataset.tool));
  }
  function openOverlay(type){
    const s=Sim.snapshot(state);ui.overlay.classList.add('open');
    if(type==='briefing'){ui.overlayKicker.textContent='The Caldera Studio';ui.overlayTitle.innerHTML='Glass remembers<br>every second of heat.';ui.overlayText.textContent='Shape three commissions before the volcano sleeps. Balance heat, rotation and breath; use the tools only while the glass is soft.';ui.overlayAction.textContent='Gather the first piece'}
    if(type==='result'){const r=state.results.at(-1);ui.overlayKicker.textContent=`Commission ${state.commissionIndex+1} complete`;ui.overlayTitle.innerHTML=`${r.accuracy}% profile<br>match.`;ui.overlayText.textContent=`${r.name} earned ${r.score} points. ${r.accuracy>=90?'The silhouette is exceptionally controlled.':r.accuracy>=75?'A strong studio piece with visible handwork.':'The glass survived, but the profile wandered.'}`;ui.overlayAction.textContent=state.commissionIndex===Data.COMMISSIONS.length-1?'Close the night edition':'Gather next commission'}
    if(type==='failed'){ui.overlayKicker.textContent='Thermal shock';ui.overlayTitle.innerHTML='The gather<br>fractured.';ui.overlayText.textContent='The glass crossed its stress limit. The apprentice has prepared a fresh gather; continuing applies a small score penalty.';ui.overlayAction.textContent='Recover with fresh glass'}
    if(type==='finished'){ui.overlayKicker.textContent='Night edition complete';ui.overlayTitle.innerHTML=state.grade.replace(' ','<br>');ui.overlayText.textContent=`Three pieces archived · ${state.score} total points · ${state.assists} recovery ${state.assists===1?'assist':'assists'}.`;ui.overlayAction.textContent='Begin a new edition'}
  }
  function closeOverlay(){ui.overlay.classList.remove('open')}
  function overlayAction(){
    if(state.phase==='briefing'){Sim.start(state);closeOverlay();tone(220,.15,.035);toast('Molten glass gathered')}
    else if(state.phase==='result'){Sim.nextCommission(state);if(state.phase==='finished')openOverlay('finished');else{closeOverlay();setCommission();tone(280,.12,.03);toast('Fresh gather on the pipe')}}
    else if(state.phase==='failed'){Sim.recover(state);closeOverlay();tone(160,.1,.03)}
    else if(state.phase==='finished'){try{localStorage.removeItem(STORE)}catch{}state=Sim.createState();setCommission();openOverlay('briefing')}
    save();
  }
  function applyTool(tool){if(Sim.useTool(state,tool,.15)){tone({paddle:120,jacks:240,shears:340}[tool],.035,.018)}}
  function finish(){if(Sim.finishShape(state)){tone(440,.15,.035);toast('Moving into the annealing kiln')}else toast(state.message)}

  ui.overlayAction.addEventListener('click',overlayAction);ui.heat.addEventListener('input',e=>Sim.setHeat(state,+e.target.value/100));ui.spin.addEventListener('input',e=>Sim.setSpin(state,+e.target.value/100));
  const hold=(el,on,off)=>{el.addEventListener('pointerdown',e=>{e.preventDefault();on();el.setPointerCapture?.(e.pointerId)});['pointerup','pointercancel','pointerleave'].forEach(name=>el.addEventListener(name,off))};
  hold(ui.blow,()=>blowing=true,()=>blowing=false);document.querySelectorAll('.tool').forEach(b=>hold(b,()=>{heldTool=b.dataset.tool;applyTool(heldTool)},()=>heldTool=null));
  ui.reheat.addEventListener('click',()=>{if(Sim.reheat(state)){tone(95,.09,.03);toast('Furnace set to full')}});ui.finish.addEventListener('click',finish);
  $('#detailsBtn').onclick=()=>{$('#profile').classList.add('open');$('#profile').setAttribute('aria-hidden','false');$('#detailsBtn').setAttribute('aria-expanded','true')};$('#closeProfile').onclick=()=>{$('#profile').classList.remove('open');$('#profile').setAttribute('aria-hidden','true');$('#detailsBtn').setAttribute('aria-expanded','false')};
  $('#cameraBtn').onclick=()=>{cinematic=!cinematic;world?.setCinematic(cinematic);$('#cameraBtn').setAttribute('aria-pressed',cinematic);$('#cameraBtn').textContent=cinematic?'Camera: cinema':'Camera: orbit'};
  const keys=new Set();addEventListener('keydown',e=>{if(e.repeat&&['Enter','r','1','2','3'].includes(e.key))return;keys.add(e.key.toLowerCase());if(e.key==='1')applyTool('paddle');if(e.key==='2')applyTool('jacks');if(e.key==='3')applyTool('shears');if(e.key.toLowerCase()==='r')Sim.reheat(state);if(e.key==='Enter')finish();if(e.key==='Escape')$('#closeProfile').click()});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
  function init(){try{world=EmberglassScene.create($('#scene'));console.info('EMBERGLASS scene',world.stats())}catch(error){ui.overlayTitle.textContent='WebGL unavailable';ui.overlayText.textContent='This browser could not create the 3D renderer. Try a recent browser with hardware acceleration.';ui.overlayAction.style.display='none';console.error(error)}setCommission();if(state.phase==='working'||state.phase==='annealing')closeOverlay();else if(state.phase!=='briefing')openOverlay(state.phase==='result'?'result':state.phase==='failed'?'failed':'finished');requestAnimationFrame(loop)}
  function loop(now){const dt=Math.min(.1,(now-last)/1000||0);last=now;if(state.phase==='working'){
      if(blowing||keys.has('b'))Sim.blow(state,1,dt);if(heldTool)Sim.useTool(state,heldTool,dt);if(keys.has('q'))Sim.setHeat(state,state.heat-dt*.45);if(keys.has('e'))Sim.setHeat(state,state.heat+dt*.45);if(keys.has('a'))Sim.setSpin(state,state.spin-dt*.5);if(keys.has('d'))Sim.setSpin(state,state.spin+dt*.5);
    }
    const before=state.phase,snap=Sim.step(state,dt);if(before!==state.phase){if(state.phase==='result')openOverlay('result');if(state.phase==='failed')openOverlay('failed');tone(state.phase==='failed'?70:520,.18,.04)}updateUI(snap);world?.update(snap,now,dt);saveClock+=dt;if(saveClock>1.5){save();saveClock=0}requestAnimationFrame(loop)
  }
  init();
})();
