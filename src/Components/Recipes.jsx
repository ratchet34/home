import React, { useEffect, useState } from "react";
import { AutoComplete, Input, Button, List, Form, message, Modal, Flex, Typography, Tooltip } from "antd";
import { FaPlus } from "react-icons/fa";

const Recipes = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  const [ingredientOptions, setIngredientOptions] = useState([]);
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchIngredients = async () => {
    try {
      const response = await fetch("/api/ingredients", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch ingredients");
      const data = await response.json();
      setIngredientOptions(data.map((item) => ({ value: item.name })));
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      message.error("Failed to fetch ingredients");
    }
  };

  const addIngredientToList = async (name) => {
    try {
      const response = await fetch("/api/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to add new ingredient");
      const data = await response.json();
      setIngredientOptions((prev) => [...prev, { value: data.name }]);
      return data.name;
    } catch (error) {
      console.error("Error adding ingredient:", error);
      message.error("Failed to add new ingredient");
      return null;
    }
  };

  const handleAddIngredient = async (values) => {
    const { ingredient, quantity } = values;
    let ingredientName = ingredient;

    if (!ingredientOptions.some((option) => option.value === ingredient)) {
      ingredientName = await addIngredientToList(ingredient);
      if (!ingredientName) return;
    }

    setRecipeIngredients((prev) => [
      ...prev,
      { name: ingredientName, quantity },
    ]);
    message.success("Ingredient added to recipe");
  };

  const handleRemoveIngredient = (index) => {
    setRecipeIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
  }

  useEffect(() => {
    fetchIngredients();
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
          Recipes List
        </Typography.Title>
        <Tooltip title="Add new item">
          <Button onClick={showModal} icon={<FaPlus />} shape="circle" />
        </Tooltip>
      </Flex>
      <Modal
        title="Create a recipe"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            key="ok"
            type="primary"
            onClick={handleOk}
            loading={loading}
          >
            OK
          </Button>,
        ]}
      >
        <Flex vertical gap="small">
          <AutoComplete
            options={ingredientOptions}
            placeholder="Ingredient"
            style={{ width: 200 }}
          />
        </Flex>
      </Modal>
    </Flex>
  );
};

export default Recipes;
