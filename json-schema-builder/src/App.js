import React, { useState } from "react";
import { Input, Select, Button, Space, Typography, Card } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import "antd/dist/reset.css";
import "./App.css";

const { Option } = Select;
const { Title } = Typography;

const defaultField = () => ({
  id: uuidv4(),
  key: "",
  type: "string",
  children: [],
});

const FieldComponent = ({ field, onChange, onDelete }) => {
  const handleKeyChange = (e) => {
    onChange({ ...field, key: e.target.value });
  };

  const handleTypeChange = (value) => {
    const newField = { ...field, type: value };
    if (value === "nested" && field.children.length === 0) {
      newField.children = [defaultField()];
    } else if (value !== "nested") {
      newField.children = [];
    }
    onChange(newField);
  };

  const handleChildChange = (index, updatedChild) => {
    const newChildren = [...field.children];
    newChildren[index] = updatedChild;
    onChange({ ...field, children: newChildren });
  };

  const handleAddChild = () => {
    onChange({ ...field, children: [...field.children, defaultField()] });
  };

  const handleDeleteChild = (index) => {
    const newChildren = field.children.filter((_, i) => i !== index);
    onChange({ ...field, children: newChildren });
  };

  return (
    <Card size="small" style={{ marginBottom: 10 }}>
      <Space align="start">
        <Input
          placeholder="Field Key"
          value={field.key}
          onChange={handleKeyChange}
          style={{ width: 150 }}
        />
        <Select value={field.type} onChange={handleTypeChange} style={{ width: 120 }}>
          <Option value="string">String</Option>
          <Option value="number">Number</Option>
          <Option value="nested">Nested</Option>
        </Select>
        <Button danger icon={<MinusCircleOutlined />} onClick={onDelete} />
      </Space>
      {field.type === "nested" && (
        <div style={{ marginLeft: 30, marginTop: 10 }}>
          {field.children.map((child, idx) => (
            <FieldComponent
              key={child.id}
              field={child}
              onChange={(updated) => handleChildChange(idx, updated)}
              onDelete={() => handleDeleteChild(idx)}
            />
          ))}
          <Button icon={<PlusOutlined />} onClick={handleAddChild} size="small">
            Add Nested Field
          </Button>
        </div>
      )}
    </Card>
  );
};

const buildJson = (fields) => {
  const result = {};
  for (const field of fields) {
    if (!field.key) continue;
    if (field.type === "string") result[field.key] = "string";
    else if (field.type === "number") result[field.key] = 0;
    else if (field.type === "nested") result[field.key] = buildJson(field.children);
  }
  return result;
};

function App() {
  const [fields, setFields] = useState([defaultField()]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleChange = (index, updatedField) => {
    const newFields = [...fields];
    newFields[index] = updatedField;
    setFields(newFields);
  };

  const handleAddField = () => {
    setFields([...fields, defaultField()]);
  };

  const handleDeleteField = (index) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
  };

  const handleSubmit = async () => {
    const schemaJson = buildJson(fields);

    if (!title.trim()) {
      alert("Please enter a schema title.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/schemas/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          schemaJson,
        }),
      });

      if (!response.ok) throw new Error("Failed to save schema");

      //const data = await response.json();
      alert("Schema saved successfully!");

      // Reset form
      setTitle("");
      setDescription("");
      setFields([defaultField()]);
    } catch (error) {
      console.error("Error submitting schema:", error);
      alert("Something went wrong while saving the schema.");
    }
  };

  return (
    <div style={{ display: "flex", gap: 20, padding: 20 }}>
      <div style={{ flex: 1 }}>
        <Title level={3}>JSON Schema Builder</Title>

        <Input
          placeholder="Schema Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <Input
          placeholder="Schema Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ marginBottom: 10 }}
        />

        {fields.map((field, idx) => (
          <FieldComponent
            key={field.id}
            field={field}
            onChange={(updated) => handleChange(idx, updated)}
            onDelete={() => handleDeleteField(idx)}
          />
        ))}

        <Button icon={<PlusOutlined />} onClick={handleAddField} style={{ marginTop: 10 }}>
          Add Field
        </Button>

        <Button type="primary" onClick={handleSubmit} style={{ marginTop: 10, marginLeft: 10 }}>
          Submit Schema
        </Button>
      </div>

      <div style={{ flex: 1 }}>
        <Title level={3}>JSON Preview</Title>
        <Card>
          <pre>{JSON.stringify(buildJson(fields), null, 2)}</pre>
        </Card>
      </div>
    </div>
  );
}

export default App;
