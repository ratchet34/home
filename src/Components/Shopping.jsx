import React, { useEffect, useState } from "react";
import { AutoComplete, Button, Card, Flex, InputNumber, Tag, Tooltip, Typography } from "antd";
import { FaPlus } from "react-icons/fa";
import { Modal, Select } from "antd";
import { MdEdit } from "react-icons/md";
import { IoMdTrash } from "react-icons/io";

const ShoppingList = () => {
  const [shoppingItems, setShoppingItem] = useState([]);
  const [editShoppingItemId, setEditShoppingItemId] = useState();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [ingredient, setIngredient] = useState("");
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [ingredientOptions, setIngredientOptions] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [locationSearch, setLocationSearch] = useState("");

  const getShoppingItems = async () => {
    const response = await fetch(`${import.meta.env.VITE_HOST}/shopping/items`);
    const data = await response.json();
    setShoppingItem(data);
  };

  const getIngredientDictionary = async () => {
    const response = await fetch(`${import.meta.env.VITE_HOST}/shopping/ingredients`);
    const data = await response.json();
    setIngredientOptions(data);
  };

  const getLocationDictionary = async () => {
    const response = await fetch(`${import.meta.env.VITE_HOST}/shopping/locations`);
    const data = await response.json();
    setLocationOptions(data);
  };

  const addShoppingItem = (item) => {
    fetch(`${import.meta.env.VITE_HOST}/shopping/item`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ item }),
    }).then(() => {
      getShoppingItems();
    });
  };

  const editShoppingItem = (id, item) => {
    fetch(`${import.meta.env.VITE_HOST}/shopping/item/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ item }),
    }).then(() => {
      getShoppingItems();
    });
  };

  const removeShoppingItem = (id) => {
    fetch(`${import.meta.env.VITE_HOST}/shopping/item/${id}`, {
      method: "DELETE",
    }).then(() => {
      getShoppingItems();
    });
  };

  const addIngredient = (ingr) => {
    fetch(`${import.meta.env.VITE_HOST}/shopping/ingredient`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ item: {
        title: ingr,
      }}),
    })
    .then((response) => response.json())
    .then((data) => {
      setIngredient(data.insertedId);
      getIngredientDictionary();
    });
  };

  const removeIngredient = (id) => {
    fetch(`${import.meta.env.VITE_HOST}/shopping/ingredient/${id}`, {
      method: "DELETE",
    }).then(() => {
      getIngredientDictionary();
    });
  };

  const addLocation = (loc) => {
    fetch(`${import.meta.env.VITE_HOST}/shopping/location`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ item: {
        title: loc,
      } }),
    }).then(() => {
      getLocationDictionary();
    });
  };

  const removeLocation = (id) => {
    fetch(`${import.meta.env.VITE_HOST}/shopping/location/${id}`, {
      method: "DELETE",
    }).then(() => {
      getLocationDictionary();
    });
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    if (ingredient && quantity) {
      const newShoppingItem = {
        ingredient,
        quantity,
      };
      if (location) newShoppingItem.location = location;
      if (editShoppingItemId) {
        editShoppingItem(editShoppingItemId, newShoppingItem);
        setEditShoppingItemId(null);
      }
      else addShoppingItem(newShoppingItem);
      setIngredient('');
      setLocation([]);
      setQuantity(1);
      setIsModalVisible(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    if (editShoppingItemId) {
      const item = shoppingItems.find((t) => t._id === editShoppingItemId);
      setIngredient(item.ingredient);
      setLocation(item.location);
      setQuantity(item.quantity);
      setIsModalVisible(true);
    }
  }, [editShoppingItemId]);

  useEffect(() => {
    getIngredientDictionary();
    getLocationDictionary();
    getShoppingItems();
  }, []);

  return (
    <Flex vertical gap="small">
      <Flex align="center" justify="space-between">
        <Typography.Title
          level={2}
          style={{
            margin: 0,
          }}
        >
          Shopping List
        </Typography.Title>
        <Tooltip title="Add new item">
          <Button onClick={showModal} icon={<FaPlus />} shape="circle" />
        </Tooltip>
      </Flex>
      <Modal
        title="Add New Item"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="ok" type="primary" onClick={handleOk}>
            OK
          </Button>,
        ]}
      >
        <Flex gap="small">
          <AutoComplete
            placeholder="Ingredient"
            onSearch={(value) => setIngredientSearch(value)}
            value={ingredientSearch}
            onSelect={(value) => {
              setIngredient(value);
              setIngredientSearch(ingredientOptions.find((o) => o._id === value)?.title);
            }}
            style={{ marginBottom: "10px", width: "100%" }}
          >
            {ingredientOptions?.map((option) => (
              <Select.Option key={option._id} value={option._id}>
                {option.title}
              </Select.Option>
            ))}
          </AutoComplete>
          <Tooltip title="Add new ingredient">
            <Button onClick={() => addIngredient(ingredientSearch)} icon={<FaPlus />} />
          </Tooltip>
        </Flex>
        <InputNumber
          placeholder="Quantity"
          value={quantity}
          onChange={(value) => setQuantity(value)}
          style={{ marginBottom: "10px" }}
        />
        <Flex gap="small">
          <Select
            mode="multiple"
            allowClear
            placeholder="Location"
            showSearch
            onSearch={(value) => setLocationSearch(value)}
            value={location}
            onChange={(value) => setLocation(value)}
            style={{ marginBottom: "10px", width: "100%" }}
          >
            {locationOptions?.map((option) => (
              <Select.Option key={option._id} value={option._id}>
                {option.title}
              </Select.Option>
            ))}
          </Select>
          <Tooltip title="Add new location">
            <Button onClick={() => addLocation(locationSearch)} icon={<FaPlus />} />
          </Tooltip>
        </Flex>
      </Modal>
      <Flex gap="small">
        {shoppingItems.filter(Boolean).sort((a, b) => a.targetDate > b.targetDate).map((item) => (
          <Card
            key={item?._id}
            title={ingredientOptions.find((ingr) => ingr._id === item?.ingredient)?.title}
            extra={
              <Flex gap="small">
              <Tooltip title="Remove item">
                <Button size="small" onClick={() => removeShoppingItem(item?._id)} icon={<IoMdTrash />} />
              </Tooltip>
              <Tooltip title="Edit item">
                <Button size="small" onClick={() => setEditShoppingItemId(item?._id)} icon={<MdEdit />} />
              </Tooltip>
              </Flex>
            }
            size="small"
            style={{ minWidth: 247.5, flexGrow: 1 }}
          >
            <Flex vertical gap="small">
              <div style={{ flexGrow: 1 }}>
                <strong>Quantity:</strong> {item?.quantity}
              </div>
              <div style={{ flexGrow: 1 }}>
                <strong>Location:</strong>{" "}
                {item?.location?.map((o, i) => (
                  <Tag color="blue" key={i}>
                    {locationOptions?.find((oop) => oop._id === o)?.title}
                  </Tag>
                ))}
              </div>
            </Flex>
          </Card>
        ))}
      </Flex>
    </Flex>
  );
};

export default ShoppingList;
