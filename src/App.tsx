import React from "react";
import "./App.css";
import Autocomplete from "./components/Autocomplete";
import { Item } from "./components/Autocomplete/Autocomplete";
import { mockData } from "./mockData";

function App() {
  const [selectedItem, setSelectedItem] = React.useState<Item | null>(null);

  const options = mockData;

  return (
    <div
      style={{
        width: "100%",
        height: "150vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "scroll",
      }}
    >
      <h1>Autocomplete Component</h1>
      <p>Selected option: {selectedItem ? selectedItem?.name : ""}</p>
      <Autocomplete
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        options={options}
      />
    </div>
  );
}

export default App;
