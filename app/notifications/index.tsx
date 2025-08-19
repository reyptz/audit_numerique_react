import { useEffect, useState } from "react";
import { Notifications } from "../api";
import toast from "react-hot-toast";

export default function NotificationsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const fetchAll = () => Notifications.list().then(setRows);
  useEffect(() => {
    fetchAll();
  }, []);

  const markRead = async (id:number)=> {
    await Notifications.patch(id, { lue:true });
    toast.success("Marquée lue");
    fetchAll();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Notifications</h1>

      <table className="w-full text-sm border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
        <thead className="bg-neutral-50 dark:bg-neutral-900">
          <tr><th className="p-3">#</th><th className="p-3">Type</th><th className="p-3">Contenu</th><th className="p-3">Lu</th></tr>
        </thead>
        <tbody>
          {rows.map(n=>(
            <tr key={n.id} className="border-t border-neutral-200 dark:border-neutral-800">
              <td className="p-3">{n.id}</td><td className="p-3">{n.type}</td><td className="p-3">{n.contenu}</td>
              <td className="p-3">
                {n.lue ? "✔" : <button onClick={()=>markRead(n.id)} className="text-brand-600 hover:underline">Marquer lue</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}