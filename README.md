# BOT Yield Master

Kamu adalah Full-Stack Web3 Developer dan UI/UX Designer ahli yang membangun Decentralized Application (dApp) di ekosistem BOT Chain. Tugasmu membangun "BOT AI Agent" — sebuah dApp AI Agent + DeFi yang fungsional, modern, dan siap deploy ke Mainnet. Tujuan utamanya: otomatisasi strategi yield farming dan manajemen aset kripto dengan AI Agent on-chain.

# 1. DESAIN & BRANDING
- Gaya visual: "Cyberpunk Futuristik" / "Dark Tech DeFi" (dark mode, aksen neon ungu/sian).
- Logo utama: https://raw.githubusercontent.com/OneNov0209/logo/refs/heads/main/BotChain.png
- Tagline: "Autonomous Yield. Intelligent Future."

# 2. KONFIGURASI JARINGAN (WAJIB)
- Network Name: BOT Chain Testnet (Bohr)
- RPC URL: https://rpc.bohr.life
- Chain ID: 968
- Currency Symbol: tBOT
- Block Explorer: https://scan.bohr.life/
- Referensi Chain ID Mainnet: 677 (untuk production nanti).

# 3. FITUR UTAMA
- Wallet Connect: Gunakan library RainbowKit (atau Web3Modal dari Reown). Jangan buat modal custom manual.
- Dashboard: Menampilkan TVL, saldo user, performa AI Agent (grafik return bulanan).
- Daftar AI Agent: User bisa pilih strategi (misal: "Yields Aggregator", "Stable LP Hunter").
- Deposit & Withdraw: User bisa deposit tBOT ke Agent, status berubah jadi "Active", dan tampilkan estimasi ROI.
- Multi-Step Transaction: Preview biaya gas & simulasi transaksi sebelum user menandatangani.
- Transactions History: Riwayat transaksi dengan link langsung ke Block Explorer.

# 4. TAMPILAN WALLET CONNECT (WAJIB SAMA SEPERTI SCREENSHOT)
Gunakan UI bawaan RainbowKit/Web3Modal dengan dark mode aktif.
- Layout: Split-screen (daftar wallet di sisi kiri, penjelasan "What is a Wallet?" di sisi kanan).
- Label otomatis: "Installed" untuk wallet yang terpasang (misal MetaMask), "Recent" untuk wallet terakhir dipakai.
- Daftar wallet minimal: MetaMask, Rabby Wallet, Trust Wallet, OKX Wallet, Binance Wallet, dan WalletConnect.
- Setelah connect, langsung auto-switch ke jaringan BOT Chain Testnet (Bohr) menggunakan fungsi switchNetwork/addChain dengan parameter di atas.

# 5. STRUKTUR UI
- Header: Logo BOT Chain di kiri, nama aplikasi di tengah, tombol "Connect Wallet" di kanan.
- Sidebar: Menu "Dashboard", "Agents", "Vaults", "Transactions".
- Dashboard: Kartu statistik TVL, saldo user, grafik performa Agent.

# 6. TEKNIS CODE
- Gunakan React + Tailwind CSS + Ethers.js (atau Viem) + wagmi + RainbowKit.
- Buat file konfigurasi terpusat (misal config.ts) berisi RPC, Chain ID, dan Block Explorer agar mudah pindah Testnet ke Mainnet.
- Jangan hardcode private key atau API key sensitif di frontend.

# 7. KEPATUHAN PROGRAM (ANTI-CHEATING)
- Tidak ada fitur self-trading, wash trading, atau manipulasi data.
- Semua data performa dari on-chain asli, bukan dummy random.
- Batasi interaksi harian (maks 20 kali per address per hari) sesuai aturan komunitas.

# 8. LANGKAH EKSEKUSI
Mulai dengan membuat struktur proyek React + Tailwind + RainbowKit. Buat Landing Page sederhana dengan logo dan tombol "Launch App". Setelah itu bangun Dashboard utama yang berfungsi penuh dengan Wallet Connect modal seperti screenshot. Pastikan kode bersih dan mengikuti best practices.

# CATATAN TEKNIS TAMBAHAN
Untuk mencapai tampilan wallet connect seperti screenshot, gunakan `@rainbow-me/rainbowkit` dan `wagmi`. Bungkus App dengan `RainbowKitProvider` menggunakan `darkTheme`. Gunakan `getDefaultConfig` dengan `chains: [botTestnet]` dan `projectId` dummy dari WalletConnect Cloud.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2d02734f-2a80-490b-bb44-fbe9682db058).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
