import React from "react";
import { createRoot } from "react-dom/client";
import { Activity, AlertCircle, CalendarRange, RefreshCw, TrendingUp, Users } from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import "./styles.css";

const API_URL =
  "https://api.worldbank.org/v2/country/US/indicator/SP.POP.TOTL?date=2012:2016&format=json";

const COLORS = ["#2563eb", "#0f766e", "#f59e0b", "#dc2626", "#7c3aed"];
const YEARS = [2012, 2013, 2014, 2015, 2016];

const numberFormatter = new Intl.NumberFormat("en-US");
const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1
});

function normalizePopulation(payload) {
  const rows = Array.isArray(payload?.[1]) ? payload[1] : [];

  return rows
    .filter((item) => item?.date && typeof item.value === "number")
    .map((item) => ({
      year: Number(item.date),
      population: item.value,
      populationLabel: numberFormatter.format(item.value)
    }))
    .sort((a, b) => a.year - b.year);
}

function getGrowth(data) {
  if (data.length < 2) {
    return 0;
  }

  const first = data[0].population;
  const last = data[data.length - 1].population;

  return ((last - first) / first) * 100;
}

function App() {
  const [populationData, setPopulationData] = React.useState([]);
  const [range, setRange] = React.useState({ start: 2012, end: 2016 });
  const [status, setStatus] = React.useState("loading");
  const [error, setError] = React.useState("");

  const fetchPopulation = React.useCallback(async () => {
    setStatus("loading");
    setError("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload = await response.json();
      const normalized = normalizePopulation(payload);

      if (!normalized.length) {
        throw new Error("Population data is empty.");
      }

      setPopulationData(normalized);
      setRange({
        start: normalized[0].year,
        end: normalized[normalized.length - 1].year
      });
      setStatus("ready");
    } catch (caughtError) {
      setError(caughtError.message || "Unable to load population data.");
      setStatus("error");
    }
  }, []);

  React.useEffect(() => {
    fetchPopulation();
  }, [fetchPopulation]);

  const filteredData = React.useMemo(
    () => populationData.filter((item) => item.year >= range.start && item.year <= range.end),
    [populationData, range]
  );

  const totalPopulation = filteredData.reduce((sum, item) => sum + item.population, 0);
  const highestPopulation = filteredData.reduce(
    (highest, item) => (item.population > highest.population ? item : highest),
    { year: "-", population: 0 }
  );
  const growth = getGrowth(filteredData);
  const latestYear = populationData.at(-1)?.year ?? 2016;

  function updateRange(key, value) {
    const selectedYear = Number(value);

    setRange((current) => {
      if (key === "start") {
        return {
          start: selectedYear,
          end: Math.max(selectedYear, current.end)
        };
      }

      return {
        start: Math.min(current.start, selectedYear),
        end: selectedYear
      };
    });
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero__content">
          <span className="eyebrow">World Bank API • United States</span>
          <h1>Population Analytics</h1>
          <p>
            Interactive line and pie chart dashboard based on annual population values from 2012 to
            2016.
          </p>
        </div>

        <div className="source-panel" aria-label="Data source">
          <div>
            <span>Source</span>
            <strong>SP.POP.TOTL</strong>
          </div>
          <button className="icon-button" type="button" onClick={fetchPopulation} aria-label="Refresh data">
            <RefreshCw size={18} />
          </button>
        </div>
      </section>

      {status === "error" ? (
        <section className="state-panel" role="alert">
          <AlertCircle size={22} />
          <div>
            <strong>Could not load data</strong>
            <p>{error}</p>
          </div>
          <button type="button" onClick={fetchPopulation}>
            Try Again
          </button>
        </section>
      ) : (
        <>
          <section className="toolbar" aria-label="Year filter">
            <div className="toolbar__title">
              <CalendarRange size={20} />
              <div>
                <span>Filter Date Range</span>
                <strong>
                  {range.start} - {range.end}
                </strong>
              </div>
            </div>

            <div className="range-controls">
              <label>
                Start Year
                <select
                  value={range.start}
                  onChange={(event) => updateRange("start", event.target.value)}
                  disabled={status === "loading"}
                >
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                End Year
                <select
                  value={range.end}
                  onChange={(event) => updateRange("end", event.target.value)}
                  disabled={status === "loading"}
                >
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="metrics-grid" aria-label="Population summary">
            <MetricCard
              icon={<Users size={20} />}
              label="Total Population"
              value={status === "loading" ? "Loading" : compactFormatter.format(totalPopulation)}
              detail={`${filteredData.length || 0} selected year${filteredData.length === 1 ? "" : "s"}`}
            />
            <MetricCard
              icon={<TrendingUp size={20} />}
              label="Range Growth"
              value={status === "loading" ? "Loading" : `${growth.toFixed(2)}%`}
              detail={`From ${range.start} to ${range.end}`}
            />
            <MetricCard
              icon={<Activity size={20} />}
              label="Highest Year"
              value={status === "loading" ? "Loading" : String(highestPopulation.year)}
              detail={`${compactFormatter.format(highestPopulation.population)} people`}
            />
          </section>

          <section className="charts-grid">
            <ChartPanel title="Population Trend" subtitle={`Annual values until ${latestYear}`}>
              {status === "loading" ? (
                <ChartSkeleton />
              ) : (
                <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={300}>
                  <LineChart data={filteredData} margin={{ top: 14, right: 18, left: 4, bottom: 4 }}>
                    <CartesianGrid stroke="#d7dee8" strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="year" tickLine={false} axisLine={false} />
                    <YAxis
                      domain={[
                        (dataMin) => Math.floor((dataMin - 1_500_000) / 1_000_000) * 1_000_000,
                        (dataMax) => Math.ceil((dataMax + 1_500_000) / 1_000_000) * 1_000_000
                      ]}
                      tickFormatter={(value) => compactFormatter.format(value)}
                      tickLine={false}
                      axisLine={false}
                      width={58}
                    />
                    <Tooltip content={<PopulationTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="population"
                      name="Population"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#ffffff", stroke: "#2563eb", strokeWidth: 2 }}
                      activeDot={{ r: 7, fill: "#2563eb", stroke: "#ffffff", strokeWidth: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartPanel>

            <ChartPanel title="Population Share" subtitle="Distribution by selected year">
              {status === "loading" ? (
                <ChartSkeleton />
              ) : (
                <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={300}>
                  <PieChart>
                    <Pie
                      data={filteredData}
                      dataKey="population"
                      nameKey="year"
                      cx="50%"
                      cy="48%"
                      innerRadius="52%"
                      outerRadius="78%"
                      paddingAngle={3}
                      stroke="#ffffff"
                      strokeWidth={3}
                    >
                      {filteredData.map((entry, index) => (
                        <Cell key={entry.year} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PopulationTooltip />} />
                    <Legend
                      formatter={(value) => <span className="legend-label">{value}</span>}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartPanel>
          </section>
        </>
      )}
    </main>
  );
}

function MetricCard({ icon, label, value, detail }) {
  return (
    <article className="metric-card">
      <div className="metric-card__icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function ChartPanel({ title, subtitle, children }) {
  return (
    <article className="chart-panel">
      <header>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </header>
      <div className="chart-frame">{children}</div>
    </article>
  );
}

function PopulationTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;
  const year = point?.year ?? label ?? payload[0].name;
  const value = point?.population ?? payload[0].value;

  return (
    <div className="tooltip">
      <span>{year}</span>
      <strong>{numberFormatter.format(value)}</strong>
      <small>people</small>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="chart-skeleton" aria-label="Loading chart">
      <span />
      <span />
      <span />
    </div>
  );
}

export default App;

const rootElement = document.getElementById("root");
const root = rootElement.__nolimitRoot ?? createRoot(rootElement);
rootElement.__nolimitRoot = root;

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
