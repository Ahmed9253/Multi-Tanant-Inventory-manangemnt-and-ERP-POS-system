import React from "react";

const AddItems = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        <div className="mb-8 ">
          <h2 className="text-2xl font-bold text-gray-900">Add Items</h2>
        </div>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-900 text-sm font-semibold mb-2 ">
              name
            </label>
            <input
              type="text"
              placeholder="computer"
              className="w-full border border-gray-300 rounded-l px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-900 text-sm font-semibold mb-2 ">
              Catagory
            </label>
            <select
              name=""
              id=""
              className="w-full border border-gray-300 rounded-l px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Catagories</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="home">Home</option>
              <option value="sports">Sports</option>
              <option value="books">Books</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-900 text-sm font-semibold mb-2 ">
              Price
            </label>
            <input
              type="number"
              placeholder="20.20"
              className="w-full border border-gray-300 rounded-l px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-900 text-sm font-semibold mb-2 ">
              Quantity
            </label>
            <input
              type="number"
              placeholder="20"
              className="w-full border border-gray-300 rounded-l px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2 mb-5">
            <label className="block text-gray-900 text-sm font-semibold mb-2 ">
              Discription
            </label>
            <textarea
              rows={4}
              placeholder="Disciption"
              className="w-full border border-gray-300 rounded-l p-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-900 text-sm font-semibold mb-2 ">
              Stock Status
            </label>
            <select className="w-full border border-gray-300 rounded-l px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Stock</option>
              <option value="true">In Stock</option>
              <option value="false">Out of Stock</option>
            </select>
          </div>

          <div className="md:col-span-full flex gap-3">
            <button
              className="w-full border text-gray-300 rounded-l p-3 bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              type="submit"
            >
              Add item
            </button>
            <button
              className="w-full border text-gray-300 rounded-l p-3 bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              type="button"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItems;
