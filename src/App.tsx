import React from "react";
import "./App.css";
import Autocomplete from "./components/Autocomplete";
import { useDebounce } from "./hooks";

interface Countries {
  name: {
    common: string;
    official: string;
    nativeName: {
      eng: {
        common: string;
        official: string;
      };
    };
  };
}

function App() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<Countries | null>(
    null
  );
  const [inputValue, setInputValue] = React.useState<string>("");
  const [options, setOptions] = React.useState<Countries[]>([]);

  const debouncedInput = useDebounce(inputValue, 300);

  React.useEffect(() => {
    //GET OPTIONS WITHOUT FILTER
    // getOptions();

    //GET OPTIONS WITH FILTER
    getOptions(debouncedInput);
  }, [debouncedInput]);

  //GET OPTIONS WITHOUT FILTER
  // const getOptions = () => {
  //   setIsLoading(true);
  //   fetch(`https://restcountries.com/v3.1/all?fields=name`)
  //     .then((response) => response.json())
  //     .then((json) => {
  //       setOptions(json);
  //       setIsLoading(false);
  //     })
  //     .catch((error) => {
  //       console.error("Error:", error);
  //       setIsLoading(false);
  //     });
  // };

  //GET OPTIONS WITH FILTER
  const getOptions = (debouncedText: string) => {
    setIsLoading(true);
    fetch(`https://restcountries.com/v3.1/name/${debouncedText}?fields=name`)
      .then((response) => response.json())
      .then((json) => {
        setOptions(json);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setIsLoading(false);
      });
  };

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
      <Autocomplete
        value={selectedItem}
        setValue={setSelectedItem}
        inputValue={inputValue}
        setInputValue={setInputValue}
        options={options}
        keyField={(item) => item?.name?.common}
        labelField={(item) => item?.name?.common}
        isLoading={isLoading} //COMENT IF OPTIONS HAS NO FILTER
      />
      <p>Selected Country:</p>
      {selectedItem && (
        <pre style={{ marginBottom: 20 }}>
          {JSON.stringify(selectedItem, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;
