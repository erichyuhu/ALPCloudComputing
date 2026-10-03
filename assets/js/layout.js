// Memanggil fungsi saat halaman web pertama kali dimuat
document.addEventListener("DOMContentLoaded", () => {
    applySavedTheme(); // Cek memori dark mode terlebih dahulu
    loadLayout();      // Muat sidebar dan topbar
});

// Mengecek localStorage apakah user sebelumnya memilih dark mode
function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    }
}

// Mengambil komponen HTML dan mematribusikan logika klik
async function loadLayout() {
    try {
        const sidebarRes = await fetch('assets/components/sidebar.html');
        const topbarRes = await fetch('assets/components/topbar.html');
        
        document.getElementById('sidebar-container').innerHTML = await sidebarRes.text();
        document.getElementById('topbar-container').innerHTML = await topbarRes.text();

        // Setelah elemen terpasang, aktifkan tombol-tombolnya
        initUIInteractions();
    } catch (error) {
        console.error("Gagal memuat komponen layout:", error);
    }
}

function initUIInteractions() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');

    // Sesuaikan ikon matahari/bulan dengan tema yang sedang aktif
    if (document.body.getAttribute('data-theme') === 'dark') {
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    }

    // 1. Logika Toggle Sidebar
    menuToggle.addEventListener('click', (event) => {
        if (window.innerWidth > 768) {
            sidebar.classList.toggle('collapsed');
        } else {
            sidebar.classList.toggle('open');
        }
        event.stopPropagation(); 
    });

    // 2. Klik Luar Sidebar (Mobile)
    document.addEventListener('click', (event) => {
        if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
            if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
                sidebar.classList.remove('open');
            }
        }
    });

    // 3. Logika Dark Mode dengan localStorage
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        
        if (isDark) {
            document.body.removeAttribute('data-theme');
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'light'); // Simpan pilihan terang
        } else {
            document.body.setAttribute('data-theme', 'dark');
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'dark'); // Simpan pilihan gelap
        }
    });
}