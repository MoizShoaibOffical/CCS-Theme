document.addEventListener('DOMContentLoaded', function(){
  const form = document.getElementById('login-form');
  const email = document.getElementById('login-email');
  const password = document.getElementById('login-password');
  const toggle = document.getElementById('toggle-password');
  const remember = document.getElementById('remember-me');
  const error = document.getElementById('login-error');

  function setLoading(isLoading){
    const loader = document.getElementById('global-loader');
    if(!loader) return;
    loader.style.display = isLoading ? 'grid' : 'none';
  }

  if(toggle){
    toggle.addEventListener('click', ()=>{
      const isPwd = password.getAttribute('type') === 'password';
      password.setAttribute('type', isPwd ? 'text' : 'password');
      toggle.classList.toggle('ti-eye-off', !isPwd);
      toggle.classList.toggle('ti-eye', isPwd);
    });
  }

  if(form){
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      error.classList.add('d-none');
      setLoading(true);
      try{
        const r = await frappe.call({
          method: 'login',
          args: {
            usr: (email.value||'').trim(),
            pwd: password.value||''
          }
        });
        if(r && r.message==='Logged In'){
          if(remember && remember.checked){
            // persist session if server supports remember
            try{ await frappe.call({method:'frappe.auth.set_remember_cookie'});}catch(e){}
          }
          const nextUrl = (()=>{ try{ const p=new URLSearchParams(window.location.search); const n=p.get('next'); if(n && n.startsWith('/')) return n; }catch(e){} return null; })();
          window.location.href = nextUrl || '/app';
          return;
        }
        throw new Error('Invalid login response');
      }catch(err){
        const msg = (err && err.message) || 'Invalid email or password';
        error.textContent = msg;
        error.classList.remove('d-none');
      }finally{
        setLoading(false);
      }
    });
  }
});


