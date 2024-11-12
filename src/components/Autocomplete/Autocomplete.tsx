import React, { useState, useEffect, useRef, useCallback } from "react";
import "./autocomplete.css";

interface AutocompleteProps<T> {
  value: T | null;
  setValue: (item: T | null) => void;
  inputValue: string;
  setInputValue: (inputValue: string) => void;
  options: T[];
  keyField: (item: T) => string | number;
  labelField: (item: T) => string;
  isLoading?: boolean;
}

const getHighlightedText = (text: string, highlight: string) => {
  const parts = text.split(new RegExp(`(${highlight})`, "gi"));
  return (
    <span>
      {parts.map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={index} style={{ fontWeight: "bold" }}>
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
};

const Autocomplete = <T extends {}>({
  value,
  setValue,
  inputValue,
  setInputValue,
  options,
  keyField,
  labelField,
  isLoading,
}: AutocompleteProps<T>) => {
  const [filteredItems, setFilteredItems] = useState<T[]>([]);
  // const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [isOptionsAbove, setIsOptionsAbove] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const optionsRef = useRef<HTMLDivElement | null>(null);

  // useEffect(() => {
  //   if (inputValue.length > 0) {
  //     setIsLoading(true);
  //     const filtered = options.filter((item) =>
  //       (labelField(item) as string)
  //         .toLowerCase()
  //         .includes(inputValue.toLowerCase())
  //     );
  //     setFilteredItems(filtered);
  //     setIsLoading(false);
  //   } else {
  //     setFilteredItems(options);
  //   }
  // }, [inputValue, options, labelField]);

  useEffect(() => {
    if (options.length > 0) {
      const filtered = options.filter((item) =>
        (labelField(item) as string)
          .toLowerCase()
          .includes(inputValue.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems([]);
    }
    // if (filteredItems.length === 0) {
    //   // setIsLoading(true);
    //   if (options.length > 0) {
    //     const filtered = options.filter((item) =>
    //       (labelField(item) as string)
    //         .toLowerCase()
    //         .includes(inputValue.toLowerCase())
    //     );
    //     setFilteredItems(filtered);
    //   } else {
    //     setFilteredItems([]);
    //   }
    // } else {
    //   if (options.length > 0) {
    //     const filtered = options.filter((item) =>
    //       (labelField(item) as string)
    //         .toLowerCase()
    //         .includes(inputValue.toLowerCase())
    //     );
    //     setFilteredItems(filtered);
    //   } else {
    //     setFilteredItems([]);
    //   }
    //   // setIsLoading(false);
    // }
  }, [inputValue, labelField, options]);

  const setState = useCallback(
    (item: T | null) => {
      setValue(item);
    },
    [setValue]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
        if (value) {
          const valueInput = labelField(value);
          if (typeof valueInput === "string") {
            setInputValue(valueInput);
          }
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [labelField, setInputValue, value]);

  useEffect(() => {
    if (value && !inputValue) {
      setState(null);
      setHighlightedIndex(0);
    }
  }, [inputValue, value, setState]);

  useEffect(() => {
    if (value) {
      const selectedIndex = filteredItems.findIndex(
        (item) => labelField(item) === labelField(value)
      );
      setHighlightedIndex(selectedIndex !== -1 ? selectedIndex : 0);
    } else {
      setHighlightedIndex(0);
    }
  }, [inputValue, filteredItems, value, labelField]);

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

  const handleSelect = (item: T) => {
    setInputValue(labelField(item));
    setValue(item);
    setShowOptions(false);
    setHighlightedIndex(-1);
  };

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (showOptions) return;
    setFilteredItems(options);
    setShowOptions(true);
    if (value) {
      const selectedIndex = options.findIndex(
        (item) => keyField(item) === keyField(value)
      );
      setHighlightedIndex(selectedIndex !== -1 ? selectedIndex : 0);
    } else {
      setHighlightedIndex(0);
    }
  };

  return (
    <div ref={containerRef} className="autocomplete-container">
      <input
        ref={inputRef}
        className="autocomplete-input"
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          if (!showOptions && e.target.value) {
            setShowOptions(true);
          }
        }}
        onClick={handleInputClick}
        onKeyDown={(e) => {
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
        }}
        placeholder="Search..."
      />
      {(value || inputValue) && (
        <span
          className="close"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setInputValue("");
            setShowOptions(false);
            if (inputRef.current) inputRef.current.focus();
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
              <p style={{ margin: 0, padding: 0, fontSize: 14, color: "gray" }}>
                loading...
              </p>
            </div>
          ) : filteredItems && filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <div
                key={keyField(item)}
                className={
                  value && keyField(value) === keyField(item)
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
                <p
                  style={{
                    margin: 0,
                    padding: 0,
                    fontSize: 14,
                    userSelect: "none",
                  }}
                >
                  {getHighlightedText(labelField(item), inputValue)}
                </p>
              </div>
            ))
          ) : (
            <div className="option-container">
              <p style={{ margin: 0, padding: 0, fontSize: 14, color: "gray" }}>
                No items
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Autocomplete;
