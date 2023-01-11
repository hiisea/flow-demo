import { Node } from "@antv/x6";
import React, { memo, useState } from "react";
import { Button, Input } from "antd";

interface Props {
  sourceNode: Node;
}

const Component: React.FC<Props> = ({ sourceNode }) => {
  const [conditionList, setConditionList] = useState<Array<{code: string}>>([]);
  const [code, setCode] = useState('');
  const onAddCondition = () => {
    setConditionList([...conditionList, {code}])
  }

  return (
    <div style={{ padding: 10 }}>
      <ul>
        {conditionList.map((item) => (
          <li>{item.code}</li>
        ))}
      </ul>
      <Input value={code} onChange={(e)=>setCode(e.target.value)} />
      <Button type="primary" onClick={onAddCondition}>添加条件判断</Button>
    </div>
  );
};

export default memo(Component);
