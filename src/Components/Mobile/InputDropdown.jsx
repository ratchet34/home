import React, { useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, IconButton, Menu } from "react-native-paper";
import PropTypes from "prop-types";

const InputDropdown = ({
  loading = false,
  options = [],
  onSelect = () => {},
  onAddItem = () => {},
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
        placeholder="Select an option"
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
            onSelect(null);
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
                title={option?.title}
              />
            ))}
        </Menu>
      </View>
    </View>
  );
};
InputDropdown.propTypes = {
  loading: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
    })
  ),
  onSelect: PropTypes.func,
  onAddItem: PropTypes.func,
};

export default InputDropdown;
