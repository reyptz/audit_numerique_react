import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar, CartesianGrid } from "recharts";

export default function AggregatesBar({ data }:{ data: {name:string; value:number}[] }) {
  return (
    <div className="h-64 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-3 bg-white dark:bg-neutral-900">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3"/>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}