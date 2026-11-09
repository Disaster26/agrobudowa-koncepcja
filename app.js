(function(){
  'use strict';
  var d=document, body=d.body;

  /* menu mobilne */
  var burger=d.querySelector('.burger'), menu=d.getElementById('menu-mob');
  if(burger&&menu){
    burger.addEventListener('click',function(){
      var o=burger.getAttribute('aria-expanded')==='true';
      burger.setAttribute('aria-expanded',String(!o));
      burger.setAttribute('aria-label',o?'Otwórz menu':'Zamknij menu');
      menu.hidden=o;
    });
    d.addEventListener('keydown',function(e){if(e.key==='Escape'&&!menu.hidden){menu.hidden=true;burger.setAttribute('aria-expanded','false');burger.focus();}});
  }

  /* pasek mobilny po przewinięciu za przyciski hero / nagłówka */
  var pasek=d.querySelector('.mob-pasek');
  if(pasek&&'IntersectionObserver' in window){
    var cel=d.querySelector('.hero-btns')||d.querySelector('.podt');
    if(cel){
      new IntersectionObserver(function(en){
        var w=!en[0].isIntersecting&&en[0].boundingClientRect.top<0;
        pasek.classList.toggle('widac',w);
        pasek.setAttribute('aria-hidden',String(!w));
        pasek.querySelectorAll('a').forEach(function(a){a.tabIndex=w?0:-1;});
      }).observe(cel);
    }
  }

  /* galerie w kartach: palec, mysz, strzałki, licznik */
  var galerie={};
  d.querySelectorAll('.gal').forEach(function(g){
    var tor=g.querySelector('.gal-tor'), figs=tor.querySelectorAll('figure'), n=figs.length;
    var licz=g.querySelector('.gal-i'), p=g.querySelector('.gal-p'), x=g.querySelector('.gal-x');
    var karta=g.closest('.karta'), tyt=karta?karta.querySelector('h3').textContent:'';
    galerie[g.dataset.gal]={tor:tor,tyt:tyt,kadry:g.dataset.kadry==='1'};
    function idx(){return Math.round(tor.scrollLeft/Math.max(1,tor.clientWidth));}
    function upd(){var i=idx();licz.textContent=i+1;p.disabled=i<=0;x.disabled=i>=n-1;}
    function idz(i){tor.scrollTo({left:Math.max(0,Math.min(n-1,i))*tor.clientWidth,behavior:'smooth'});}
    p.addEventListener('click',function(){idz(idx()-1);});
    x.addEventListener('click',function(){idz(idx()+1);});
    tor.addEventListener('scroll',function(){window.requestAnimationFrame(upd);},{passive:true});
    tor.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();idz(idx()+1);}if(e.key==='ArrowLeft'){e.preventDefault();idz(idx()-1);}if(e.key==='Enter'){otworzLb(g.dataset.gal,idx());}});
    upd();
    /* przeciąganie myszą */
    var start=0,sl=0,ciag=false,ruch=0;
    tor.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;ciag=true;ruch=0;start=e.clientX;sl=tor.scrollLeft;});
    window.addEventListener('pointermove',function(e){if(!ciag)return;var dx=e.clientX-start;ruch=Math.max(ruch,Math.abs(dx));if(ruch>4){tor.classList.add('ciagnie');tor.scrollLeft=sl-dx;}});
    window.addEventListener('pointerup',function(e){if(!ciag)return;ciag=false;if(ruch>4){var dx=e.clientX-start,i=Math.round(sl/tor.clientWidth)+(dx<-40?1:dx>40?-1:0);tor.classList.remove('ciagnie');idz(i);}else{tor.classList.remove('ciagnie');}});
    tor.addEventListener('click',function(e){if(ruch>4){e.preventDefault();ruch=0;return;}otworzLb(g.dataset.gal,idx());});
  });
  d.querySelectorAll('[data-otworz]').forEach(function(b){b.addEventListener('click',function(){otworzLb(b.dataset.otworz,0);});});

  /* lightbox z powiększeniem */
  var lb=d.getElementById('lb'), lbTor=lb&&lb.querySelector('.lb-tor'), lbLicz=lb&&lb.querySelector('.lb-licz'), lbTyt=lb&&lb.querySelector('.lb-tyt'), ostatni=null, lbN=0;
  function lbIdx(){return Math.round(lbTor.scrollLeft/Math.max(1,lbTor.clientWidth));}
  function otworzLb(id,start){
    var g=galerie[id]; if(!g||!lb)return;
    ostatni=d.activeElement;
    var imgs=g.tor.querySelectorAll('img'); lbN=imgs.length;
    lbTor.innerHTML='';
    imgs.forEach(function(im,i){var f=d.createElement('figure');var n=d.createElement('img');n.src=im.dataset.big||im.src;n.alt=im.alt;if(Math.abs(i-start)>1)n.loading='lazy';f.appendChild(n);lbTor.appendChild(f);});
    lbTyt.textContent=g.tyt+(g.kadry?' (kadry z filmu)':'');
    lb.hidden=false;body.classList.add('zablokuj');
    lbTor.scrollLeft=start*lbTor.clientWidth;
    lbLicz.textContent=(start+1)+' / '+lbN;
    lb.querySelector('.lb-z').focus();
  }
  function zamknijLb(){lb.hidden=true;body.classList.remove('zablokuj');lbTor.innerHTML='';if(ostatni)ostatni.focus();}
  if(lb){
    lbTor.addEventListener('scroll',function(){lbLicz.textContent=(lbIdx()+1)+' / '+lbN;},{passive:true});
    lb.querySelector('.lb-z').addEventListener('click',zamknijLb);
    lb.querySelector('.lb-p').addEventListener('click',function(){lbTor.scrollTo({left:(lbIdx()-1)*lbTor.clientWidth,behavior:'smooth'});});
    lb.querySelector('.lb-x').addEventListener('click',function(){lbTor.scrollTo({left:(lbIdx()+1)*lbTor.clientWidth,behavior:'smooth'});});
    lb.addEventListener('click',function(e){if(e.target.tagName==='FIGURE')zamknijLb();});
  }

  /* film YouTube - ładowany dopiero po kliknięciu */
  var film=d.getElementById('film');
  function otworzFilm(id,tyt){
    if(!film)return; ostatni=d.activeElement;
    film.querySelector('.film-ramka').innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id)+'?autoplay=1&rel=0" title="'+tyt.replace(/"/g,'&quot;')+'" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    film.querySelector('.film-tyt').textContent=tyt;
    film.hidden=false;body.classList.add('zablokuj');film.querySelector('.lb-z').focus();
  }
  function zamknijFilm(){film.hidden=true;film.querySelector('.film-ramka').innerHTML='';body.classList.remove('zablokuj');if(ostatni)ostatni.focus();}
  d.querySelectorAll('[data-yt]').forEach(function(b){b.addEventListener('click',function(){otworzFilm(b.dataset.yt,b.dataset.tytul||'Film');});});
  if(film){film.querySelector('.lb-z').addEventListener('click',zamknijFilm);film.addEventListener('click',function(e){if(e.target===film)zamknijFilm();});}

  d.addEventListener('keydown',function(e){
    if(lb&&!lb.hidden){if(e.key==='Escape')zamknijLb();if(e.key==='ArrowRight')lb.querySelector('.lb-x').click();if(e.key==='ArrowLeft')lb.querySelector('.lb-p').click();}
    else if(film&&!film.hidden&&e.key==='Escape')zamknijFilm();
  });

  /* filtr realizacji */
  var filtr=d.querySelector('.filtr');
  if(filtr){
    var btns=filtr.querySelectorAll('button'), karty=d.querySelectorAll('.karty-lista .karta');
    function ustaw(f){
      btns.forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.f===f));});
      karty.forEach(function(k){k.hidden=!(f==='*'||k.dataset.kat===f);});
    }
    btns.forEach(function(b){b.addEventListener('click',function(){ustaw(b.dataset.f);history.replaceState(null,'',b.dataset.f==='*'?location.pathname:'#'+b.dataset.f);});});
    var h=location.hash.slice(1);
    if(['hale','inwentarskie','konstrukcje'].indexOf(h)>-1)ustaw(h);
  }

  /* formularz pokazowy */
  var form=d.getElementById('zapytanie');
  if(form){form.addEventListener('submit',function(e){e.preventDefault();var i=form.querySelector('.f-info');i.hidden=false;i.focus&&i.setAttribute('tabindex','-1');i.focus();});}

  /* baner cookies */
  var ck=d.getElementById('cookies'), zgoda=null;
  try{zgoda=localStorage.getItem('ab-cookies');}catch(e){}
  if(ck&&zgoda===null){
    ck.hidden=false;
    ck.querySelectorAll('[data-cookies]').forEach(function(b){b.addEventListener('click',function(){try{localStorage.setItem('ab-cookies',b.dataset.cookies);}catch(e){}ck.hidden=true;});});
  }
})();
