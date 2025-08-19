import { useEffect, useState } from "react";
import { Transactions } from "../api";
import type { Transaction, TypeTransaction } from "../models";

// Money formatting function
export const money = (n: number | string) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 })
    .format(typeof n === 'string' ? parseFloat(n) : n);

export default function TransactionsPage() {
  const [rows, setRows] = useState<Transaction[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: "cotisation",
    montant: "",
    date_transaction: "",
    membre: 0,
    description: "",
    reference: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Transactions.list().then(setRows).catch((err) => setError("Failed to load transactions"));
  }, []);

  const handleAdd = async () => {
    try {
      const newTransaction = await Transactions.create(formData);
      setRows([...rows, newTransaction]);
      setIsAddModalOpen(false);
      setFormData({
        type: "cotisation",
        montant: "",
        date_transaction: "",
        membre: 0,
        description: "",
        reference: "",
      });
      setError(null);
    } catch (err) {
      setError("Failed to add transaction");
    }
  };

  const handleEdit = async () => {
    if (!selectedTransaction) return;
    try {
      const updatedTransaction = await Transactions.update(selectedTransaction.id, formData);
      setRows(rows.map((row) => (row.id === selectedTransaction.id ? updatedTransaction : row)));
      setIsEditModalOpen(false);
      setSelectedTransaction(null);
      setFormData({
        type: "cotisation",
        montant: "",
        date_transaction: "",
        membre: 0,
        description: "",
        reference: "",
      });
      setError(null);
    } catch (err) {
      setError("Failed to update transaction");
    }
  };

  const handleDelete = async () => {
    if (!selectedTransaction) return;
    try {
      await Transactions.remove(selectedTransaction.id);
      setRows(rows.filter((row) => row.id !== selectedTransaction.id));
      setIsDeleteModalOpen(false);
      setSelectedTransaction(null);
      setError(null);
    } catch (err) {
      setError("Failed to delete transaction");
    }
  };

  const openEditModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      type: transaction.type,
      montant: transaction.montant,
      date_transaction: transaction.date_transaction,
      membre: transaction.membre,
      description: transaction.description,
      reference: transaction.reference,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDeleteModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Transactions</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <button
        onClick={() => setIsAddModalOpen(true)}
        className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add Transaction
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {rows.map((transaction) => (
          <div
            key={transaction.id}
            className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm bg-white dark:bg-neutral-900"
          >
            <h3 className="text-lg font-semibold">Transaction #{transaction.id}</h3>
            <p><strong>Type:</strong> {transaction.type}</p>
            <p><strong>Amount:</strong> {money(transaction.montant)}</p>
            <p><strong>Date:</strong> {new Date(transaction.date_transaction).toLocaleDateString()}</p>
            <p><strong>Member ID:</strong> {transaction.membre}</p>
            <p><strong>Description:</strong> {transaction.description || "N/A"}</p>
            <p><strong>Reference:</strong> {transaction.reference || "N/A"}</p>
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => openEditModal(transaction)}
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => openDeleteModal(transaction)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Transaction</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAdd();
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded dark:bg-neutral-700"
                >
                  <option value="cotisation">Cotisation</option>
                  <option value="pret">Prêt</option>
                  <option value="remboursement">Remboursement</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Amount</label>
                <input
                  type="number"
                  name="montant"
                  value={formData.montant}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded dark:bg-neutral-700"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Date</label>
                <input
                  type="date"
                  name="date_transaction"
                  value={formData.date_transaction}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded dark:bg-neutral-700"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Member ID</label>
                <input
                  type="number"
                  name="membre"
                  value={formData.membre}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded dark:bg-neutral-700"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded dark:bg-neutral-700"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Reference</label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded dark:bg-neutral-700"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Transaction #{selectedTransaction.id}</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEdit();
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded dark:bg-neutral-700"
                >
                  <option value="cotisation">Cotisation</option>
                  <option value="pret">Prêt</option>
                  <option value="remboursement">Remboursement</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Amount</label>
                <input
                  type="number"
                  name="montant"
                  value={formData.montant}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded dark:bg-neutral-700"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Date</label>
                <input
                  type="date"
                  name="date_transaction"
                  value={formData.date_transaction}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded dark:bg-neutral-700"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Member ID</label>
                <input
                  type="number"
                  name="membre"
                  value={formData.membre}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded dark:bg-neutral-700"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded dark:bg-neutral-700"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Reference</label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded dark:bg-neutral-700"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete transaction #{selectedTransaction.id}?</p>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}