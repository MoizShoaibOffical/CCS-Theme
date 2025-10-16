frappe.provide('custom_theme');
(function(){
  const $ = (sel, root=document)=>root.querySelector(sel);
  const $$ = (sel, root=document)=>Array.from(root.querySelectorAll(sel));

  function ensureUI(){
    // Only Administrator can see and use the Theme Customizer UI
    const isAdmin = (window.frappe?.session?.user || '').toLowerCase() === 'administrator' ||
                    (Array.isArray(window.frappe?.boot?.user?.roles) && window.frappe.boot.user.roles.includes('Administrator'));
    if (!isAdmin) return; // do not render the customizer for non-admin users
    if (document.getElementById('nt-theme-gear')) return;
    const gear = document.createElement('button');
    gear.id = 'nt-theme-gear';
    gear.setAttribute('aria-label','Open Theme Customizer');
    gear.innerHTML = `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.04 3.2l.06.06a1.65 1.65 0 0 0 1.82.33h0A1.65 1.65 0 0 0 10.42 2V2a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06A2 2 0 1 1 20.8 7.04l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"></path>
      </svg>
      <span class="nt-gear-tip">Theme</span>
    `;
    document.body.appendChild(gear);

    const drawer = document.createElement('div');
    drawer.id = 'nt-theme-drawer';
    drawer.innerHTML = `
      <div class="nt-header"><div>Theme Customizer</div><button id="nt-theme-close" aria-label="Close">✕</button></div>
      <div class="nt-body">

        <div class="nt-accordion" id="nt-theme-acc">

          

          <div class="nt-acc-item">
            <button class="nt-acc-head" aria-expanded="true">Top Bar Color</button>
            <div class="nt-acc-body show">
              <div class="nt-swatches" id="nt-topbar-sw"></div>
            </div>
          </div>

          <div class="nt-acc-item">
            <button class="nt-acc-head" aria-expanded="true">Sidebar Color</button>
            <div class="nt-acc-body show">
              <div class="nt-swatches" id="nt-sidebar-sw"></div>
            </div>
          </div>

          <div class="nt-acc-item">
            <button class="nt-acc-head" aria-expanded="true">Sidebar Text Color</button>
            <div class="nt-acc-body show">
              <div class="nt-row">
                <button class="nt-pill" data-sbtext="white">White</button>
                <button class="nt-pill" data-sbtext="black">Black</button>
              </div>
            </div>
          </div>

          

          <div class="nt-acc-item">
            <button class="nt-acc-head" aria-expanded="true">Theme Colors</button>
            <div class="nt-acc-body show">
              <div class="nt-swatches" id="nt-accent-sw"></div>
            </div>
          </div>

        </div>

        <div class="nt-actions-row">
          <button class="nt-btn" id="nt-theme-reset">Reset</button>
          <button class="nt-btn" id="nt-theme-save">Save</button>
        </div>
      </div>
    `;
    document.body.appendChild(drawer);

    gear.onclick = () => drawer.classList.add('open');
    $('#nt-theme-close').onclick = () => drawer.classList.remove('open');

    // swatches
    buildSwatches($('#nt-topbar-sw'), [
      '#ffffff', '#0A84FF', '#10B981', '#F59E0B', '#6D28D9', '#14B8A6', '#ef4444'
    ], (c)=>applyTopbar(c));
    buildSwatches($('#nt-sidebar-sw'), [
      '#ffffff', '#0A84FF', '#10B981', '#F59E0B', '#6D28D9', '#14B8A6', '#ef4444'
    ], (c)=>applySidebar(c));
    buildSwatches($('#nt-accent-sw'), [
      '#000000', '#0A84FF', '#10B981', '#F59E0B', '#6D28D9', '#14B8A6', '#ef4444'
    ], (c)=>applyAccent(c));

    // seed current selection
    try{
      const cs = getComputedStyle(document.documentElement);
      markSelected($('#nt-topbar-sw'), cs.getPropertyValue('--topbar-bg').trim());
      markSelected($('#nt-sidebar-sw'), cs.getPropertyValue('--sidebar-bg').trim());
      markSelected($('#nt-accent-sw'), cs.getPropertyValue('--accent').trim());
    }catch(e){}

    

    // mode buttons
    $$('.nt-pill[data-mode]').forEach(btn=>{
      btn.onclick=()=>applyMode(btn.getAttribute('data-mode'));
    });

    // sidebar text color manual override
    $$('.nt-pill[data-sbtext]').forEach(btn=>{
      btn.onclick=()=>{
        const v = btn.getAttribute('data-sbtext') === 'white' ? '#ffffff' : '#0f1115';
        setCss('--sidebar-text', v);
      };
    });

    $('#nt-theme-reset').onclick = resetTheme;
    $('#nt-theme-save').onclick = savePrefs;
  }

  function markSelected(root, value){
    try{
      Array.from(root.querySelectorAll('.nt-swatch')).forEach(b=>b.removeAttribute('aria-checked'));
      const hit = Array.from(root.querySelectorAll('.nt-swatch')).find(b=>String(b.getAttribute('data-color')).toLowerCase()===String(value).toLowerCase());
      if(hit) hit.setAttribute('aria-checked','true');
    }catch(e){}
  }
  function buildSwatches(root, colors, onPick){
    root.style.display='flex'; root.style.flexWrap='wrap'; root.style.gap='10px';
    colors.forEach(c=>{
      const s=document.createElement('button'); s.className='nt-swatch'; s.style.background=c; s.setAttribute('aria-label', c); s.setAttribute('data-color', c);
      s.onclick=()=>{ onPick(c); markSelected(root, c); };
      root.appendChild(s);
    });
  }

  // Apply helpers
  function applyTopbar(color){ setCss('--topbar-bg', color); setCss('--topbar-text', bestText(color)); try{ const r=document.getElementById('nt-topbar-sw'); r && markSelected(r, color); }catch(e){} }
  function applySidebar(color){
    setCss('--sidebar-bg', color);
    // White everywhere except pure/very-light white → black
    const textColor = isWhiteish(color) ? '#0f1115' : '#ffffff';
    setCss('--sidebar-text', textColor);
    setCss('--sidebar-overlay','rgba(0,0,0,0)');
    try{ const r=document.getElementById('nt-sidebar-sw'); r && markSelected(r, color); }catch(e){}
  }
  
  function applyAccent(color){ setCss('--accent', color); setCss('--accent-contrast', bestText(color)); try{ const r=document.getElementById('nt-accent-sw'); r && markSelected(r, color); }catch(e){} }
  // Ensure image/glyph icons are visible on dark backgrounds
  function updateSidebarIconFilter(){
    const text = getComputedStyle(document.documentElement).getPropertyValue('--sidebar-text').trim();
    const isLight = text && text[1] !== 'f';
    // when text is white, invert darker images to brighten; else no filter
    setCss('--sidebar-icon-filter', (text === '#ffffff') ? 'invert(1) brightness(1.2)' : 'none');
  }
  function applyMode(mode){
    const root=document.documentElement; root.setAttribute('data-theme', mode);
    if(mode==='system'){
      const mq=window.matchMedia('(prefers-color-scheme: dark)');
      setForDark(mq.matches); mq.onchange=(e)=>setForDark(e.matches);
    }
    if(mode==='dark'){ setForDark(true); }
    if(mode==='light'){ setForDark(false); }
  }
  function setForDark(isDark){
    if(isDark){ document.documentElement.style.setProperty('--nt-bg','#0f1115'); document.documentElement.style.setProperty('--nt-text','#e6e8ed'); }
    else{ document.documentElement.style.setProperty('--nt-bg','#f6f7fb'); document.documentElement.style.setProperty('--nt-text','#0f1115'); }
  }

  function setCss(k,v){ document.documentElement.style.setProperty(k,v); if(k.startsWith('--sidebar-')) updateSidebarIconFilter(); }
  function isWhiteish(val){
    if(!val) return false;
    const s = String(val).trim().toLowerCase();
    if(s.startsWith('linear-gradient') || s.startsWith('radial-gradient')) return false;
    if(s === '#fff' || s === '#ffffff' || s === 'white') return true;
    if(/^#([0-9a-f]{6})$/.test(s)){
      const r = parseInt(s.slice(1,3),16), g = parseInt(s.slice(3,5),16), b = parseInt(s.slice(5,7),16);
      const L = (0.2126*r + 0.7152*g + 0.0722*b)/255; // relative luminance 0..1
      return L > 0.9; // very light => treat as white
    }
    return false;
  }
  function bestText(bg){
    try{ const c=parseColor(bg); const L=(0.2126*c.r+0.7152*c.g+0.0722*c.b)/255; return L>0.6?'#0f1115':'#ffffff'; }catch(e){ return '#ffffff'; }
  }
  function parseColor(hex){ if(hex.startsWith('#')){ const v=hex.length===4?('#'+hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3]):hex; return {r:parseInt(v.slice(1,3),16), g:parseInt(v.slice(3,5),16), b:parseInt(v.slice(5,7),16)};} return {r:0,g:0,b:0}; }

  // Persistence
  async function savePrefs(){
    const data = collect(); localStorage.setItem('nt:theme', JSON.stringify(data));
    try{ await frappe.call('new_theme.new_theme.api.theme_prefs.save_theme_prefs', {prefs:data, global_prefs: 1}); }catch(e){}
    frappe.show_alert({message:__('Theme saved'), indicator:'green'});
  }
  function collect(){
    const s=getComputedStyle(document.documentElement);
    const g=(k)=>s.getPropertyValue(k).trim();
    return { topbar_bg:g('--topbar-bg'), topbar_text:g('--topbar-text'), sidebar_bg:g('--sidebar-bg'), sidebar_text:g('--sidebar-text'), sidebar_overlay:g('--sidebar-overlay'), accent:g('--accent'), accent_contrast:g('--accent-contrast'), mode:document.documentElement.getAttribute('data-theme')||'light' };
  }
  const isNonEmptyObj=(o)=>o && typeof o==='object' && Object.keys(o).length>0;
  async function loadPrefs(){
    let prefs=null;
    try{ const r=await frappe.call('new_theme.new_theme.api.theme_prefs.get_theme_prefs'); prefs=r && r.message; }catch(e){}
    if(!isNonEmptyObj(prefs)){
      try{ prefs=JSON.parse(localStorage.getItem('nt:theme')||'null'); }catch(e){ prefs=null; }
    }
    if(isNonEmptyObj(prefs)){ applyFrom(prefs); }
  }
  function applyFrom(p){
    if(p.topbar_bg) applyTopbar(p.topbar_bg);
    if(p.topbar_text) setCss('--topbar-text', p.topbar_text);
    if(p.sidebar_bg) applySidebar(p.sidebar_bg);
    if(p.sidebar_text) setCss('--sidebar-text', p.sidebar_text);
    if(p.sidebar_overlay) setCss('--sidebar-overlay', p.sidebar_overlay);
    if(p.accent) applyAccent(p.accent);
    if(p.accent_contrast) setCss('--accent-contrast', p.accent_contrast);
    if(p.mode) applyMode(p.mode);
    // ensure swatch rings reflect final values
    try{
      const cs = getComputedStyle(document.documentElement);
      markSelected(document.getElementById('nt-topbar-sw'), cs.getPropertyValue('--topbar-bg').trim());
      markSelected(document.getElementById('nt-sidebar-sw'), cs.getPropertyValue('--sidebar-bg').trim());
      markSelected(document.getElementById('nt-accent-sw'), cs.getPropertyValue('--accent').trim());
    }catch(e){}
  }
  function defaults(){
    return {
      topbar_bg: '#ffffff',
      topbar_text: '#0f1115',
      sidebar_bg: '#ffffff',
      sidebar_text: '#0f1115',
      sidebar_overlay: 'rgba(0,0,0,0)',
      accent: '#3066fb',
      accent_contrast: '#ffffff',
      mode: 'light'
    };
  }
  function resetTheme(){
    try{
      const d = defaults();
      applyTopbar(d.topbar_bg);
      setCss('--topbar-text', d.topbar_text);
      applySidebar(d.sidebar_bg);
      setCss('--sidebar-text', d.sidebar_text);
      setCss('--sidebar-overlay', d.sidebar_overlay);
      applyAccent(d.accent);
      setCss('--accent-contrast', d.accent_contrast);
      applyMode(d.mode);
      // reflect selection rings
      const cs = getComputedStyle(document.documentElement);
      markSelected(document.getElementById('nt-topbar-sw'), cs.getPropertyValue('--topbar-bg').trim());
      markSelected(document.getElementById('nt-sidebar-sw'), cs.getPropertyValue('--sidebar-bg').trim());
      markSelected(document.getElementById('nt-accent-sw'), cs.getPropertyValue('--accent').trim());
    }catch(e){}
    try{ localStorage.removeItem('nt:theme'); }catch(e){}
    try{ frappe.call('new_theme.new_theme.api.theme_prefs.clear_theme_prefs'); }catch(e){}
    try{ frappe.show_alert({message: __('Theme reset to default'), indicator: 'green'}); }catch(e){}
  }

  // init
  document.addEventListener('DOMContentLoaded', ()=>{ ensureUI(); loadPrefs(); });
})();

