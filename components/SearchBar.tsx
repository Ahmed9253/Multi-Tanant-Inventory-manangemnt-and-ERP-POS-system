import React from "react";

const SearchBar = () => {
  return (
    <div className=" w-full max-w-6xl mx-auto px-6 pt-10 pb-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mt-1">
          Inventory Manager
        </h1>
      </div>
      <form className="w-full ">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Search....."
            className="flex-1 bg-white rounded-xl px-5 py-3 text-gray-900 border-gray-500 outline-none shadow-sm focus:ring-blue-500"
          />
          <select
            name=""
            id=""
            className="bg-white border-gray-500 rounded-xl px-5 py-5 text-gray-700 outline-none shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 "
          >
            <option value="">All Catagories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="home">Home</option>
            <option value="sports">Sports</option>
            <option value="books">Books</option>
            <option value="other">Other</option>
          </select>
          <select
            name=""
            id=""
            className="bg-white border-gray-500 rounded-xl px-5 py-5 text-gray-700 outline-none shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Stock</option>
            <option value="true">In Stock</option>
            <option value="false">Out of Stock</option>
          </select>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
