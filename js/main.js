/* nav shadow on scroll */
const nav=document.getElementById('nav');
addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>10),{passive:true});

/* reveal on scroll */
const io=new IntersectionObserver((es)=>{
  es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
},{threshold:.12,rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* counter animation */
const fmt=(n,suf)=> (n>=1000? (n/1000)+'K' : n) + (suf||'');
const cio=new IntersectionObserver((es)=>{
  es.forEach(e=>{
    if(!e.isIntersecting)return;
    const el=e.target, to=+el.dataset.to, suf=el.dataset.suf||'';
    let start=null; const dur=1400;
    const step=(t)=>{
      if(!start)start=t;
      const p=Math.min((t-start)/dur,1);
      const eased=1-Math.pow(1-p,3);
      const val=Math.round(eased*to);
      el.innerHTML = val + (suf? '<span class="suf">'+suf+'</span>' : '');
      if(p<1)requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    cio.unobserve(el);
  });
},{threshold:.5});
document.querySelectorAll('#metrics .num').forEach(el=>cio.observe(el));

/* videos: reproducir al pasar el cursor, y SIEMPRE parables */
const vids = [...document.querySelectorAll('.vid')];
function pararVideo(c){
  const v=c.querySelector('video'), btn=c.querySelector('.vsound');
  if(!v) return;
  v.pause();
  v.muted=true;
  v.load();              // reinicia el elemento → vuelve a mostrar la miniatura (poster)
  c.classList.remove('is-playing');
  if(btn){ btn.textContent='🔇'; btn.setAttribute('aria-label','Activar sonido'); }
}
vids.forEach(c=>{
  const v=c.querySelector('video');
  const btn=c.querySelector('.vsound');
  if(!v) return;
  // El ▶ se oculta según el estado REAL de reproducción, no por :hover.
  v.addEventListener('play', ()=> c.classList.add('is-playing'));
  v.addEventListener('pause', ()=> c.classList.remove('is-playing'));
  // Desktop: reproduce al entrar el cursor; al salir SIEMPRE se para (nunca queda "atrapado").
  c.addEventListener('mouseenter',()=>{ v.play().catch(()=>{}); });
  c.addEventListener('mouseleave',()=> pararVideo(c));
  // Móvil/táctil (sin hover): tocar el video lo reproduce o pausa.
  v.addEventListener('click',()=>{ v.paused ? v.play().catch(()=>{}) : v.pause(); });
  // Botón de sonido: al activar sonido en uno, se silencian y paran los demás.
  if(btn){
    btn.addEventListener('click',(e)=>{
      e.stopPropagation();
      if(v.muted){ vids.forEach(o=>{ if(o!==c) pararVideo(o); }); } // solo uno con sonido a la vez
      v.muted=!v.muted;
      btn.textContent = v.muted ? '🔇' : '🔊';
      btn.setAttribute('aria-label', v.muted ? 'Activar sonido' : 'Silenciar');
      if(!v.muted){ v.play().catch(()=>{}); }
    });
  }
});
// Red de seguridad: si un video sale de la pantalla al hacer scroll, se para solo.
const vidObs = new IntersectionObserver((entries)=>{
  entries.forEach(en=>{ if(!en.isIntersecting) pararVideo(en.target); });
},{threshold:.15});
vids.forEach(c=> vidObs.observe(c));

/* agenda form -> WhatsApp */
document.getElementById('agendaForm').addEventListener('submit',(ev)=>{
  ev.preventDefault();
  const f=ev.target;
  const nombre=f.nombre.value.trim();
  const marca=f.marca.value.trim();
  const servicio=f.servicio.value;
  const msg=f.msg.value.trim();
  let t=`¡Hola Rebeca! 👋 Soy ${nombre||'(sin nombre)'}`;
  if(marca) t+=` de ${marca}`;
  t+=`.\nMe interesa: ${servicio}.`;
  if(msg) t+=`\n\n${msg}`;
  window.open('https://wa.me/584146846689?text='+encodeURIComponent(t),'_blank');
});

/* Botones "Lo quiero" -> bajan al formulario y precargan el mensaje del plan elegido */
document.querySelectorAll('.pick').forEach(b=>{
  b.addEventListener('click',()=>{
    const plan=b.dataset.plan||'';
    const msg=document.getElementById('msg');
    // Solo pre-rellenamos si el campo está vacío, para no borrar lo que ya escribió el visitante.
    if(msg && plan && msg.value.trim()===''){ msg.value = `Hola Rebeca 👋 Me interesa el «${plan}». ¿Me cuentas más?`; }
  });
});
