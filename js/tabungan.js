// dashboard with improved delete modal hooking and safe detail links
document.addEventListener("DOMContentLoaded",()=>{
  const listContainer=document.getElementById("tabunganList");
  const emptyState=document.getElementById("emptyState");
  const refreshBtn=document.getElementById("refreshBtn");
  const deleteModal=document.getElementById("deleteModal");
  const modalConfirm=document.getElementById("modalConfirm");
  const modalCancel=document.getElementById("modalCancel");
  let pendingDeleteId = null;

  function formatRupiah(number){ if(isNaN(number)) return "Rp 0"; return "Rp "+Number(number).toLocaleString("id-ID"); }
  function calcProgress(item){ const target=Number(item.target)||0; const terkumpul=Number(item.terkumpul)||0; const percent=target===0?0:Math.min(100,(terkumpul/target)*100); const sisa=Math.max(0,target-terkumpul); return {percent,sisa}; }
  function escapeHtml(s){ return (s||'').replace(/[&<"']/g,m=>({'&':'&amp;','<':'&lt;','"':'&quot;',"'":'&#039;'}[m])); }

  function createCard(item){
    const {percent,sisa}=calcProgress(item);
    const imgHtml=item.gambar?`<img src="${item.gambar}" alt="${escapeHtml(item.nama)}" class="w-full h-40 object-cover rounded-lg mb-3" onerror="this.style.display='none'">`:`<div class="card-img-fallback w-full h-40 rounded-lg mb-3 flex items-center justify-center text-slate-200">${escapeHtml(item.nama.slice(0,20))}</div>`;
    const wrapper=document.createElement('article');
    wrapper.className='card theme-transition';
    wrapper.setAttribute('data-aos','fade-up');
    // Use relative link to html/detail-tabungan.html with id param
    wrapper.innerHTML=`<div class="flex-1"><a href="html/detail-tabungan.html?id=${encodeURIComponent(item.id)}" class="block">${imgHtml}<h4 class="text-lg font-poppins font-semibold mb-1 text-slate-100">${escapeHtml(item.nama)}</h4></a><div class="meta mb-2">Target: ${formatRupiah(item.target)}</div><div class="w-full bg-white/5 rounded-full h-3 mb-2 progress-glow"><div class="h-3 rounded-full progressBar" style="width:0;background:linear-gradient(90deg,var(--accent),var(--accent-2))"></div></div><div class="flex items-center justify-between text-sm text-slate-300 mt-2"><div>${formatRupiah(item.terkumpul)} terkumpul</div><div>${percent.toFixed(1)}%</div></div><div class="flex items-center justify-between mt-3"><div class="text-sm text-slate-400">Sisa: <strong>${formatRupiah(sisa)}</strong></div><div class="flex items-center gap-2"><a href="html/detail-tabungan.html?id=${encodeURIComponent(item.id)}" class="text-xs bg-white/5 px-3 py-1 rounded-md">Detail</a><button class="text-xs bg-red-600 px-3 py-1 rounded-md deleteBtn" data-id="${item.id}">Hapus</button></div></div></div>`;
    return {wrapper,percent};
  }

  async function render(){
    const list=await Storage.loadAll();
    listContainer.innerHTML='';
    if(!list||list.length===0){ emptyState.classList.remove('hidden'); } else {
      emptyState.classList.add('hidden');
      for(const item of list){
        const {wrapper,percent}=createCard(item);
        listContainer.appendChild(wrapper);
        const pb=wrapper.querySelector('.progressBar');
        animateProgress(pb,percent);
      }
      document.querySelectorAll('.deleteBtn').forEach(btn=>btn.addEventListener('click',async e=>{
        pendingDeleteId = e.currentTarget.dataset.id;
        // show modal
        deleteModal.classList.add('show');
        // animate modal entrance
        gsap.fromTo(deleteModal.querySelector('.relative'), {scale:0.98, opacity:0}, {scale:1, opacity:1, duration:0.25});
      }));
      animateEntry('.card');
    }
  }

  modalCancel.addEventListener('click', ()=>{
    pendingDeleteId = null;
    deleteModal.classList.remove('show');
  });

  modalConfirm.addEventListener('click', async ()=>{
    if(!pendingDeleteId) return;
    await Storage.remove(pendingDeleteId);
    pendingDeleteId = null;
    deleteModal.classList.remove('show');
    render();
  });

  refreshBtn?.addEventListener('click',()=>render());
  render();
});