# Zyst.ai (versi API key sendiri)

Struktur:
- `public/index.html` : tampilan website
- `api/chat.js`       : server yang memanggil Claude (API key aman di sini)

**Penting:** folder `api` dan `public` harus berada di *root* repo GitHub (bukan di dalam folder lain). Jika tidak, chat akan error "File not found".

## 1. Ambil API key
Buat akun di https://console.anthropic.com, isi saldo, lalu buat API key.
**Atur batas pengeluaran bulanan** di Console agar tagihan tidak membengkak.

## 2. Deploy gratis di Vercel
1. Upload folder ini ke GitHub (repo baru).
2. Buka https://vercel.com, login, klik **Add New > Project**, pilih repo tersebut.
3. Di **Environment Variables** tambahkan `ANTHROPIC_API_KEY` = key kamu.
4. Klik **Deploy**. Website langsung aktif di alamat `xxx.vercel.app`.

## 3. Pasang domain
1. Beli domain di registrar (Niagahoster, Rumahweb, Namecheap, Cloudflare, dll).
2. Di Vercel: Project > **Settings > Domains** > tambahkan domainmu.
3. Ikuti instruksi DNS yang ditampilkan Vercel (biasanya record A dan CNAME) di panel registrar.
4. Tunggu beberapa menit sampai beberapa jam, HTTPS aktif otomatis.

## Catatan
- Siapa pun yang membuka website bisa memakai kuota API kamu. Pembatas bawaan: 20 pertanyaan per 10 menit per IP (ubah lewat `RATE_LIMIT`). Untuk pengamanan lebih, tambahkan login.
- Jangan pernah menaruh API key di `index.html` atau meng-commit file `.env`.
- Model default `claude-sonnet-5-5`; ganti lewat variabel `MODEL` untuk model lain.
- Pembatas IP bersifat sederhana (tersimpan di memori server), cukup untuk pemakaian ringan.
