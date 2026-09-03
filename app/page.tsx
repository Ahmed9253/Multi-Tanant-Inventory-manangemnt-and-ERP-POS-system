import SearchBar from "@/components/SearchBar";
import AddItems from "@/components/AddItems";
import React from "react";
import ItemList from "@/components/ItemList";

const page = () => {
  return (
    <div>
      <SearchBar />
      <AddItems />
      <ItemList />
    </div>
  );
};

export default page;
