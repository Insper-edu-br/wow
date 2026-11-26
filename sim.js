(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./data.js'):root.EmberglassData);if(typeof module==='object'&&module.exports)module.exports=api;else root.EmberglassSim=api;})(typeof globalThis!=='undefined'?globalThis:this,function(Data){
  'use strict';
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const PHASES=['briefing','working','annealing','result','finished','failed'];

  function createState(){return{
    phase:'briefing',commissionIndex:0,elapsed:0,totalTime:0,temperature:780,heat:0,spin:.42,breath:0,
    body:.18,neck:.50,flare:.08,symmetry:100,stress:0,glassMass:0,tool:null,toolUse:{paddle:0,jacks:0,shears:0},
    anneal:0,score:0,results:[],message:'The furnace is waiting.',grade:null,assists:0
  }}
  function currentCommission(s){return Data.COMMISSIONS[s.commissionIndex]||null}
  function start(s){if(s.phase!=='briefing')return false;s.phase='working';s.temperature=1045;s.heat=.58;s.glassMass=.34;s.message='Molten glass gathered. Keep it turning.';return true}
  function setHeat(s,value){if(s.phase!=='working')return false;s.heat=clamp(Number(value)||0,0,1);s.message=s.heat>.72?'Furnace roaring.':'Furnace adjusted.';return true}
  function setSpin(s,value){if(s.phase!=='working')return false;s.spin=clamp(Number(value)||0,0,1);return true}
  function blow(s,strength,dt){
    if(s.phase!=='working'||s.glassMass<=0)return false;const d=clamp(Number(dt)||0,0,.2),power=clamp(Number(strength)||0,0,1),c=currentCommission(s);
    const softness=clamp((s.temperature-760)/390,0,.98),gain=power*d*(.22+.66*softness);
    s.breath=clamp(s.breath+gain*1.8,0,1);s.body=clamp(s.body+gain,0,1);s.neck=clamp(s.neck-gain*.11,0,1);
    if(s.temperature>c.temp[1]+65)s.stress=clamp(s.stress+d*6,0,100);if(s.spin<.22)s.symmetry=clamp(s.symmetry-d*16*power,0,100);
    s.message=softness<.15?'The gather is too cold to move.':'The vessel is breathing.';return gain>0
  }
  function useTool(s,tool,dt=.12){
    if(s.phase!=='working'||!Data.TOOLS[tool])return false;const d=clamp(Number(dt)||0,0,.25),soft=clamp((s.temperature-720)/420,0,1);s.tool=tool;s.toolUse[tool]++;
    if(tool==='paddle'){s.body=clamp(s.body-d*.16*soft,0,1);s.symmetry=clamp(s.symmetry+d*9,0,100);s.stress=clamp(s.stress-d*2,0,100)}
    if(tool==='jacks'){s.neck=clamp(s.neck+d*.28*soft,0,1);s.body=clamp(s.body-d*.04,0,1);s.stress=clamp(s.stress+d*(soft<.25?5:1.1),0,100)}
    if(tool==='shears'){s.flare=clamp(s.flare+d*.32*soft,0,1);s.stress=clamp(s.stress+d*(soft<.3?7:1.5),0,100)}
    s.message=soft<.18?'The glass resists the tool.':Data.TOOLS[tool].hint;return true
  }
  function reheat(s){if(s.phase!=='working')return false;s.heat=1;s.stress=clamp(s.stress-3,0,100);s.message='Back into the glory hole.';return true}
  function accuracy(s){
    const c=currentCommission(s);if(!c)return 0;
    const shape=(Math.abs(s.body-c.target.body)+Math.abs(s.neck-c.target.neck)+Math.abs(s.flare-c.target.flare))/3;
    const shapeScore=clamp(1-shape/0.72,0,1),sym=s.symmetry/100,stress=1-s.stress/100;
    return clamp((shapeScore*.68+sym*.20+stress*.12)*100,0,100)
  }
  function finishShape(s){
    if(s.phase!=='working')return false;if(s.body<.30){s.message='Not enough volume yet.';return false}
    s.phase='annealing';s.anneal=0;s.heat=0;s.message='Annealing. Cool it through the quiet band.';return true
  }
  function resultFor(s){const c=currentCommission(s),acc=accuracy(s),timeBonus=Math.max(0,c.time-s.elapsed)*3,score=Math.round(acc*18+timeBonus-s.assists*35);return{id:c.id,name:c.name,accuracy:Math.round(acc),score:Math.max(0,score),cracked:s.stress>=100}}
  function step(s,delta){
    const dt=clamp(Number(delta)||0,0,.1);if(s.phase==='working'){
      const c=currentCommission(s);s.elapsed+=dt;s.totalTime+=dt;
      const ambientLoss=7.8+Math.max(0,s.body-.5)*2.6;s.temperature=clamp(s.temperature+(s.heat*31-ambientLoss)*dt,620,1280);
      const spinSweet=1-Math.abs(s.spin-.58)/.58;s.symmetry=clamp(s.symmetry+(spinSweet*.9-(s.spin<.16?2.8:0))*dt,0,100);
      if(s.temperature>c.temp[1]+90)s.stress=clamp(s.stress+(s.temperature-c.temp[1]-90)*.032*dt,0,100);
      if(s.temperature<735&&s.body>.42)s.stress=clamp(s.stress+(735-s.temperature)*.018*dt,0,100);
      s.breath=clamp(s.breath-dt*.17,0,1);
      if(s.stress>=100){s.phase='failed';s.message='Thermal shock. The vessel fractured.'}
      else if(s.elapsed>c.time+48){s.stress=clamp(s.stress+dt*5,0,100);s.message='The commission is overdue.'}
    } else if(s.phase==='annealing'){
      s.totalTime+=dt;s.anneal=clamp(s.anneal+dt/5.4,0,1);s.temperature=clamp(s.temperature-(18+s.anneal*44)*dt,510,1280);
      if(s.anneal>=1){const r=resultFor(s);s.results.push(r);s.score+=r.score;s.phase='result';s.message=`${r.name}: ${r.accuracy}% profile match.`}
    }
    return snapshot(s)
  }
  function nextCommission(s){
    if(s.phase!=='result')return false;if(s.commissionIndex>=Data.COMMISSIONS.length-1){s.phase='finished';s.grade=grade(s);s.message='The night edition is complete.';return true}
    s.commissionIndex++;s.phase='working';s.elapsed=0;s.temperature=1030;s.heat=.55;s.spin=.48;s.breath=0;s.body=.18;s.neck=.5;s.flare=.08;s.symmetry=100;s.stress=0;s.glassMass=.34;s.tool=null;s.message=`${currentCommission(s).name} gathered.`;return true
  }
  function recover(s){if(s.phase!=='failed')return false;s.assists++;s.phase='working';s.temperature=1010;s.heat=.56;s.body=.24;s.neck=.5;s.flare=.06;s.symmetry=86;s.stress=20;s.elapsed+=8;s.message='A fresh gather is on the pipe.';return true}
  function grade(s){const avg=s.results.reduce((a,r)=>a+r.accuracy,0)/Math.max(1,s.results.length);if(avg>=92&&s.assists===0)return'MASTER GLASSMAKER';if(avg>=78)return'HOT-SHOP ARTISAN';return'CALDERA APPRENTICE'}
  function snapshot(s){return{phase:s.phase,commission:currentCommission(s),index:s.commissionIndex,temperature:s.temperature,heat:s.heat,spin:s.spin,breath:s.breath,body:s.body,neck:s.neck,flare:s.flare,symmetry:s.symmetry,stress:s.stress,accuracy:accuracy(s),anneal:s.anneal,score:s.score,results:s.results,message:s.message,grade:s.grade}}
  function serialize(s){return JSON.stringify(s)}
  function load(raw,fallback=createState()){try{const s=JSON.parse(raw);if(!s||!PHASES.includes(s.phase)||!Number.isInteger(s.commissionIndex)||s.commissionIndex<0||s.commissionIndex>=Data.COMMISSIONS.length)return fallback;for(const k of['temperature','heat','spin','body','neck','flare','symmetry','stress'])if(!Number.isFinite(s[k]))return fallback;return Object.assign(createState(),s)}catch{return fallback}}
  return{clamp,createState,currentCommission,start,setHeat,setSpin,blow,useTool,reheat,accuracy,finishShape,resultFor,step,nextCommission,recover,grade,snapshot,serialize,load};
});
