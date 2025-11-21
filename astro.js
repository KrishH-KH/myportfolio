// astro.js - attach <script src="astro.js"></script> at bottom of each page
(function(){
  const canvas = document.createElement('canvas');
  canvas.id = 'astro-canvas';
  canvas.style.position = 'fixed';
  canvas.style.left = '0';
  canvas.style.top = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '0';
  canvas.style.pointerEvents = 'none';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let W = innerWidth, H = innerHeight;
  function resize(){ W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
  addEventListener('resize', resize);
  resize();

  // tiny glowing stars
  const STARS = Math.round((W*H)/120000); // scale with viewport
  const stars = [];
  for(let i=0;i<STARS;i++){
    stars.push({
      x: Math.random()*W,
      y: Math.random()*H,
      r: 0.4 + Math.random()*1.3,
      blink: Math.random()*Math.PI*2,
      speed: 0.6 + Math.random()*1.6
    });
  }

  // shooting stars array
  const shoots = [];
  const MAX_SHOOTS = 4;

  function spawnShootingStar(){
    // choose side corner
    const side = Math.floor(Math.random()*4);
    let x,y,dx,dy;
    const len = 160 + Math.random()*200;
    // spawn near top-left / top-right / left-top / right-top
    if(side === 0){ x = Math.random()*W*0.18; y = Math.random()*H*0.18; dx=1; dy=1.6; }
    else if(side === 1){ x = W - Math.random()*W*0.18; y = Math.random()*H*0.18; dx=-1; dy=1.6; }
    else if(side === 2){ x = Math.random()*W*0.12; y = Math.random()*H*0.35; dx=1; dy=1.2; }
    else { x = W - Math.random()*W*0.12; y = Math.random()*H*0.35; dx=-1; dy=1.2; }
    shoots.push({
      x,y,dx,dy,
      len, speed: (900 + Math.random()*700),
      life:0, ttl:1.2 + Math.random()*1.2
    });
    if(shoots.length > MAX_SHOOTS) shoots.shift();
  }

  // schedule waves: every 5-10s randomize
  (function scheduler(){
    const wait = 5000 + Math.random()*5000;
    setTimeout(()=>{
      // spawn 1..3 shooting stars, staggered
      const c = 1 + Math.floor(Math.random()*3);
      for(let i=0;i<c;i++){
        setTimeout(()=>spawnShootingStar(), i*350 + Math.random()*200);
      }
      scheduler();
    }, wait);
  })();

  let last = performance.now();
  function draw(now){
    const dt = (now - last)/1000; last = now;
    // clear to solid black
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0,0,W,H);

    // draw small stars - dim but glowing
    for(let s of stars){
      s.blink += dt * s.speed;
      const a = 0.35 + 0.65 * (0.5 + 0.5*Math.sin(s.blink*2));
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fill();
    }

    // draw shooting stars
    for(let i = shoots.length-1; i>=0; i--){
      const st = shoots[i];
      st.life += dt;
      // travel
      st.x += st.dx * st.speed * dt * 0.6;
      st.y += st.dy * st.speed * dt * 0.6;
      // tail end
      const tx = st.x - st.dx * st.len;
      const ty = st.y - st.dy * st.len;

      // bright head
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,255,255,0.98)';
      ctx.arc(st.x, st.y, 3.2, 0, Math.PI*2);
      ctx.fill();

      // tail gradient
      const g = ctx.createLinearGradient(st.x, st.y, tx, ty);
      g.addColorStop(0, 'rgba(255,255,255,0.9)');
      g.addColorStop(0.5, 'rgba(255,255,255,0.25)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = g;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(st.x, st.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();

      // remove when off screen or ttl
      if(st.x < -200 || st.x > W + 200 || st.y > H + 200 || st.life > st.ttl){
        shoots.splice(i,1);
      }
    }

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();
