import { Node } from "@antv/x6";
import React, { memo, useMemo } from "react";
import { Button, Form, Input } from "antd";
import { Model } from "./Model";

interface Props {
  node: Node;
  model: Model;
}

const Component: React.FC<Props> = ({ node, model }) => {
  const onFinish = (values: any) => {
    node.setData({...model, name: values.name});
  };
  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };
  const initialValues = useMemo(() => {
    return { name: model.name };
  }, [model]);
  return (
    <Form
      name="basic"
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 20 }}
      initialValues={initialValues}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <Form.Item
        label="名称"
        name="name"
        rules={[{ required: true, message: "Please input your username!" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 4, span: 20 }}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default memo(Component);
