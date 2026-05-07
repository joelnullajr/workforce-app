import { useState } from "react";
import {
  LayoutDashboard, Users, CalendarCheck, Palmtree,
  BarChart3, Search, ChevronRight, X, Bell,
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const DEPARTMENTS = ["All", "HR", "Engineering", "Sales", "Operations", "Finance"];

const EMPLOYEES = [
  { id: "EMP-001", name: "Maria Santos",    dept: "HR",          position: "HR Manager",         status: "Active",   avatar: "MS" },
  { id: "EMP-002", name: "Jose Reyes",      dept: "Engineering", position: "Software Engineer",  status: "Active",   avatar: "JR" },
  { id: "EMP-003", name: "Ana Cruz",        dept: "Sales",       position: "Sales Associate",    status: "Active",   avatar: "AC" },
  { id: "EMP-004", name: "Mark Lim",        dept: "Operations",  position: "Operations Lead",    status: "Active",   avatar: "ML" },
  { id: "EMP-005", name: "Clara Reyes",     dept: "Finance",     position: "Finance Analyst",    status: "Active",   avatar: "CR" },
  { id: "EMP-006", name: "Diego Mendoza",   dept: "Engineering", position: "Frontend Developer", status: "Active",   avatar: "DM" },
  { id: "EMP-007", name: "Sofia Aquino",    dept: "Sales",       position: "Sales Manager",      status: "Active",   avatar: "SA" },
  { id: "EMP-008", name: "Rafael Torres",   dept: "Operations",  position: "Logistics Officer",  status: "Inactive", avatar: "RT" },
  { id: "EMP-009", name: "Lia Villanueva",  dept: "HR",          position: "HR Associate",       status: "Active",   avatar: "LV" },
  { id: "EMP-010", name: "Carlos Bautista", dept: "Engineering", position: "Backend Engineer",   status: "Active",   avatar: "CB" },
];

const STATUS_TYPES = ["P", "L", "A", "WFH", "S"];
const STATUS_WEIGHTS = [0.72, 0.08, 0.05, 0.10, 0.05];

function weightedRandom() {
  const r = Math.random();
  let acc = 0;
  for (let i = 0; i < STATUS_WEIGHTS.length; i++) {
    acc += STATUS_WEIGHTS[i];
    if (r < acc) return STATUS_TYPES[i];
  }
  return "P";
}

const MAY_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const WORKDAYS = MAY_DAYS.filter(d => {
  const day = new Date(2025, 4, d).getDay();
  return day !== 0 && day !== 6;
});

const ATTENDANCE = {};
EMPLOYEES.forEach(emp => {
  ATTENDANCE[emp.id] = {};
  WORKDAYS.forEach(d => { ATTENDANCE[emp.id][d] = weightedRandom(); });
  ATTENDANCE[emp.id][6] = emp.status === "Inactive" ? "A" :
    emp.id === "EMP-003" || emp.id === "EMP-007" ? "L" :
    emp.id === "EMP-005" ? "S" :
    emp.id === "EMP-008" ? "A" : "P";
});

const LEAVE_CREDITS = {};
EMPLOYEES.forEach(emp => {
  const vlUsed = Math.floor(Math.random() * 8);
  const slUsed = Math.floor(Math.random() * 4);
  const elUsed = Math.floor(Math.random() * 2);
  LEAVE_CREDITS[emp.id] = {
    VL: { total: 15, used: vlUsed, remaining: 15 - vlUsed },
    SL: { total: 10, used: slUsed, remaining: 10 - slUsed },
    EL: { total: 3,  used: elUsed, remaining: 3 - elUsed },
    UL: { total: 0,  used: 0,      remaining: 0 },
  };
});

const LEAVE_HISTORY = {
  "EMP-001": [
    { id: "L001", type: "VL", from: "May 1", to: "May 2", days: 2, reason: "Family vacation", status: "Approved" },
    { id: "L002", type: "SL", from: "Apr 10", to: "Apr 10", days: 1, reason: "Fever", status: "Approved" },
  ],
  "EMP-002": [{ id: "L003", type: "VL", from: "Apr 21", to: "Apr 25", days: 5, reason: "Planned leave", status: "Approved" }],
  "EMP-003": [
    { id: "L004", type: "VL", from: "May 6", to: "May 8", days: 3, reason: "Personal matters", status: "Approved" },
    { id: "L005", type: "EL", from: "Mar 15", to: "Mar 15", days: 1, reason: "Family emergency", status: "Approved" },
  ],
  "EMP-004": [{ id: "L006", type: "SL", from: "Apr 3", to: "Apr 4", days: 2, reason: "Medical check-up", status: "Approved" }],
  "EMP-005": [{ id: "L007", type: "SL", from: "May 6", to: "May 7", days: 2, reason: "Flu", status: "Approved" }],
  "EMP-006": [],
  "EMP-007": [
    { id: "L008", type: "VL", from: "May 6", to: "May 9", days: 4, reason: "Vacation", status: "Approved" },
    { id: "L009", type: "VL", from: "Mar 10", to: "Mar 12", days: 3, reason: "Rest", status: "Approved" },
  ],
  "EMP-008": [{ id: "L010", type: "UL", from: "May 1", to: "May 6", days: 4, reason: "Unauthorized", status: "Pending" }],
  "EMP-009": [{ id: "L011", type: "EL", from: "Feb 20", to: "Feb 20", days: 1, reason: "Bereavement", status: "Approved" }],
  "EMP-010": [{ id: "L012", type: "VL", from: "Apr 14", to: "Apr 18", days: 5, reason: "Holy week", status: "Approved" }],
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const STATUS_META = {
  P:   { label: "Present",  color: "#00C897", bg: "#00C89718" },
  L:   { label: "On Leave", color: "#00B4D8", bg: "#00B4D818" },
  A:   { label: "Absent",   color: "#FF5C6C", bg: "#FF5C6C18" },
  WFH: { label: "WFH",      color: "#9B8EFF", bg: "#9B8EFF18" },
  S:   { label: "Sick",     color: "#FFB347", bg: "#FFB34718" },
};

const DEPT_COLORS = {
  HR: "#00B4D8", Engineering: "#9B8EFF", Sales: "#00C897",
  Operations: "#FFB347", Finance: "#FF8FA3",
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const S = {
  app: {
    display: "flex", height: "100vh", background: "#070E17",
    fontFamily: "'IBM Plex Sans', sans-serif", color: "#E8EDF3", overflow: "hidden",
  },
  sidebar: {
    width: 220, background: "#0D1B2A", borderRight: "1px solid #1A2E42",
    display: "flex", flexDirection: "column", flexShrink: 0,
  },
  logo: { padding: "24px 20px 20px", borderBottom: "1px solid #1A2E42" },
  logoText: {
    fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600,
    color: "#00B4D8", letterSpacing: "0.08em", textTransform: "uppercase",
  },
  logoSub: { fontSize: 10, color: "#4A6070", marginTop: 2, letterSpacing: "0.12em" },
  nav: { flex: 1, padding: "16px 0" },
  navItem: (active) => ({
    display: "flex", alignItems: "center", gap: 10, padding: "10px 20px",
    cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 400,
    color: active ? "#00B4D8" : "#6A8090",
    background: active ? "#00B4D810" : "transparent",
    borderLeft: active ? "2px solid #00B4D8" : "2px solid transparent",
    transition: "all 0.15s ease",
  }),
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  topbar: {
    background: "#0D1B2A", borderBottom: "1px solid #1A2E42",
    padding: "0 28px", height: 56, display: "flex", alignItems: "center",
    justifyContent: "space-between", flexShrink: 0,
  },
  pageTitle: { fontSize: 16, fontWeight: 600, color: "#E8EDF3" },
  content: { flex: 1, overflow: "auto", padding: "24px 28px" },
  card: {
    background: "#0D1B2A", border: "1px solid #1A2E42", borderRadius: 10,
    padding: "20px 24px",
  },
  statCard: (accent) => ({
    background: "#0D1B2A", border: `1px solid ${accent}30`,
    borderRadius: 10, padding: "18px 22px", position: "relative", overflow: "hidden",
  }),
  sectionTitle: {
    fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600,
    color: "#4A6070", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16,
  },
  badge: (color, bg) => ({
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, color, background: bg,
  }),
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 600,
    color: "#4A6070", letterSpacing: "0.1em", textTransform: "uppercase",
    padding: "10px 14px", textAlign: "left", borderBottom: "1px solid #1A2E42",
  },
  td: { padding: "12px 14px", fontSize: 13, color: "#C0CDD8", borderBottom: "1px solid #111E2A" },
  avatar: (color, size = 32) => ({
    width: size, height: size, borderRadius: "50%", background: color + "22",
    border: `1px solid ${color}44`, display: "flex", alignItems: "center",
    justifyContent: "center", fontFamily: "'IBM Plex Mono', monospace",
    fontSize: size * 0.34, fontWeight: 600, color, flexShrink: 0,
  }),
  searchBox: {
    display: "flex", alignItems: "center", gap: 8,
    background: "#0A1520", border: "1px solid #1A2E42", borderRadius: 7, padding: "8px 14px",
  },
  searchInput: {
    background: "transparent", border: "none", outline: "none",
    color: "#C0CDD8", fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", width: 200,
  },
  btn: (variant = "primary") => ({
    padding: "8px 18px", borderRadius: 7, fontSize: 13, fontWeight: 500,
    cursor: "pointer", border: "none", fontFamily: "'IBM Plex Sans', sans-serif",
    background: variant === "primary" ? "#00B4D8" : "#1A2E42",
    color: variant === "primary" ? "#fff" : "#8A9BB0",
  }),
  modal: {
    position: "fixed", inset: 0, background: "#00000090",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
  },
  modalBox: {
    background: "#0D1B2A", border: "1px solid #1A2E42", borderRadius: 14,
    padding: 28, width: 520, maxHeight: "80vh", overflow: "auto",
  },
  input: {
    width: "100%", background: "#0A1520", border: "1px solid #1A2E42",
    borderRadius: 7, padding: "9px 12px", color: "#C0CDD8", fontSize: 13,
    fontFamily: "'IBM Plex Sans', sans-serif", outline: "none", boxSizing: "border-box",
  },
  select: {
    background: "#0A1520", border: "1px solid #1A2E42", borderRadius: 7,
    padding: "9px 12px", color: "#C0CDD8", fontSize: 13,
    fontFamily: "'IBM Plex Sans', sans-serif", outline: "none",
  },
  label: {
    fontSize: 11, color: "#4A6070", marginBottom: 6, display: "block",
    fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.08em", textTransform: "uppercase",
  },
};

// ─── SMALL COMPONENTS ────────────────────────────────────────────────────────
function Avatar({ emp, size = 32 }) {
  const color = DEPT_COLORS[emp.dept] || "#00B4D8";
  return <div style={S.avatar(color, size)}>{emp.avatar}</div>;
}

function StatusBadge({ code }) {
  const m = STATUS_META[code] || STATUS_META["P"];
  return <span style={S.badge(m.color, m.bg)}>{m.label}</span>;
}

function LeaveStatusBadge({ status }) {
  const colors = { Approved: ["#00C897","#00C89718"], Pending: ["#FFB347","#FFB34718"], Rejected: ["#FF5C6C","#FF5C6C18"] };
  const [c, b] = colors[status] || ["#8A9BB0", "#1A2E42"];
  return <span style={S.badge(c, b)}>{status}</span>;
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard() {
  const today = 6;
  const active = EMPLOYEES.filter(e => e.status === "Active");
  const todayStats = active.reduce((acc, emp) => {
    const s = ATTENDANCE[emp.id][today];
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const present = todayStats["P"] || 0;
  const onLeave = (todayStats["L"] || 0) + (todayStats["S"] || 0);
  const wfh = todayStats["WFH"] || 0;
  const absent = todayStats["A"] || 0;
  const total = active.length;
  const rate = Math.round((present + wfh) / total * 100);

  const pieData = [
    { name: "Present", value: present, color: "#00C897" },
    { name: "On Leave", value: onLeave, color: "#00B4D8" },
    { name: "WFH", value: wfh, color: "#9B8EFF" },
    { name: "Absent", value: absent, color: "#FF5C6C" },
  ];

  const onLeaveToday = active.filter(e => ATTENDANCE[e.id][today] === "L" || ATTENDANCE[e.id][today] === "S");

  const deptData = ["HR","Engineering","Sales","Operations","Finance"].map(dept => {
    const emps = active.filter(e => e.dept === dept);
    const p = emps.filter(e => { const s = ATTENDANCE[e.id][today]; return s === "P" || s === "WFH"; }).length;
    return { dept, rate: emps.length ? Math.round(p / emps.length * 100) : 0 };
  });

  const stats = [
    { label: "Total Employees", value: total,          accent: "#00B4D8", sub: `${active.length} active` },
    { label: "Present Today",   value: present + wfh,  accent: "#00C897", sub: `${rate}% attendance rate` },
    { label: "On Leave / Sick", value: onLeave,         accent: "#FFB347", sub: "today" },
    { label: "Absent",          value: absent,          accent: "#FF5C6C", sub: "unaccounted" },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={S.statCard(s.accent)}>
            <div style={{ fontSize: 11, color: "#4A6070", fontFamily: "'IBM Plex Mono',monospace",
              letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: s.accent,
              fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#4A6070", marginTop: 8 }}>{s.sub}</div>
            <div style={{ position: "absolute", right: -10, top: -10, width: 80, height: 80,
              borderRadius: "50%", background: s.accent + "08" }} />
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={S.card}>
          <div style={S.sectionTitle}>Today's Breakdown</div>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <PieChart width={140} height={140}>
              <Pie data={pieData} cx={70} cy={70} innerRadius={42} outerRadius={62} paddingAngle={3} dataKey="value">
                {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
            </PieChart>
            <div style={{ flex: 1 }}>
              <div style={{ textAlign: "center", marginBottom: 12 }}>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 28, fontWeight: 700, color: "#00C897" }}>{rate}%</div>
                <div style={{ fontSize: 11, color: "#4A6070" }}>attendance rate</div>
              </div>
              {pieData.map(d => (
                <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                    <span style={{ fontSize: 12, color: "#8A9BB0" }}>{d.name}</span>
                  </div>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, fontWeight: 600, color: d.color }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={S.card}>
          <div style={S.sectionTitle}>Attendance by Department</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={deptData} barSize={16}>
              <XAxis dataKey="dept" tick={{ fontSize: 10, fill: "#4A6070", fontFamily: "'IBM Plex Mono',monospace" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0,100]} tick={{ fontSize: 10, fill: "#4A6070" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0D1B2A", border: "1px solid #1A2E42", borderRadius: 6, fontSize: 12 }} formatter={(v) => [`${v}%`, "Rate"]} />
              <Bar dataKey="rate" radius={[4,4,0,0]}>
                {deptData.map((d) => <Cell key={d.dept} fill={DEPT_COLORS[d.dept] || "#00B4D8"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={S.card}>
        <div style={S.sectionTitle}>On Leave / Sick Today ({onLeaveToday.length})</div>
        {onLeaveToday.length === 0
          ? <div style={{ color: "#4A6070", fontSize: 13 }}>No employees on leave today.</div>
          : <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {onLeaveToday.map(emp => (
                <div key={emp.id} style={{ display: "flex", alignItems: "center", gap: 10,
                  background: "#0A1520", border: "1px solid #1A2E42", borderRadius: 8, padding: "10px 14px" }}>
                  <Avatar emp={emp} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#C0CDD8" }}>{emp.name}</div>
                    <div style={{ fontSize: 11, color: "#4A6070" }}>{emp.dept}</div>
                  </div>
                  <StatusBadge code={ATTENDANCE[emp.id][today]} />
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );
}

// ─── EMPLOYEES ───────────────────────────────────────────────────────────────
function EmployeeDirectory({ onSelect }) {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const filtered = EMPLOYEES.filter(e => {
    const q = search.toLowerCase();
    return (e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q)) && (dept === "All" || e.dept === dept);
  });
  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div style={S.searchBox}>
          <Search size={14} color="#4A6070" />
          <input style={S.searchInput} placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select style={S.select} value={dept} onChange={e => setDept(e.target.value)}>
          {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>
      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>{["Employee","ID","Department","Position","Status","Today",""].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map(emp => (
              <tr key={emp.id} style={{ cursor: "pointer" }} onClick={() => onSelect(emp)}>
                <td style={S.td}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar emp={emp} /><span style={{ fontWeight: 500, color: "#E8EDF3" }}>{emp.name}</span></div></td>
                <td style={{ ...S.td, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: "#4A6070" }}>{emp.id}</td>
                <td style={S.td}><span style={S.badge(DEPT_COLORS[emp.dept], DEPT_COLORS[emp.dept]+"18")}>{emp.dept}</span></td>
                <td style={S.td}>{emp.position}</td>
                <td style={S.td}><span style={S.badge(emp.status==="Active"?"#00C897":"#FF5C6C", emp.status==="Active"?"#00C89718":"#FF5C6C18")}>{emp.status}</span></td>
                <td style={S.td}><StatusBadge code={ATTENDANCE[emp.id][6]} /></td>
                <td style={S.td}><ChevronRight size={14} color="#4A6070" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────
function AttendanceTracker() {
  const [selEmp, setSelEmp] = useState("All");
  const employees = selEmp === "All" ? EMPLOYEES : EMPLOYEES.filter(e => e.id === selEmp);
  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
        <select style={S.select} value={selEmp} onChange={e => setSelEmp(e.target.value)}>
          <option value="All">All Employees</option>
          {EMPLOYEES.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "#4A6070", letterSpacing: "0.1em" }}>MAY 2025</div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {Object.entries(STATUS_META).map(([k, m]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: m.color }} />
            <span style={{ fontSize: 11, color: "#4A6070" }}>{m.label}</span>
          </div>
        ))}
      </div>
      <div style={S.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ ...S.table, minWidth: 900 }}>
            <thead>
              <tr>
                <th style={{ ...S.th, minWidth: 160 }}>Employee</th>
                {WORKDAYS.map(d => (
                  <th key={d} style={{ ...S.th, textAlign: "center", padding: "10px 4px", minWidth: 32, color: d===6?"#00B4D8":"#4A6070" }}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id}>
                  <td style={S.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar emp={emp} size={26} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: "#C0CDD8" }}>{emp.name}</div>
                        <div style={{ fontSize: 10, color: "#4A6070" }}>{emp.dept}</div>
                      </div>
                    </div>
                  </td>
                  {WORKDAYS.map(d => {
                    const code = ATTENDANCE[emp.id][d];
                    const m = STATUS_META[code];
                    return (
                      <td key={d} style={{ ...S.td, textAlign: "center", padding: "6px 2px", background: d===6?"#00B4D808":"transparent" }}>
                        <div style={{ width: 24, height: 24, borderRadius: 5, background: m.bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontSize: 10, color: m.color, fontWeight: 700 }}>
                          {code === "WFH" ? "⌂" : code === "S" ? "+" : code}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── LEAVE CREDITS ────────────────────────────────────────────────────────────
function LeaveCredits() {
  const [showModal, setShowModal] = useState(false);
  const [selEmp, setSelEmp] = useState(null);
  const [form, setForm] = useState({ empId: "", type: "VL", from: "", to: "", reason: "" });
  const activeEmp = EMPLOYEES.filter(e => e.status === "Active");
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <button style={S.btn("primary")} onClick={() => { setForm({ empId:"",type:"VL",from:"",to:"",reason:"" }); setShowModal(true); }}>+ File a Leave</button>
      </div>
      <div style={S.card}>
        <div style={S.sectionTitle}>Leave Balance — All Employees</div>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Employee</th>
              <th style={{ ...S.th, textAlign:"center" }}>VL Total</th>
              <th style={{ ...S.th, textAlign:"center" }}>VL Used</th>
              <th style={{ ...S.th, textAlign:"center" }}>VL Left</th>
              <th style={{ ...S.th, textAlign:"center" }}>SL Left</th>
              <th style={{ ...S.th, textAlign:"center" }}>EL Left</th>
              <th style={S.th}>History</th>
            </tr>
          </thead>
          <tbody>
            {activeEmp.map(emp => {
              const c = LEAVE_CREDITS[emp.id];
              return (
                <tr key={emp.id}>
                  <td style={S.td}><div style={{ display:"flex",alignItems:"center",gap:10 }}><Avatar emp={emp} /><div><div style={{ fontSize:13,fontWeight:500,color:"#E8EDF3" }}>{emp.name}</div><div style={{ fontSize:11,color:"#4A6070" }}>{emp.dept}</div></div></div></td>
                  {[["total","#8A9BB0"],["used","#FF5C6C"],["remaining","#00C897"]].map(([k,col]) => (
                    <td key={k} style={{ ...S.td, textAlign:"center" }}><span style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:16,fontWeight:600,color:col }}>{c.VL[k]}</span></td>
                  ))}
                  <td style={{ ...S.td, textAlign:"center" }}><span style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:16,fontWeight:600,color:"#FFB347" }}>{c.SL.remaining}</span></td>
                  <td style={{ ...S.td, textAlign:"center" }}><span style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:16,fontWeight:600,color:"#9B8EFF" }}>{c.EL.remaining}</span></td>
                  <td style={S.td}><button style={{ ...S.btn("ghost"),padding:"4px 10px",fontSize:11 }} onClick={() => setSelEmp(emp)}>View ({(LEAVE_HISTORY[emp.id]||[]).length})</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selEmp && (
        <div style={S.modal} onClick={() => setSelEmp(null)}>
          <div style={S.modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
              <div style={{ display:"flex",alignItems:"center",gap:12 }}><Avatar emp={selEmp} size={36} /><div><div style={{ fontWeight:600,color:"#E8EDF3" }}>{selEmp.name}</div><div style={{ fontSize:11,color:"#4A6070" }}>Leave History</div></div></div>
              <button style={{ background:"none",border:"none",cursor:"pointer",color:"#4A6070" }} onClick={() => setSelEmp(null)}><X size={16} /></button>
            </div>
            <table style={S.table}>
              <thead><tr>{["Type","From","To","Days","Reason","Status"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {(LEAVE_HISTORY[selEmp.id]||[]).map(l => (
                  <tr key={l.id}>
                    <td style={S.td}><span style={S.badge("#00B4D8","#00B4D818")}>{l.type}</span></td>
                    <td style={{ ...S.td,fontFamily:"'IBM Plex Mono',monospace",fontSize:12 }}>{l.from}</td>
                    <td style={{ ...S.td,fontFamily:"'IBM Plex Mono',monospace",fontSize:12 }}>{l.to}</td>
                    <td style={{ ...S.td,fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:600,color:"#C0CDD8" }}>{l.days}</td>
                    <td style={{ ...S.td,maxWidth:140,fontSize:12 }}>{l.reason}</td>
                    <td style={S.td}><LeaveStatusBadge status={l.status} /></td>
                  </tr>
                ))}
                {(LEAVE_HISTORY[selEmp.id]||[]).length===0 && <tr><td colSpan={6} style={{ ...S.td,color:"#4A6070",textAlign:"center" }}>No leave history</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div style={S.modal} onClick={() => setShowModal(false)}>
          <div style={S.modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
              <div style={{ fontWeight:600,fontSize:16,color:"#E8EDF3" }}>File a Leave Request</div>
              <button style={{ background:"none",border:"none",cursor:"pointer",color:"#4A6070" }} onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
              <div style={{ gridColumn:"1 / -1" }}>
                <label style={S.label}>Employee</label>
                <select style={{ ...S.select,width:"100%" }} value={form.empId} onChange={e => setForm({...form,empId:e.target.value})}>
                  <option value="">Select employee...</option>
                  {activeEmp.map(e => <option key={e.id} value={e.id}>{e.name} — {e.dept}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Leave Type</label>
                <select style={{ ...S.select,width:"100%" }} value={form.type} onChange={e => setForm({...form,type:e.target.value})}>
                  <option value="VL">Vacation Leave (VL)</option>
                  <option value="SL">Sick Leave (SL)</option>
                  <option value="EL">Emergency Leave (EL)</option>
                  <option value="UL">Unpaid Leave (UL)</option>
                </select>
              </div>
              <div />
              <div><label style={S.label}>Date From</label><input type="date" style={S.input} value={form.from} onChange={e => setForm({...form,from:e.target.value})} /></div>
              <div><label style={S.label}>Date To</label><input type="date" style={S.input} value={form.to} onChange={e => setForm({...form,to:e.target.value})} /></div>
              <div style={{ gridColumn:"1 / -1" }}>
                <label style={S.label}>Reason</label>
                <textarea style={{ ...S.input,height:80,resize:"vertical" }} value={form.reason} onChange={e => setForm({...form,reason:e.target.value})} placeholder="Enter reason for leave..." />
              </div>
            </div>
            <div style={{ display:"flex",justifyContent:"flex-end",gap:10,marginTop:24 }}>
              <button style={S.btn("ghost")} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={S.btn("primary")} onClick={() => { alert("Leave request submitted! (Demo mode)"); setShowModal(false); }}>Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── REPORTS ─────────────────────────────────────────────────────────────────
function Reports() {
  const summaries = EMPLOYEES.map(emp => {
    const days = WORKDAYS.map(d => ATTENDANCE[emp.id][d]);
    const count = (code) => days.filter(d => d === code).length;
    return { emp, present: count("P"), wfh: count("WFH"), leave: count("L"), sick: count("S"), absent: count("A"), total: WORKDAYS.length };
  });
  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#4A6070",letterSpacing:"0.1em" }}>MONTHLY SUMMARY — MAY 2025</div>
        <button style={S.btn("ghost")}>⬇ Export CSV</button>
      </div>
      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Employee</th>
              <th style={S.th}>Dept</th>
              <th style={{ ...S.th,textAlign:"center",color:"#00C897" }}>Present</th>
              <th style={{ ...S.th,textAlign:"center",color:"#9B8EFF" }}>WFH</th>
              <th style={{ ...S.th,textAlign:"center",color:"#00B4D8" }}>Leave</th>
              <th style={{ ...S.th,textAlign:"center",color:"#FFB347" }}>Sick</th>
              <th style={{ ...S.th,textAlign:"center",color:"#FF5C6C" }}>Absent</th>
              <th style={{ ...S.th,textAlign:"center" }}>Attendance %</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map(({ emp,present,wfh,leave,sick,absent,total }) => {
              const rate = Math.round((present+wfh)/total*100);
              const barColor = rate>=90?"#00C897":rate>=75?"#FFB347":"#FF5C6C";
              return (
                <tr key={emp.id}>
                  <td style={S.td}><div style={{ display:"flex",alignItems:"center",gap:9 }}><Avatar emp={emp} size={28} /><span style={{ fontSize:13,fontWeight:500,color:"#E8EDF3" }}>{emp.name}</span></div></td>
                  <td style={S.td}><span style={S.badge(DEPT_COLORS[emp.dept],DEPT_COLORS[emp.dept]+"18")}>{emp.dept}</span></td>
                  {[present,wfh,leave,sick,absent].map((v,i) => <td key={i} style={{ ...S.td,textAlign:"center" }}><span style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:15,fontWeight:600 }}>{v}</span></td>)}
                  <td style={{ ...S.td,minWidth:140 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                      <div style={{ flex:1,height:6,background:"#1A2E42",borderRadius:3 }}>
                        <div style={{ width:`${rate}%`,height:"100%",background:barColor,borderRadius:3 }} />
                      </div>
                      <span style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:12,fontWeight:600,color:barColor,minWidth:36 }}>{rate}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── EMPLOYEE MODAL ───────────────────────────────────────────────────────────
function EmployeeModal({ emp, onClose }) {
  const c = LEAVE_CREDITS[emp.id];
  const history = LEAVE_HISTORY[emp.id] || [];
  const days = WORKDAYS.map(d => ATTENDANCE[emp.id][d]);
  const present = days.filter(d => d === "P" || d === "WFH").length;
  const rate = Math.round(present / WORKDAYS.length * 100);
  return (
    <div style={S.modal} onClick={onClose}>
      <div style={{ ...S.modalBox,width:580 }} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24 }}>
          <div style={{ display:"flex",alignItems:"center",gap:14 }}>
            <Avatar emp={emp} size={48} />
            <div>
              <div style={{ fontWeight:700,fontSize:18,color:"#E8EDF3" }}>{emp.name}</div>
              <div style={{ fontSize:12,color:"#4A6070" }}>{emp.position} · {emp.dept}</div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#4A6070",marginTop:2 }}>{emp.id}</div>
            </div>
          </div>
          <button style={{ background:"none",border:"none",cursor:"pointer",color:"#4A6070" }} onClick={onClose}><X size={16} /></button>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20 }}>
          {[
            { label:"Attendance Rate", value:`${rate}%`, color:rate>=90?"#00C897":"#FFB347" },
            { label:"VL Remaining", value:c.VL.remaining, color:"#00B4D8" },
            { label:"SL Remaining", value:c.SL.remaining, color:"#FFB347" },
          ].map(s => (
            <div key={s.label} style={{ background:"#0A1520",borderRadius:8,padding:"14px 16px",border:"1px solid #1A2E42" }}>
              <div style={{ fontSize:10,color:"#4A6070",fontFamily:"'IBM Plex Mono',monospace",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6 }}>{s.label}</div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:24,fontWeight:700,color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
        <div style={S.sectionTitle}>Leave History</div>
        {history.length === 0
          ? <div style={{ color:"#4A6070",fontSize:13 }}>No leave history on record.</div>
          : <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {history.map(l => (
                <div key={l.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",background:"#0A1520",border:"1px solid #1A2E42",borderRadius:8,padding:"10px 14px" }}>
                  <div style={{ display:"flex",gap:12,alignItems:"center" }}>
                    <span style={S.badge("#00B4D8","#00B4D818")}>{l.type}</span>
                    <div>
                      <div style={{ fontSize:12,color:"#C0CDD8" }}>{l.reason}</div>
                      <div style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#4A6070" }}>{l.from} → {l.to} ({l.days}d)</div>
                    </div>
                  </div>
                  <LeaveStatusBadge status={l.status} />
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard",  label: "Dashboard",     icon: LayoutDashboard },
  { id: "employees",  label: "Employees",     icon: Users },
  { id: "attendance", label: "Attendance",    icon: CalendarCheck },
  { id: "leave",      label: "Leave Credits", icon: Palmtree },
  { id: "reports",    label: "Reports",       icon: BarChart3 },
];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [selEmp, setSelEmp] = useState(null);
  const titles = { dashboard:"Dashboard", employees:"Employee Directory", attendance:"Attendance Tracker", leave:"Leave Credits", reports:"Reports" };
  return (
    <div style={S.app}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0A1520; }
        ::-webkit-scrollbar-thumb { background: #1A2E42; border-radius: 3px; }
        select option { background: #0D1B2A; }
        tr:hover td { background: #0A1520 !important; }
      `}</style>
      <div style={S.sidebar}>
        <div style={S.logo}>
          <div style={S.logoText}>WORKFORCE</div>
          <div style={S.logoSub}>ATTENDANCE SYSTEM</div>
        </div>
        <nav style={S.nav}>
          {NAV.map(({ id, label, icon: Icon }) => (
            <div key={id} style={S.navItem(tab===id)} onClick={() => setTab(id)}>
              <Icon size={15} />{label}
            </div>
          ))}
        </nav>
        <div style={{ padding:"16px 20px",borderTop:"1px solid #1A2E42" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:30,height:30,borderRadius:"50%",background:"#00B4D820",border:"1px solid #00B4D840",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:600,color:"#00B4D8" }}>A</div>
            <div><div style={{ fontSize:12,fontWeight:500,color:"#C0CDD8" }}>Admin</div><div style={{ fontSize:10,color:"#4A6070" }}>HR Administrator</div></div>
          </div>
        </div>
      </div>
      <div style={S.main}>
        <div style={S.topbar}>
          <div style={S.pageTitle}>{titles[tab]}</div>
          <div style={{ display:"flex",alignItems:"center",gap:14 }}>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#4A6070" }}>TUE, MAY 6 · 2025</div>
            <Bell size={15} color="#4A6070" />
          </div>
        </div>
        <div style={S.content}>
          {tab==="dashboard"  && <Dashboard />}
          {tab==="employees"  && <EmployeeDirectory onSelect={setSelEmp} />}
          {tab==="attendance" && <AttendanceTracker />}
          {tab==="leave"      && <LeaveCredits />}
          {tab==="reports"    && <Reports />}
        </div>
      </div>
      {selEmp && <EmployeeModal emp={selEmp} onClose={() => setSelEmp(null)} />}
    </div>
  );
}
