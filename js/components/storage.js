const STORAGE_KEY = "td_tabungan_v5";

const LocalAdapter = {
  async loadAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return []; // tidak ada data
      const data = JSON.parse(raw);
      // pastikan hasil parse adalah array
      if (!Array.isArray(data)) return [];
      return data;
    } catch (e) {
      console.error("Gagal memuat data:", e);
      return [];
    }
  },

  async saveAll(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      console.error("Gagal menyimpan data:", e);
      return false;
    }
  },

  async add(item) {
    const all = await this.loadAll();
    all.unshift(item);
    await this.saveAll(all);
    return item;
  },

  async getById(id) {
    const all = await this.loadAll();
    return all.find(x => String(x.id) === String(id)) || null;
  },

  async update(id, patch = {}) {
    const all = await this.loadAll();
    const idx = all.findIndex(x => String(x.id) === String(id));
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...patch };
    await this.saveAll(all);
    return all[idx];
  },

  async remove(id) {
    let all = await this.loadAll();
    all = all.filter(x => String(x.id) !== String(id));
    await this.saveAll(all);
    return true;
  }
};

const Storage = LocalAdapter;
