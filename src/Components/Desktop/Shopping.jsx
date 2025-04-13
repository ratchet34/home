import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Divider,
  Empty,
  Flex,
  Form,
  Input,
  InputNumber,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { FaPlus } from "react-icons/fa";
import { Modal, Select } from "antd";
import { MdEdit } from "react-icons/md";
import { IoMdTrash } from "react-icons/io";

const ShoppingList = () => {
  const [form] = Form.useForm();

  const [shoppingItems, setShoppingItem] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [itemNameAdd, setItemNameAdd] = useState();
  const [ingredientOptions, setIngredientOptions] = useState([]);

  const [locationOptions, setLocationOptions] = useState([]);
  const [locationNameAdd, setLocationNameAdd] = useState("");

  const [isAddingItem, setIsAddingItem] = useState(false); // Loading state for adding an item
  const [isAddingLocation, setIsAddingLocation] = useState(false); // Loading state for adding a location

  const getShoppingItems = async () => {
    setItemsLoading(true);
    const response = await fetch(
      `${import.meta.env.VITE_HOST}/shopping/items`,
      {
        credentials:
          import.meta.env.NODE_ENV === "production" ? "include" : undefined,
      }
    );
    const data = await response.json();
    setShoppingItem(data);
    setItemsLoading(false);
  };

  const getIngredientDictionary = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_HOST}/shopping/ingredients`,
      {
        credentials:
          import.meta.env.NODE_ENV === "production" ? "include" : undefined,
      }
    );
    const data = await response.json();
    setIngredientOptions(data);
  };

  const getLocationDictionary = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_HOST}/shopping/locations`,
      {
        credentials:
          import.meta.env.NODE_ENV === "production" ? "include" : undefined,
      }
    );
    const data = await response.json();
    setLocationOptions(data);
  };

  const addShoppingItem = async (item) => {
    await fetch(`${import.meta.env.VITE_HOST}/shopping/item`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ item }),
      credentials:
        import.meta.env.NODE_ENV === "production" ? "include" : undefined,
    });
    await getShoppingItems();
  };

  const editShoppingItem = async (id, item) => {
    await fetch(`${import.meta.env.VITE_HOST}/shopping/item/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ item }),
      credentials:
        import.meta.env.NODE_ENV === "production" ? "include" : undefined,
    });
    await getShoppingItems();
  };

  const removeShoppingItem = (id) => {
    fetch(`${import.meta.env.VITE_HOST}/shopping/item/${id}`, {
      method: "DELETE",
      credentials:
        import.meta.env.NODE_ENV === "production" ? "include" : undefined,
    }).then(() => {
      getShoppingItems();
    });
  };

  const addIngredient = async (ingr) => {
    setIsAddingItem(true); // Start loading
    try {
      const response = await fetch(
        `${import.meta.env.VITE_HOST}/shopping/ingredient`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            item: {
              title: ingr,
            },
          }),
          credentials:
            import.meta.env.NODE_ENV === "production" ? "include" : undefined,
        }
      );
      const data = await response.json();
      form.setFieldValue("ingredient", data.insertedId);
      await getIngredientDictionary();
    } catch (error) {
      console.error("Error adding ingredient:", error);
    } finally {
      setIsAddingItem(false); // Stop loading
    }
  };

  const addLocation = async (loc) => {
    setIsAddingLocation(true); // Start loading
    try {
      const response = await fetch(
        `${import.meta.env.VITE_HOST}/shopping/location`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            item: {
              title: loc,
            },
          }),
          credentials:
            import.meta.env.NODE_ENV === "production" ? "include" : undefined,
        }
      );
      const data = await response.json();
      form.setFieldValue("location", [
        ...form.getFieldValue("location"),
        data.insertedId,
      ]);
      await getLocationDictionary();
    } catch (error) {
      console.error("Error adding location:", error);
    } finally {
      setIsAddingLocation(false); // Stop loading
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async ({ id, ingredient, quantity, location }) => {
    if (ingredient && quantity) {
      setIsModalLoading(true); // Start loading
      try {
        const newShoppingItem = {
          ingredient,
          quantity,
        };
        if (location) newShoppingItem.location = location;
        if (id) {
          await editShoppingItem(id, newShoppingItem);
        } else {
          await addShoppingItem(newShoppingItem);
        }
        form.resetFields();
        setIsModalVisible(false);
      } catch (error) {
        console.error("Error while handling OK:", error);
      } finally {
        setIsModalLoading(false); // Stop loading
      }
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleEdit = (id) => {
    const item = shoppingItems.find((t) => t._id === id);
    form.setFieldsValue({
      id: item?._id,
      ingredient: item?.ingredient,
      quantity: item?.quantity,
      location: item?.location,
    });
    setIsModalVisible(true);
  };

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
        <Flex>
          <Tooltip title="Add new item">
            <Button onClick={showModal} icon={<FaPlus />} shape="circle" />
          </Tooltip>
        </Flex>
      </Flex>
      <Modal
        title="Add New Item"
        open={isModalVisible}
        okText="Submit"
        cancelText="Cancel"
        okButtonProps={{ autoFocus: true, htmlType: "submit" }}
        onCancel={handleCancel}
        destroyOnClose
        modalRender={(dom) => (
          <Spin spinning={isModalLoading} tip="Processing...">
            <Form
              form={form}
              name="form_in_modal"
              clearOnDestroy
              onFinish={(values) => handleOk(values)}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 21 }}
              disabled={isModalLoading}
              initialValues={{
                quantity: 1,
              }}
            >
              {dom}
            </Form>
          </Spin>
        )}
      >
        <Form.Item name="id" noStyle />
        <Form.Item
          name="ingredient"
          label="Ingredient"
          rules={[
            {
              required: true,
              message: "Please input the ingredient!",
            },
          ]}
        >
          <Select
            showSearch
            allowClear
            placeholder="Select item"
            style={{ width: "100%" }}
            dropdownRender={(menu) => (
              <>
                {menu}
                <Divider style={{ margin: "8px 0" }} />
                <Flex
                  justify="space-between"
                  gap="small"
                  style={{ padding: "0 8px 4px 8px" }}
                >
                  <Input
                    placeholder="Please enter item"
                    value={itemNameAdd}
                    onChange={(e) => setItemNameAdd(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    style={{ flexGrow: 1 }}
                  />
                  <Button
                    type="text"
                    icon={<FaPlus />}
                    onClick={async () => {
                      await addIngredient(itemNameAdd);
                      setItemNameAdd("");
                    }}
                    loading={isAddingItem} // Show spinner while adding an item
                  >
                    Add item
                  </Button>
                </Flex>
              </>
            )}
            options={ingredientOptions.map((item) => ({
              label: item.title,
              value: item._id,
            }))}
          />
        </Form.Item>
        <Form.Item
          name="quantity"
          label="Quantity"
          rules={[
            {
              required: true,
              message: "Please input the quantity!",
            },
          ]}
        >
          <InputNumber placeholder="Quantity" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="location" label="Location">
          <Select
            mode="multiple"
            allowClear
            placeholder="Select location"
            showSearch
            dropdownRender={(menu) => (
              <>
                {menu}
                <Divider style={{ margin: "8px 0" }} />
                <Flex
                  justify="space-between"
                  gap="small"
                  style={{ padding: "0 8px 4px 8px" }}
                >
                  <Input
                    placeholder="Please enter location"
                    value={locationNameAdd}
                    onChange={(e) => setLocationNameAdd(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    style={{ flexGrow: 1 }}
                  />
                  <Button
                    type="text"
                    icon={<FaPlus />}
                    onClick={async () => {
                      await addLocation(locationNameAdd);
                      setLocationNameAdd("");
                    }}
                    loading={isAddingLocation} // Show spinner while adding a location
                  >
                    Add location
                  </Button>
                </Flex>
              </>
            )}
            style={{ width: "100%" }}
          >
            {locationOptions?.map((option) => (
              <Select.Option key={option._id} value={option._id}>
                {option.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Modal>
      <Spin spinning={itemsLoading} size="large" tip="Loading...">
        {shoppingItems.length === 0 ? (
          <Empty />
        ) : (
          <Flex gap="small" wrap="wrap">
            {shoppingItems
              .filter(Boolean)
              .sort((a, b) => a.targetDate > b.targetDate)
              .map((item) => (
                <Card
                  key={item?._id}
                  title={
                    ingredientOptions.find(
                      (ingr) => ingr._id === item?.ingredient
                    )?.title
                  }
                  extra={
                    <Flex gap="small">
                      <Tooltip title="Remove item">
                        <Button
                          size="small"
                          onClick={() => removeShoppingItem(item?._id)}
                          icon={<IoMdTrash />}
                        />
                      </Tooltip>
                      <Tooltip title="Edit item">
                        <Button
                          size="small"
                          onClick={() => handleEdit(item?._id)}
                          icon={<MdEdit />}
                        />
                      </Tooltip>
                    </Flex>
                  }
                  size="small"
                  style={{ flexGrow: 1 }}
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
        )}
      </Spin>
    </Flex>
  );
};

export default ShoppingList;
