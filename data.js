(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.EmberglassData=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const COMMISSIONS=[
    {
      id:'dawn-vessel',name:'Dawn Vessel',client:'The East Pavilion',brief:'A low vessel that holds the first orange light.',
      glass:'#ff7b3f',accent:'#ffd487',target:{body:.72,neck:.44,flare:.32},temp:[1040,1145],time:94,
      note:'Wide body · quiet neck · lifted rim'
    },
    {
      id:'rain-orb',name:'Rain Orb',client:'House of Weather',brief:'A perfect blue chamber for one suspended storm.',
      glass:'#4bc6df',accent:'#d4f6ff',target:{body:.86,neck:.22,flare:.10},temp:[1080,1180],time:98,
      note:'Full body · narrow mouth · nearly round'
    },
    {
      id:'night-lantern',name:'Night Lantern',client:'The Observatory',brief:'A tall violet lantern with a generous crown.',
      glass:'#a37bff',accent:'#f1ddff',target:{body:.56,neck:.68,flare:.72},temp:[1015,1120],time:108,
      note:'Tall body · long neck · open crown'
    }
  ];
  const TOOLS={
    paddle:{label:'Paddle',hint:'Compress the body and calm asymmetry.',keys:'1'},
    jacks:{label:'Jacks',hint:'Pull the neck taller and narrower.',keys:'2'},
    shears:{label:'Shears',hint:'Open and flare the hot rim.',keys:'3'}
  };
  const PALETTE={obsidian:0x161519,basalt:0x2e2930,iron:0x3b3533,brass:0xa87736,ember:0xff5c24,cream:0xe7d2ae,lava:0xff3d17,ash:0x82746d};
  const SCENE_MANIFEST={
    furnaceBricks:42,windowPanes:9,shelfVessels:14,tools:19,characters:2,workbenches:3,lavaChannels:3,sparkCount:140
  };
  return {COMMISSIONS,TOOLS,PALETTE,SCENE_MANIFEST};
});

