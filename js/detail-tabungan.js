document.addEventListener('DOMContentLoaded',async ()=>{
  const q=new URLSearchParams(location.search); const id=q.get('id');
  const wrap=document.getElementById('detailContent');
  const imageInput = document.getElementById('detailImageInput');
  const deleteModal = document.getElementById('deleteModalDetail');
  const confirmBtn = document.getElementById('detailModalConfirm');
  const cancelBtn = document.getElementById('detailModalCancel');

  function formatRupiah(number){ if(isNaN(number)) return 'Rp 0'; return 'Rp '+Number(number).toLocaleString('id-ID'); }
  function escapeHtml(s){ return (s||'').replace(/[&<"']/g,m=>({'&':'&amp;','<':'&lt;','"':'&quot;',"'":'&#039;'}[m])); }

  // handle missing id gracefully
  if(!id){
    wrap.innerHTML = `<div class="loading-box">Data tabungan tidak ditemukan. Kembalilah ke dashboard atau pilih tujuan lain.<div class="mt-4"><a href="../index.html" class="btn-primary px-3 py-2 rounded-md">Kembali ke Dashboard</a></div></div>`;
    return;
  }

  let item = await Storage.getById(id);
  if(!item){
    wrap.innerHTML = `<div class="loading-box">Data tabungan tidak ditemukan. Mungkin sudah dihapus atau ID tidak valid.<div class="mt-4"><a href="../index.html" class="btn-primary px-3 py-2 rounded-md">Kembali ke Dashboard</a></div></div>`;
    return;
  }
  item.deposits = item.deposits || [];

  function renderDetail(){
    const progress = item.target?Math.min(100,(item.terkumpul/item.target)*100):0;
    wrap.innerHTML = `
      <div class="grid gap-4 sm:grid-cols-3">
        <div class="sm:col-span-1 relative">
          ${item.gambar?`<img id="mainImg" src="${item.gambar}" alt="${escapeHtml(item.nama)}" class="w-full h-44 object-cover rounded-lg">`:`<div id="mainImg" class="card-img-fallback w-full h-44 rounded-lg flex items-center justify-center">${escapeHtml(item.nama.slice(0,20))}</div>`}
          <button id="changeImageBtn" title="Ubah Gambar" class="absolute top-2 right-2 bg-white/6 p-2 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3l-4 4M7 14l3-3 2 2 3-3 4 4"/></svg>
          </button>
        </div>
        <div class="sm:col-span-2">
          <h3 class="text-2xl font-semibold mb-1">${escapeHtml(item.nama)}</h3>
          <p class="text-sm text-slate-400 mb-3">Dibuat: ${new Date(item.createdAt).toLocaleString()}</p>
          <p class="text-sm text-slate-300 mb-4">Target: <strong>${formatRupiah(item.target)}</strong></p>

          <div class="w-full bg-white/5 rounded-full h-3 mb-2"><div id="detailProgressBar" class="h-3 rounded-full" style="width:0;background:linear-gradient(90deg,var(--accent),var(--accent-2))"></div></div>
          <p class="text-sm text-slate-300 mb-4">${formatRupiah(item.terkumpul)} terkumpul — ${progress.toFixed(1)}%</p>

          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <button id="addDeposit" class="btn-primary px-3 py-2 rounded-md">Tambah Simpanan</button>
              <button id="deleteBtn" class="bg-red-600 px-3 py-2 rounded-md">Hapus Tujuan</button>
            </div>

            <div id="depositArea" class="mt-4 hidden">
              <label class="text-sm text-slate-300">Nama</label>
              <input id="depositorName" type="text" class="mt-1 w-full bg-transparent border border-white/6 rounded-lg px-3 py-2 outline-none" placeholder="">
              <label class="text-sm text-slate-300 mt-2">Nominal (Rp)</label>
              <div class="flex gap-2 mt-2">
                <input id="depositVal" type="text" inputmode="numeric" class="bg-transparent border border-white/6 rounded-md px-3 py-2 w-full" placeholder="">
                <button id="depositSave" class="bg-green-500 px-3 py-2 rounded-md">Simpan</button>
              </div>
            </div>
          </div>

          <div class="mt-6">
            <h4 class="text-lg font-semibold mb-3">Riwayat Simpanan</h4>
            <div id="depositsList" class="grid gap-3"></div>
          </div>
        </div>
      </div>
    `;
    const pb = document.getElementById('detailProgressBar');
    animateProgress(pb, progress);
    attachDetailHandlers();
    renderDeposits();
  }

  function renderDeposits(){
    const list = document.getElementById('depositsList');
    list.innerHTML = '';
    if(!item.deposits || item.deposits.length===0){
      list.innerHTML = '<p class="text-sm text-slate-400">Belum ada riwayat simpanan.</p>'; return;
    }

    for(const d of item.deposits){
      const el = document.createElement('div');
      el.className = 'deposit-card flex items-center justify-between';
      const left = document.createElement('div');
      left.innerHTML = `<div class="text-sm font-medium">${escapeHtml(d.name)}</div><div class="text-xs text-slate-400">${new Date(d.date).toLocaleString()}</div>`;
      const right = document.createElement('div');
      right.innerHTML = `<div class="text-sm font-semibold">${formatRupiah(d.amount)}</div>`;
      el.appendChild(left); el.appendChild(right);
      list.appendChild(el);
    }
  }

  function attachDetailHandlers(){
    const changeBtn = document.getElementById('changeImageBtn');
    if(changeBtn){
      changeBtn.addEventListener('click', ()=> imageInput.click());
    }
    imageInput.addEventListener('change', async (e)=>{
      const file = e.target.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = async (ev)=>{
        const img = ev.target.result;
        item = await Storage.update(id, { gambar: img });

        item = await Storage.getById(id);
        renderDetail();
      };
      reader.readAsDataURL(file);
    });

    const addBtn = document.getElementById('addDeposit');
    if(addBtn) addBtn.addEventListener('click', ()=> document.getElementById('depositArea').classList.toggle('hidden'));

    const depositVal = document.getElementById('depositVal');
    if(depositVal){
      depositVal.addEventListener('input', ()=>{
        const raw = depositVal.value.replace(/\D/g,'');
        depositVal.value = raw.replace(/\B(?=(\d{3})+(?!\d))/g,'.');
      });
    }

    const saveDeposit = document.getElementById('depositSave');
    if(saveDeposit) saveDeposit.addEventListener('click', async ()=>{
      const name = document.getElementById('depositorName').value && document.getElementById('depositorName').value.trim();
      const val = Number(String(document.getElementById('depositVal').value).replace(/\./g,''))||0;
      if(!name){ alert('Nama penabung harus diisi'); return; }
      if(val<=0){ alert('Masukkan nominal yang valid'); return; }
      const deposit = { id:String(Date.now()), name, amount: val, date: new Date().toISOString() };
      item.deposits = item.deposits || [];
      item.deposits.unshift(deposit);
      item.terkumpul = Number(item.terkumpul) + val;
      await Storage.update(id, { deposits: item.deposits, terkumpul: item.terkumpul });

      item = await Storage.getById(id);
      renderDetail();
    });

    const delBtn = document.getElementById('deleteBtn');
    if(delBtn) delBtn.addEventListener('click', ()=>{

      deleteModal.classList.add('show');
      gsap.fromTo(deleteModal.querySelector('.relative'), {scale:0.98, opacity:0}, {scale:1, opacity:1, duration:0.25});
    });
  }


  cancelBtn.addEventListener('click', ()=> deleteModal.classList.remove('show'));
  confirmBtn.addEventListener('click', async ()=>{
    await Storage.remove(id);
    deleteModal.classList.remove('show');

    fadeAndNavigate('../index.html');
  });

  renderDetail();
});