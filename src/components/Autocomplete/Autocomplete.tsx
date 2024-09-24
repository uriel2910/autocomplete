import React, { useState, useEffect, useRef, useCallback } from "react";
import "./autocomplete.css";
import { useDebounce } from "../../hooks";

export interface Item {
  id: number;
  name: string;
}

interface AutocompleteProps {
  selectedItem: Item | null;
  setSelectedItem: (item: Item | null) => void;
  options: Item[];
}

const Autocomplete: React.FC<AutocompleteProps> = ({
  selectedItem,
  setSelectedItem,
  options,
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [isOptionsAbove, setIsOptionsAbove] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const optionsRef = useRef<HTMLDivElement | null>(null);

  const debouncedSearchText = useDebounce(inputValue, 300);

  const fetchItems = useCallback(
    async (query?: string): Promise<Item[]> => {
      setIsLoading(true);
      return new Promise((resolve) => {
        setTimeout(() => {
          let result: any;
          if (query) {
            result = options.filter((item) =>
              item.name.toLowerCase().includes(query.toLowerCase())
            );
          } else {
            result = options;
          }
          resolve(result);
          setIsLoading(false);
        }, 500);
      });
    },
    [options]
  );

  const setState = useCallback(
    (item: Item | null) => {
      setSelectedItem(item);
    },
    [setSelectedItem]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
        if (selectedItem) {
          setInputValue(selectedItem?.name);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedItem]);

  useEffect(() => {
    if (debouncedSearchText.length > 0) {
      fetchItems(debouncedSearchText).then((items) => {
        setFilteredItems(items);
      });
    } else {
      setFilteredItems(options);
    }
  }, [debouncedSearchText, fetchItems, options]);

  useEffect(() => {
    if (selectedItem && !inputValue) {
      setState(null);
      setHighlightedIndex(0);
    }
  }, [inputValue, selectedItem, setState]);

  useEffect(() => {
    if (selectedItem) {
      if (selectedItem?.name !== inputValue) {
        setShowOptions(true);
      }
      const selectedIndex = filteredItems.findIndex(
        (item) => item.id === selectedItem.id
      );
      setHighlightedIndex(selectedIndex !== -1 ? selectedIndex : 0);
    } else {
      setHighlightedIndex(0);
    }
  }, [inputValue, filteredItems, selectedItem]);

  useEffect(() => {
    const checkPosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const isAbove = rect.bottom > windowHeight / 2;
        setIsOptionsAbove(isAbove);
      }
    };
    if (showOptions) {
      checkPosition();
      window.addEventListener("scroll", checkPosition);
    }
    return () => {
      window.removeEventListener("scroll", checkPosition);
    };
  }, [showOptions]);

  useEffect(() => {
    if (showOptions && optionsRef.current) {
      const selectedOption = optionsRef.current.querySelector(
        ".option-container-selected-highlighted"
      );
      if (selectedOption) {
        selectedOption.scrollIntoView({
          behavior: "auto",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [showOptions, highlightedIndex]);

  useEffect(() => {
    if (optionsRef.current) {
      const selectedOption = optionsRef.current.querySelector(
        ".option-container-highlighted"
      );
      if (selectedOption) {
        selectedOption.scrollIntoView({
          behavior: "auto",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = (item: Item) => {
    setInputValue(item.name);
    setSelectedItem(item);
    setShowOptions(false);
    setHighlightedIndex(-1);
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

  const handleInputClick = () => {
    setFilteredItems(options);
    setShowOptions(true);
    if (selectedItem) {
      const selectedIndex = options.findIndex(
        (item) => item.id === selectedItem.id
      );
      setHighlightedIndex(selectedIndex !== -1 ? selectedIndex : 0);
    } else {
      setHighlightedIndex(0);
    }
  };

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputValue("");
    setShowOptions(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div ref={containerRef} className="autocomplete-container">
      <input
        ref={inputRef}
        className="autocomplete-input"
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onClick={handleInputClick}
        onKeyDown={handleKeyDown}
        placeholder="Search..."
      />
      {(selectedItem || inputValue) && (
        <span
          className="close"
          onMouseDown={(e) => {
            e.preventDefault();
            onDelete(e);
          }}
        >
          &#10005;
        </span>
      )}
      {showOptions && (
        <div
          ref={optionsRef}
          className={`options-container ${
            isOptionsAbove ? "options-container-above" : ""
          }`}
        >
          {isLoading ? (
            <div className="option-container">
              <p style={{ margin: 0, padding: 0, fontSize: 14 }}>loading...</p>
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <div
                key={`${item?.id}-${index}`}
                className={
                  selectedItem?.id === item?.id
                    ? index === highlightedIndex
                      ? "option-container-selected-highlighted"
                      : "option-container-selected"
                    : index === highlightedIndex
                    ? "option-container-highlighted"
                    : "option-container"
                }
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(item);
                }}
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
