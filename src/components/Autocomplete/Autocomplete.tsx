import React, { useState, useEffect, useRef } from "react";
import { mockData } from "../../mockData";
import "./autocomplete.css";

export interface Item {
  id: number;
  name: string;
}

interface AutocompleteProps {
  selectedItem: Item | null;
  setSelectedItem: (item: Item | null) => void;
}

const Autocomplete: React.FC<AutocompleteProps> = ({
  selectedItem,
  setSelectedItem,
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchItems = async (query?: string): Promise<Item[]> => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        let result: any;
        if (query) {
          result = mockData.filter((item) =>
            item.name.toLowerCase().includes(query.toLowerCase())
          );
        } else {
          result = mockData;
        }
        resolve(result);
        setIsLoading(false);
      }, 500);
    });
  };

  useEffect(() => {
    if (inputValue.length > 0) {
      fetchItems(inputValue).then((items) => {
        setFilteredItems(items);
      });
    } else {
      setFilteredItems(mockData);
    }
    if (selectedItem && selectedItem?.name !== inputValue) {
      setSelectedItem(null);
    }
  }, [inputValue, selectedItem, setSelectedItem]);

  const handleSelect = (item: Item) => {
    setInputValue(item.name);
    setSelectedItem(item);
    setShowOptions(false);
    setHighlightedIndex(-1);
  };

  const handleFocus = () => {
    setShowOptions(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      setHighlightedIndex((prevIndex) =>
        prevIndex < filteredItems.length - 1 ? prevIndex + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : filteredItems.length - 1
      );
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0 && filteredItems[highlightedIndex]) {
        handleSelect(filteredItems[highlightedIndex]);
      }
    }
  };

  return (
    <div ref={containerRef} className="autocomplete-container">
      <input
        className="autocomplete-input"
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder="Search..."
      />
      {showOptions && (
        <div className="options-container">
          {isLoading ? (
            <div className="option-container">
              <p style={{ margin: 0, padding: 0, fontSize: 14 }}>loading...</p>
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <div
                key={`${item?.id}-${index}`}
                className={
                  index === highlightedIndex
                    ? "option-container-highlighted"
                    : "option-container"
                }
                onMouseDown={() => handleSelect(item)}
              >
                <p style={{ margin: 0, padding: 0, fontSize: 14 }}>
                  {item?.name}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Autocomplete;
