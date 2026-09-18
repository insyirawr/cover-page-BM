(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const stage = $('.stage'), cover = $('.cover'), replay = $('.replay');
  const background = $('.background');
  const elements = [
    {el: $('.logo1'), start: 350, length: 700, from: -270},
    {el: $('.logo2'), start: 550, length: 700, from: -250},
    {el: $('.headline'), start: 700, length: 800, from: -890, axis: 'X'},
    {el: $('.title1'), start: 1200, length: 850, from: -900, axis: 'X'},
    {el: $('.title2'), start: 1800, length: 800, from: -700, axis: 'X'},
    {el: $('.credits'), start: 2350, length: 750, from: 400}
  ];
  const duration = 3350;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let raf = 0, started = 0, ready = false;
  const clamp = x => Math.max(0,Math.min(1,x));
  const smooth = x => x*x*(3-2*x);
  function resize() { stage.style.transform = `scale(${cover.clientWidth/1500})`; }
  new ResizeObserver(resize).observe(cover); resize();
  function render(t) {
    background.style.opacity = smooth(clamp(t/700));
    for (const {el,start,length,from,axis='Y'} of elements) {
      const p = clamp((t-start)/length), q=p-1, c=1.05;
      const eased = 1+(c+1)*q*q*q+c*q*q;
      el.style.opacity = smooth(clamp(p*3));
      el.style.transform = `translate${axis}(${from*(1-eased)}px)`;
    }
    replay.classList.toggle('ready',t>=duration);
    stage.dataset.time = String(Math.round(t));
  }
  function tick(now) {
    const t=Math.min(duration,now-started);render(t);
    if(t<duration) raf=requestAnimationFrame(tick);
  }
  function play() {
    cancelAnimationFrame(raf);
    if(!ready) return;
    if(reduced.matches) {render(duration);return;}
    render(0);started=performance.now();raf=requestAnimationFrame(tick);
  }
  replay.addEventListener('click',play);
  reduced.addEventListener('change',play);
  window.coverAnimation = {duration,play,seek(ms) {cancelAnimationFrame(raf);render(clamp(ms/duration)*duration);}};
  Promise.all([...stage.querySelectorAll('img')].map(img=>img.decode())).then(()=>{ready=true;play();}).catch(()=>{ready=true;render(duration);});
})();
