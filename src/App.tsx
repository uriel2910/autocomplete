import React from "react";
import "./App.css";
import Autocomplete from "./components/Autocomplete";
import { Item } from "./components/Autocomplete/Autocomplete";

function App() {
  const [selectedItem, setSelectedItem] = React.useState<Item | null>(null);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1>Autocomplete Component</h1>
      <p>Selected option: {selectedItem ? selectedItem?.name : ""}</p>
      <Autocomplete
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
      />
    </div>
  );
}

export default App;
