"use client";

import { useState } from "react";

const AddItems = () => {
  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [stockStatus, setStockStatus] = useState<string>("");

  const [message, setMessage] = useState<string>("");

  const clearForm = (): void => {
    setName("");
    setCategory("");
    setPrice("");
    setQuantity("");
    setDescription("");
    setStockStatus("");
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    setMessage("");

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          category,
          price,
          quantity,
          description,
          stockStatus,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Item added successfully!");
        clearForm();
        console.log(data);
      } else {
        setMessage(data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Failed to connect to the server.");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Add Items</h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Name */}
          <div>
            <label className="block text-gray-900 text-sm font-semibold mb-2">
              Name
            </label>

            <input
              type="text"
              placeholder="Computer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-l px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-900 text-sm font-semibold mb-2">
              Category
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-l px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Categories</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="home">Home</option>
              <option value="sports">Sports</option>
              <option value="books">Books</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-gray-900 text-sm font-semibold mb-2">
              Price
            </label>

            <input
              type="number"
              placeholder="20.20"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border border-gray-300 rounded-l px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-gray-900 text-sm font-semibold mb-2">
              Quantity
            </label>

            <input
              type="number"
              placeholder="20"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border border-gray-300 rounded-l px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2 mb-5">
            <label className="block text-gray-900 text-sm font-semibold mb-2">
              Description
            </label>

            <textarea
              rows={4}
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-l p-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Stock Status */}
          <div>
            <label className="block text-gray-900 text-sm font-semibold mb-2">
              Stock Status
            </label>

            <select
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-l px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Stock Status</option>
              <option value="true">In Stock</option>
              <option value="false">Out of Stock</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="md:col-span-full flex gap-3">
            <button
              type="submit"
              className="w-full border text-gray-300 rounded-l p-3 bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              Add Item
            </button>

            <button
              type="button"
              onClick={clearForm}
              className="w-full border text-gray-300 rounded-l p-3 bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              Clear
            </button>
          </div>
        </form>

        {/* Message */}
        {message && (
          <p className="mt-4 text-sm font-medium text-gray-900">{message}</p>
        )}
      </div>
    </div>
  );
};

export default AddItems;
