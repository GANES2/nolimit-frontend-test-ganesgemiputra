# NoLimit World Bank Population Dashboard

React dashboard untuk Front End Engineer test NoLimit. App ini mengambil data population dari World Bank API `SP.POP.TOTL` untuk United States, lalu menampilkan chart yang bisa difilter per tahun.

## What’s inside

- Line chart population per year
- Pie chart population per year
- Filter date range berdasarkan tahun
- Responsive layout untuk tablet sampai layar lebar

## Reviewer guide

Kalau ingin cek cepat, buka app lalu pastikan 4 hal ini:

1. Data tampil dari World Bank API.
2. Line chart berubah saat range tahun diubah.
3. Pie chart ikut berubah sesuai range tahun.
4. Layout tetap rapi di tablet dan desktop.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## API used

```text
https://api.worldbank.org/v2/country/US/indicator/SP.POP.TOTL?date=2012:2016&format=json
```

## Screenshots

- [Desktop preview](./screenshots/desktop-dashboard.png)
- [Tablet preview](./screenshots/tablet-dashboard.png)
