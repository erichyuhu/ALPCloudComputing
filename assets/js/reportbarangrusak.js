import { db, ref, onValue, set, update } from "./firebase_config.js";

const formReportRusak = document.getElementById('form-report-rusak');

formReportRusak.onsubmit = function(e) {
    e.preventDefault();

    // 1. Ambil nilai dari form
    const idStr = String(document.getElementById('report_kode').value).trim();
    
    // Ambil angka dari field readonly (sebagai acuan batas maksimal)
    const totalNum = parseInt(document.getElementById('report_stok_total').value) || 0;
    const dipinjamNum = parseInt(document.getElementById('report_stok_dipinjam').value) || 0;
    
    // Ambil angka rusak yang baru diinput user
    const rusakNumBaru = parseInt(document.getElementById('report_stok_rusak').value) || 0;

    // 2. Validasi Logika 4-Pilar
    if (rusakNumBaru + dipinjamNum > totalNum) {
        alert("Gagal! Jumlah barang rusak + dipinjam melebihi fisik Stok Total.");
        return;
    }

    // 3. Hitung ulang stok tersedia
    const tersediaNumBaru = totalNum - rusakNumBaru - dipinjamNum;

    // 4. Update HANYA pilar stok yang berubah ke Firebase
    const dataUpdate = {
        stok_rusak: rusakNumBaru,
        stok_tersedia: tersediaNumBaru
    };

    update(ref(db, `barang/${idStr}`), dataUpdate)
        .then(() => {
            alert("Laporan kerusakan berhasil diupdate!");
            // Tutup modal di sini (sesuaikan dengan class/ID modal Anda)
            // document.getElementById('modalReport').classList.remove('show');
        })
        .catch(err => {
            console.error(err);
            alert("Error: " + err);
        });
};