import { auth, signOut, onAuthStateChanged, db, ref, onValue, update, remove } from '../firebase_config.js';

const tableBody = document.getElementById('tableBody');
const dbRef = ref(db, 'peminjaman');
const editModal = new bootstrap.Modal(document.getElementById('editModal'));

// READ: Menarik data secara Real-time
onValue(dbRef, (snapshot) => {
    tableBody.innerHTML = '';
    
    snapshot.forEach((childSnapshot) => {
        const id = childSnapshot.key;
        const data = childSnapshot.val();
        const badgeClass = data.status === 'Dipinjam' ? 'bg-warning text-dark' : 'bg-success';

        // Buat baris tabel
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${data.nama}</td>
            <td>${data.barang}</td>
            <td>${data.tanggal}</td>
            <td>${data.jumlah}</td>
            <td><span class="badge ${badgeClass}">${data.status}</span></td>
            <td>
                <button class="btn btn-sm btn-info text-white btn-edit" data-id="${id}">Edit</button>
                <button class="btn btn-sm btn-danger btn-delete" data-id="${id}">Hapus</button>
            </td>
        `;
        tableBody.appendChild(tr);

        // Pasang Event Listener ke tombol Edit yang baru saja dibuat
        tr.querySelector('.btn-edit').addEventListener('click', () => {
            bukaModalEdit(id, data);
        });

        // Pasang Event Listener ke tombol Hapus
        tr.querySelector('.btn-delete').addEventListener('click', () => {
            hapusData(id);
        });
    });
});

// Fungsi menampilkan modal dan mengisi data lama
function bukaModalEdit(id, data) {
    document.getElementById('editId').value = id;
    document.getElementById('editNama').value = data.nama;
    document.getElementById('editBarang').value = data.barang;
    document.getElementById('editTanggal').value = data.tanggal;
    document.getElementById('editJumlah').value = data.jumlah;
    document.getElementById('editStatus').value = data.status;
    
    editModal.show();
}

// DELETE: Proses menghapus data
function hapusData(id) {
    if(confirm("Apakah Anda yakin ingin menghapus data ini?")) {
        remove(ref(db, 'peminjaman/' + id));
    }
}

// UPDATE: Proses menyimpan perubahan dari Modal Edit
document.getElementById('formEdit').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = document.getElementById('editId').value;
    const dataUpdate = {
        nama: document.getElementById('editNama').value,
        barang: document.getElementById('editBarang').value,
        tanggal: document.getElementById('editTanggal').value,
        jumlah: document.getElementById('editJumlah').value,
        status: document.getElementById('editStatus').value
    };

    update(ref(db, 'peminjaman/' + id), dataUpdate).then(() => {
        editModal.hide(); // Tutup pop-up otomatis setelah berhasil
        // Tidak perlu me-refresh tabel secara manual karena onValue (Real-time) akan mengurusnya
    });
});

onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = "index.html"; 
        }
    });

    const btnLogout = document.getElementById('btnLogout');
    
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            // Konfirmasi sebelum logout (opsional)
            const konfirmasi = confirm("Apakah Anda yakin ingin logout?");
            
            if (konfirmasi) {
                signOut(auth)
                    .then(() => {
                        alert("Anda telah berhasil logout.");
                        window.location.href = "index.html"; // Arahkan kembali ke halaman login
                    })
                    .catch((error) => {
                        alert("Gagal logout: " + error.message);
                    });
            }
        });
    }