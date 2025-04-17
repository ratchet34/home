import React, { useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, IconButton, Menu, Text } from "react-native-paper";
import PropTypes from "prop-types";
import { FaCheck } from "react-icons/fa6";

const MultiSelectDropdown = ({
  loading = false,
  options = [],
  onSelect = () => {},
  onAddItem = () => {},
  value = [],
}) => {
  const [inputValue, setInputValue] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = (e) => {
    setMenuVisible(true);
    inputRef.current?.focus();
    e.preventDefault();
    e.stopPropagation();
  };
  const closeMenu = () => setMenuVisible(false);

  const globalRef = useRef(null);
  const inputRef = useRef(null);

  const handleSelect = (option) => {
    onSelect(option);
    setInputValue(option?.title);
    closeMenu();
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
      flexGrow: 1,
    },
    menu: {
      // position: "relative",
      // top: 56,
    },
  });

  return (
    <View style={styles.container} ref={globalRef}>
      <TextInput
        value={inputValue}
        onChangeText={setInputValue}
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
            .map((option, index) => (
              <Menu.Item
                key={index}
                onPress={() => handleSelect(option)}
                trailingIcon={value.includes(option?._id) ? "check" : null}
                title={option?.title}
                contentStyle={styles.selectedMenuItem}
                dense={true}
              />
            ))}
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
};

export default MultiSelectDropdown;
