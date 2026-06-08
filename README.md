# NoLimit World Bank Population Dashboard

React dashboard untuk test Front End Engineer NoLimit. Aplikasi ini mengambil data dari World Bank API `SP.POP.TOTL` untuk United States pada rentang 2012 sampai 2016, lalu menampilkan:

- Line/area chart populasi per tahun
- Pie chart proporsi populasi per tahun
- Filter date range berdasarkan tahun
- Layout responsif dari tablet sampai layar lebar

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## API

```text
https://api.worldbank.org/v2/country/US/indicator/SP.POP.TOTL?date=2012:2016&format=json
```
