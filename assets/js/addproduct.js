import { db, ref, onValue, set, update } from "./firebase_config.js";

// Mengambil Elemen DOM Utama
const formAdd = document.getElementById('form-add');
const formEdit = document.getElementById('form-edit');
const modalEdit = document.getElementById('editModal');
const btnCloseModal = document.querySelector('.close-modal');
const tabelBarang = document.getElementById('tabel-semua-barang');
const filterKategori = document.getElementById('filter-kategori');
const filterKondisi = document.getElementById('filter-kondisi');

let allBarangData = null;
let masterKategori = null;

// 1. Ambil Kategori untuk Dropdown
const kategoriRef = ref(db, 'kategori');
onValue(kategoriRef, (snapshot) => {
    const addKategori = document.getElementById('add_kategori');
    const editKategori = document.getElementById('edit_kategori');
    
    addKategori.innerHTML = '<option value="">Pilih Kategori...</option>';
    editKategori.innerHTML = '';
    filterKategori.innerHTML = '<option value="all">Semua Kategori</option>';
    
    masterKategori = snapshot.val();
    
    if (masterKategori) {
        for (const idKat in masterKategori) {
            const namaKat = masterKategori[idKat].nama;
            addKategori.innerHTML += `<option value="${idKat}">${namaKat}</option>`;
            editKategori.innerHTML += `<option value="${idKat}">${namaKat}</option>`;
            filterKategori.innerHTML += `<option value="${idKat}">${namaKat}</option>`; 
        }
    }
    renderTabelBarang();
});

// 2. Ambil Data Barang dan Render Tabel
const barangRef = ref(db, 'barang');
onValue(barangRef, (snapshot) => {
    allBarangData = snapshot.val();
    renderTabelBarang();
});

function renderTabelBarang() {
    tabelBarang.innerHTML = '';
    let hasData = false;

    const valKategori = filterKategori.value;
    const valKondisi = filterKondisi.value;

    if (allBarangData) {
        for (const idBarang in allBarangData) {
            const item = allBarangData[idBarang];
            
            // Konversi paksa ke angka untuk menghindari nilai undefined
            const total = Number(item.stok_total) || 0;
            const rusak = Number(item.stok_rusak) || 0;
            const dipinjam = Number(item.stok_dipinjam) || 0;
            const tersedia = Number(item.stok_tersedia) || 0;
            
            const matchKategori = (valKategori === 'all' || item.kategori === valKategori);
            
            let matchKondisi = true;
            if (valKondisi === 'rusak') matchKondisi = (rusak > 0); 
            else if (valKondisi === 'baik') matchKondisi = (total - rusak > 0); 

            if (matchKategori && matchKondisi) {
                hasData = true;
                let namaKategoriText = item.kategori; 
                if (masterKategori && masterKategori[item.kategori]) {
                    namaKategoriText = masterKategori[item.kategori].nama;
                }
                
                const row = `
                    <tr>
                        <td>${idBarang}</td>
                        <td>${item.nama}</td>
                        <td>${namaKategoriText}</td> 
                        <td>
                            <span style="display:block; font-weight:bold; color:var(--primary-color);">Tersedia: ${tersedia}</span>
                            <span style="font-size:12px; color:var(--text-muted);">
                                Total: ${total} | Rusak: ${rusak} | Dipinjam: ${dipinjam}
                            </span>
                        </td>
                        <td>
                            <button class="btn-edit" 
                                data-id="${idBarang}" 
                                data-nama="${item.nama}" 
                                data-kategori="${item.kategori}" 
                                data-total="${total}" 
                                data-rusak="${rusak}"
                                data-dipinjam="${dipinjam}">
                                <i class="fa-solid fa-pen-to-square"></i> Edit
                            </button>
                        </td>
                    </tr>
                `;
                tabelBarang.innerHTML += row;
            }
        }
    }

    if (!hasData) {
        tabelBarang.innerHTML = '<tr><td colspan="5" style="text-align: center;">Tidak ada data yang sesuai.</td></tr>';
    } else {
        // Menggunakan onclick agar event listener tidak menumpuk saat tabel dirender ulang
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.onclick = function() {
                document.getElementById('edit_kode').value = this.dataset.id;
                document.getElementById('edit_nama').value = this.dataset.nama;
                document.getElementById('edit_kategori').value = this.dataset.kategori;
                document.getElementById('edit_stok_total').value = this.dataset.total;
                document.getElementById('edit_stok_rusak').value = this.dataset.rusak;
                document.getElementById('edit_stok_dipinjam').value = this.dataset.dipinjam;
                
                document.getElementById('edit-title').innerText = "Edit: " + this.dataset.nama;
                modalEdit.classList.add('show'); 
            };
        });
    }
}

