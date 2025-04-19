import React, { useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, IconButton, Menu } from "react-native-paper";
import PropTypes from "prop-types";

const MultiSelectDropdown = ({
  loading = false,
  options = [],
  onSelect = () => {},
  onAddItem = () => {},
  value = [],
  closeMenuOnSelect = true,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => {
    setTimeout(() => setMenuVisible(true), 100);
    inputRef.current?.focus();
  };
  const closeMenu = () => setMenuVisible(false);

  const globalRef = useRef(null);
  const inputRef = useRef(null);

  const handleSelect = (option) => {
    onSelect(option);
    setInputValue(option?.title);
    if (closeMenuOnSelect === true) closeMenu();
  };

  const handleAddItem = (value) => {
    const capitalizeFirstLetter = (string) => {
      return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const capValue = capitalizeFirstLetter(value);
    onAddItem(capValue);
    setInputValue(capValue);
    closeMenu();
  };

  const styles = StyleSheet.create({
    container: {
      display: "block",
    },
    iconButton: {
      position: "absolute",
      right: 0,
      top: 0,
    },
    clearButton: {
      position: "absolute",
      right: 35,
      top: 5,
    },
    content: {
      width: globalRef.current?.offsetWidth,
      position: "relative",
      top: 56,
      left: 0,
      maxHeight: 200,
      overflow: "auto",
    },
    selectedMenuItem: {
      backgroundColor: "#D1C4E9",
      fontWeight: "bold",
    },
    menuItem: {
      flexGrow: 1,
    },
  });

  return (
    <View style={styles.container} ref={globalRef}>
      <TextInput
        value={inputValue}
        onChangeText={(str) => {
          setInputValue(str);
          if (str.length > 0) {
            openMenu();
          } else {
            closeMenu();
          }
        }}
        style={styles.input}
        placeholder={
          value.length > 0
            ? `${value.length} item${value.length > 1 ? "s" : ""} selected`
            : "Select an option"
        }
        onFocus={openMenu}
        ref={inputRef}
        disabled={loading}
      />
      <View style={styles.clearButton}>
        <IconButton
          icon="close"
          size={16}
          onPress={() => {
            setInputValue("");
          }}
          disabled={loading}
        />
      </View>
      <View style={styles.iconButton}>
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={
            <IconButton
              icon="chevron-down"
              size={24}
              onPress={openMenu}
              loading={loading}
            />
          }
          contentStyle={styles.content}
          style={styles.menu}
        >
          {!!inputValue &&
            !options.find((option) => option?.title === inputValue) && (
              <Menu.Item
                onPress={() => handleAddItem(inputValue)}
                title={
                  <>
                    Add <b>{inputValue}</b>...
                  </>
                }
              />
            )}
          {options
            .filter((option) => {
              return option?.title
                ?.toLowerCase()
                .includes(inputValue.toLowerCase());
            })
            .sort((a, b) => {
              return a?.title?.localeCompare(b?.title);
            })
            .map((option, index) => {
              const isSelected = value.includes(option?._id);
              return (
                <Menu.Item
                  key={index}
                  onPress={() => {
                    handleSelect(option);
                    setInputValue("");
                  }}
                  trailingIcon={isSelected ? "check" : null}
                  title={isSelected ? <b>{option?.title}</b> : option?.title}
                  contentStyle={styles.menuItem}
                  style={isSelected ? styles.selectedMenuItem : null}
                  dense={true}
                />
              );
            })}
        </Menu>
      </View>
    </View>
  );
};
MultiSelectDropdown.propTypes = {
  loading: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
    })
  ),
  onSelect: PropTypes.func,
  onAddItem: PropTypes.func,
  value: PropTypes.array,
  closeMenuOnSelect: PropTypes.bool,
};

export default MultiSelectDropdown;
