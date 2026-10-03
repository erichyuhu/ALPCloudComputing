import { db, ref, onValue } from "./firebase_config.js";

// --- LOGIKA READ PEMINJAMAN ---
const tabelPeminjaman = document.getElementById('data-peminjaman');
const transaksiRef = ref(db, 'transaksi');

onValue(transaksiRef, (snapshot) => {
    tabelPeminjaman.innerHTML = ''; // Kosongkan tabel sebelum diisi data baru
    const data = snapshot.val();

    if (data) {
        // Looping setiap transaksi di dalam Firebase
        for (const trxId in data) {
            const trx = data[trxId];
            
            // Format daftar barang yang dipinjam menjadi string gabungan (contoh: "Kamera (1), Mic (2)")
            let daftarBarang = [];
            if(trx.barang_dipinjam) {
                for (const itemKey in trx.barang_dipinjam) {
                    const item = trx.barang_dipinjam[itemKey];
                    daftarBarang.push(`${item.nama_barang} (${item.jumlah})`);
                }
            }
            const stringBarang = daftarBarang.join(', ');

            // Format tanggal agar lebih rapi membaca ISO string
            const tanggalPinjam = new Date(trx.tanggal_pinjam).toLocaleDateString('id-ID', {
                day: '2-digit', month: 'short', year: 'numeric'
            });

            // Tentukan warna badge berdasarkan status
            let badgeClass = 'status-pending';
            if (trx.status === 'Dipinjam') badgeClass = 'status-dipinjam';
            if (trx.status === 'Sudah Kembali') badgeClass = 'status-kembali'; // Anda bisa tambah CSS ini

            // Render baris HTML
            const row = `
                <tr>
                    <td>#${trxId}</td>
                    <td>${trx.nama_peminjam}</td>
                    <td>${stringBarang}</td>
                    <td>${tanggalPinjam}</td>
                    <td><span class="status-badge ${badgeClass}">${trx.status}</span></td>
                    <td><a href="#" style="color: var(--primary-color);">Detail</a></td>
                </tr>
            `;
            tabelPeminjaman.innerHTML += row;
        }
    } else {
        // Jika database kosong
        tabelPeminjaman.innerHTML = '<tr><td colspan="6" style="text-align: center;">Belum ada transaksi peminjaman.</td></tr>';
    }
});

// --- LOGIKA READ DATA BARANG RUSAK ---
const tabelBarangRusak = document.getElementById('data-barang-rusak');
const selectLimit = document.getElementById('limit-barang-rusak');

let masterKategori = {};
let dataBarangRusakAll = []; // Array untuk menyimpan semua barang rusak

// 1. Ambil Data Kategori (Agar nama kategori bisa diterjemahkan)
const kategoriRef = ref(db, 'kategori');
onValue(kategoriRef, (snapshot) => {
    masterKategori = snapshot.val() || {};
    ambilDataBarang(); 
});

// 2. Ambil Data Barang dan Filter
function ambilDataBarang() {
    const barangRef = ref(db, 'barang');
    onValue(barangRef, (snapshot) => {
        const data = snapshot.val();
        dataBarangRusakAll = []; // Reset array
        
        if (data) {
            for (const kodeBarang in data) {
                const item = data[kodeBarang];
                
                // LOGIKA 4-PILAR: Tampilkan hanya jika ada stok yang rusak
                if (item.stok_rusak > 0) {
                    dataBarangRusakAll.push({
                        id: kodeBarang,
                        ...item
                    });
                }
            }
        }
        renderTabelRusak(); // Panggil fungsi render
    });
}

// 3. Render Tabel sesuai Limit
function renderTabelRusak() {
    tabelBarangRusak.innerHTML = '';
    
    if (dataBarangRusakAll.length === 0) {
        tabelBarangRusak.innerHTML = '<tr><td colspan="5" style="text-align: center;">Semua barang dalam kondisi baik.</td></tr>';
        return;
    }

    // Terapkan Limit (Slice Array)
    const limitValue = selectLimit.value;
    let dataToShow = dataBarangRusakAll;

    if (limitValue !== 'all') {
        const limitNumber = parseInt(limitValue);
        dataToShow = dataBarangRusakAll.slice(0, limitNumber);
    }

    // Render Data
    dataToShow.forEach(item => {
        let namaKat = item.kategori;
        if (masterKategori[item.kategori]) {
            namaKat = masterKategori[item.kategori].nama;
        }

        const row = `
            <tr>
                <td>${item.id}</td>
                <td>${item.nama}</td>
                <td>${namaKat}</td>
                <td><span style="color: red; font-weight: bold;">${item.stok_rusak} Unit</span></td>
                <td><a href="addproduct.html" style="color: var(--primary-color);">Cek di Produk</a></td>
            </tr>
        `;
        tabelBarangRusak.innerHTML += row;
    });

    // Tambahkan info jika ada data yang tersembunyi karena limit
    if (limitValue !== 'all' && dataBarangRusakAll.length > parseInt(limitValue)) {
        const sisaData = dataBarangRusakAll.length - parseInt(limitValue);
        tabelBarangRusak.innerHTML += `
            <tr>
                <td colspan="5" style="text-align: center; font-size: 12px; color: gray;">
                    + ${sisaData} barang rusak lainnya tidak ditampilkan (Ubah limit untuk melihat)
                </td>
            </tr>`;
    }
}

// 4. Trigger perubahan saat dropdown limit diklik
if(selectLimit) {
    selectLimit.addEventListener('change', renderTabelRusak);
}

// 4. Logika mengubah Mode Terang / Gelap (Dark Mode)
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');

themeToggle.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    
    if (isDark) {
        document.body.removeAttribute('data-theme');
        themeIcon.classList.replace('fa-sun', 'fa-moon');
    } else {
        document.body.setAttribute('data-theme', 'dark');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    }
});