// Logika UI Interaktif
filterKategori.addEventListener('change', renderTabelBarang);
filterKondisi.addEventListener('change', renderTabelBarang);
btnCloseModal.addEventListener('click', () => modalEdit.classList.remove('show'));
window.addEventListener('click', (e) => {
    if (e.target === modalEdit) modalEdit.classList.remove('show');
});

// 3. Logika Submit (Tambah Barang Baru) - Menggunakan onsubmit
formAdd.onsubmit = function(e) {
    e.preventDefault(); 
    
    // Konversi Tipe Data Ketat (Strict Typecasting)
    const idStr = String(document.getElementById('add_kode').value).trim(); 
    const namaStr = String(document.getElementById('add_nama').value).trim();
    const kategoriStr = String(document.getElementById('add_kategori').value).trim();
    
    const totalNum = Number(document.getElementById('add_stok_total').value) || 0;
    const rusakNum = Number(document.getElementById('add_stok_rusak').value) || 0;
    const dipinjamNum = 0; 
    const tersediaNum = totalNum - rusakNum - dipinjamNum;

    if (rusakNum > totalNum) {
        alert("Stok rusak tidak boleh lebih dari Stok Total!");
        return;
    }

    const dataBaru = {
        nama: namaStr,
        kategori: kategoriStr,
        stok_total: totalNum,
        stok_rusak: rusakNum,
        stok_dipinjam: dipinjamNum,
        stok_tersedia: tersediaNum
    };

    set(ref(db, `barang/${idStr}`), dataBaru)
        .then(() => {
            alert("Barang baru ditambahkan!");
            formAdd.reset();
        })
        .catch(err => alert("Error: " + err));
};

// 4. Logika Submit (Update Barang via Modal)
formEdit.onsubmit = function(e) {
    e.preventDefault();
    
    // 1. Ambil elemen HTML-nya secara spesifik
    const elKode = document.getElementById('edit_kode');
    const elNama = document.getElementById('edit_nama');
    const elKategori = document.getElementById('edit_kategori');
    const elTotal = document.getElementById('edit_stok_total');
    const elRusak = document.getElementById('edit_stok_rusak');
    const elDipinjam = document.getElementById('edit_stok_dipinjam');

    // 2. Ekstrak nilainya (VALUE) secara eksplisit dan paksa menjadi Teks/Angka
    const valKode = String(elKode.value).trim();
    const valNama = String(elNama.value).trim();
    const valKategori = String(elKategori.value).trim();
    
    const numTotal = parseInt(elTotal.value) || 0;
    const numRusak = parseInt(elRusak.value) || 0;
    const numDipinjam = parseInt(elDipinjam.value) || 0;
    const numTersedia = numTotal - numRusak - numDipinjam;

    if (numRusak + numDipinjam > numTotal) {
        alert("Gagal update! Jumlah barang rusak + dipinjam melebihi Stok Total fisik.");
        return;
    }

    // 3. Susun objek menggunakan variabel yang sudah DIPASTIKAN BUKAN HTML
    const dataUpdate = {
        nama: valNama,
        kategori: valKategori,
        stok_total: numTotal,
        stok_rusak: numRusak,
        stok_dipinjam: numDipinjam,
        stok_tersedia: numTersedia
    };

    // 4. DEBUGGING: Cetak ke konsol untuk pembuktian
    console.log("=== CEK DATA SEBELUM KIRIM ===");
    console.log("ID Tujuan:", valKode);
    console.log("Isi Data:", dataUpdate);

    // 5. Kirim ke Firebase menggunakan update()
    update(ref(db, 'barang/' + valKode), dataUpdate)
        .then(() => {
            alert("Data barang berhasil diperbarui!");
            document.getElementById('editModal').classList.remove('show');
        })
        .catch(err => {
            console.error("Firebase Error:", err);
            alert("Error update: " + err);
        });
};