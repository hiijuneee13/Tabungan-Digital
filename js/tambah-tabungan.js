document.addEventListener('DOMContentLoaded',()=>{
  const form=document.getElementById('tambahForm');
  const inputNama=document.getElementById('nama');
  const inputTarget=document.getElementById('target');
  const inputTerkumpul=document.getElementById('terkumpul');
  const inputGambar=document.getElementById('gambar');
  const previewImg=document.getElementById('previewImg');
  const previewText=document.getElementById('previewText');
  const saveBtn=document.getElementById('saveBtn');
  function formatInputDots(el){ el.addEventListener('input',()=>{ const raw=el.value.replace(/\D/g,''); el.value=raw.replace(/\B(?=(\d{3})+(?!\d))/g,'.'); }); }
  formatInputDots(inputTarget); formatInputDots(inputTerkumpul);
  inputGambar?.addEventListener('change',e=>{ const file=e.target.files[0]; if(!file){ previewImg.src=''; previewImg.classList.add('hidden'); previewText.classList.remove('hidden'); return;} const reader=new FileReader(); reader.onload=ev=>{ previewImg.src=ev.target.result; previewImg.classList.remove('hidden'); previewText.classList.add('hidden'); }; reader.readAsDataURL(file); });
  form?.addEventListener('submit',async e=>{ e.preventDefault(); saveBtn.disabled=true; saveBtn.classList.add('opacity-70'); const nama=inputNama.value && inputNama.value.trim(); const target=Number(String(inputTarget.value).replace(/\./g,''))||0; const terkumpul=Number(String(inputTerkumpul.value).replace(/\./g,''))||0; if(!nama){ alert('Nama tujuan harus diisi'); saveBtn.disabled=false; saveBtn.classList.remove('opacity-70'); return;} if(target<=0){ alert('Target harus lebih dari 0'); saveBtn.disabled=false; saveBtn.classList.remove('opacity-70'); return;} const file=inputGambar.files[0]; if(file){ const reader=new FileReader(); reader.onload=async ev=>{ await saveItem(ev.target.result); }; reader.readAsDataURL(file); } else { await saveItem(''); } async function saveItem(img){ const newItem={ id:String(Date.now()), nama, target, terkumpul, gambar:img||'', deposits:[], createdAt:new Date().toISOString() }; await Storage.add(newItem); // ensure saved before navigate
    setTimeout(()=>{ if(typeof fadeAndNavigate==='function'){ fadeAndNavigate('../index.html'); } else { window.location.href='../index.html'; } }, 120);
  } });
});