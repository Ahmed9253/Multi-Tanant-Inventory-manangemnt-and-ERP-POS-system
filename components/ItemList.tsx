import React from "react";

const ItemsList = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Inventory</h2>
          <p className="text-sm text-gray-500 mt-1">
            View and manage your products.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Name
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Category
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Price
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Quantity
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Status
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-b border-gray-100">
                <td className="px-6 py-5 text-gray-900">MacBook Pro</td>
                <td className="px-6 py-5 text-gray-900">Electronics</td>
                <td className="px-6 py-5 text-gray-900">$19.99</td>
                <td className="px-6 py-5 text-gray-900">10</td>
                <td className="px-6 py-5 text-gray-900">In Stock</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ItemsList;
