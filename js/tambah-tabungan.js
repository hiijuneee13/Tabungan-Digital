document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('tambahForm');
  const inputNama = document.getElementById('nama');
  const inputTarget = document.getElementById('target');
  const inputTerkumpul = document.getElementById('terkumpul');
  const inputGambar = document.getElementById('gambar');
  const previewImg = document.getElementById('previewImg');
  const previewText = document.getElementById('previewText');
  const saveBtn = document.getElementById('saveBtn');

  function formatInputDots(el) {
    el.addEventListener('input', () => {
      const raw = el.value.replace(/\D/g, '');
      el.value = raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    });
  }
  formatInputDots(inputTarget);
  formatInputDots(inputTerkumpul);

  // ======== FITUR CROP GAMBAR ========
  const cropModal = document.getElementById('cropModal');
  const cropCanvas = document.getElementById('cropCanvas');
  const ctx = cropCanvas?.getContext('2d');
  let cropImg = new Image();
  let scale = 1, offsetX = 0, offsetY = 0;
  let dragging = false, startX, startY;

  let croppedData = ''; // simpan hasil crop di sini (bukan di input.dataset)

  // Saat user pilih gambar
  inputGambar?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) {
      previewImg.src = '';
      previewImg.classList.add('hidden');
      previewText.classList.remove('hidden');
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      cropImg.src = ev.target.result;
      cropModal.classList.remove('hidden');
      cropModal.classList.add('flex');
    };
    reader.readAsDataURL(file);
  });

  // Saat gambar siap di-crop
  cropImg.onload = () => {
    if (!cropCanvas) return;
    cropCanvas.width = 300;
    cropCanvas.height = 200;
    scale = 1;
    offsetX = 0;
    offsetY = 0;
    drawCrop();
  };

  function drawCrop() {
    if (!ctx) return;
    ctx.clearRect(0, 0, cropCanvas.width, cropCanvas.height);
    const iw = cropImg.width * scale;
    const ih = cropImg.height * scale;
    const x = (cropCanvas.width - iw) / 2 + offsetX;
    const y = (cropCanvas.height - ih) / 2 + offsetY;
    ctx.drawImage(cropImg, x, y, iw, ih);
  }

  // Geser gambar
  cropCanvas?.addEventListener('mousedown', e => {
    dragging = true;
    startX = e.offsetX;
    startY = e.offsetY;
  });
  cropCanvas?.addEventListener('mouseup', () => dragging = false);
  cropCanvas?.addEventListener('mouseleave', () => dragging = false);
  cropCanvas?.addEventListener('mousemove', e => {
    if (dragging) {
      offsetX += e.offsetX - startX;
      offsetY += e.offsetY - startY;
      startX = e.offsetX;
      startY = e.offsetY;
      drawCrop();
    }
  });

  // Zoom
  cropCanvas?.addEventListener('wheel', e => {
    e.preventDefault();
    scale += e.deltaY * -0.001;
    scale = Math.min(Math.max(0.5, scale), 3);
    drawCrop();
  });

  // Tombol batal crop
  document.getElementById('cropCancel')?.addEventListener('click', () => {
    cropModal.classList.add('hidden');
    cropModal.classList.remove('flex');
    inputGambar.value = '';
  });

  // Tombol gunakan hasil crop
  document.getElementById('cropConfirm')?.addEventListener('click', e => {
    e.preventDefault(); // cegah form submit
    croppedData = cropCanvas.toDataURL('image/jpeg', 0.9);
    previewImg.src = croppedData;
    previewImg.classList.remove('hidden');
    previewText.classList.add('hidden');
    cropModal.classList.add('hidden');
    cropModal.classList.remove('flex');
  });

  form?.addEventListener('submit', async e => {
    e.preventDefault();
    saveBtn.disabled = true;
    saveBtn.classList.add('opacity-70');

    const nama = inputNama.value.trim();
    const target = Number(String(inputTarget.value).replace(/\./g, '')) || 0;
    const terkumpul = Number(String(inputTerkumpul.value).replace(/\./g, '')) || 0;

    if (!nama) {
      alert('Nama tujuan harus diisi');
      saveBtn.disabled = false;
      saveBtn.classList.remove('opacity-70');
      return;
    }
    if (target <= 0) {
      alert('Target harus lebih dari 0');
      saveBtn.disabled = false;
      saveBtn.classList.remove('opacity-70');
      return;
    }

    const imgToSave = croppedData || previewImg.src || '';

    await saveItem(imgToSave);
  });

  async function saveItem(img) {
    const newItem = {
      id: String(Date.now()),
      nama: inputNama.value.trim(),
      target: Number(String(inputTarget.value).replace(/\./g, '')) || 0,
      terkumpul: Number(String(inputTerkumpul.value).replace(/\./g, '')) || 0,
      gambar: img,
      deposits: [],
      createdAt: new Date().toISOString()
    };

    await Storage.add(newItem);

    setTimeout(() => {
      if (typeof fadeAndNavigate === 'function') {
        fadeAndNavigate('../index.html');
      } else {
        window.location.href = '../index.html';
      }
    }, 200);
  }
});
