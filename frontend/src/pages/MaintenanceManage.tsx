import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  message,
  Tabs,
  Popconfirm,
  Row,
  Col,
  Statistic
} from "antd";
import {
  PlusOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import { useMaintenancePlanStore } from "../stores/maintenancePlanStore";
import { categoryApi } from "../api/category";
import type { MaintenancePlan, MaintenanceTodo } from "../types/maintenance";
import type { EquipmentCategory } from "../types/equipment";
import type { CycleUnit, MaintenanceType, MaintenancePlanStatus, MaintenanceTodoStatus } from "../types/enums";

const { TextArea } = Input;

const typeOptions: { label: string; value: MaintenanceType }[] = [
  { label: "预防性维护", value: "Preventive" },
  { label: "校正性维护", value: "Corrective" },
  { label: "校准", value: "Calibration" },
  { label: "清洁", value: "Cleaning" }
];

const cycleUnitOptions: { label: string; value: CycleUnit }[] = [
  { label: "天", value: "Day" },
  { label: "周", value: "Week" },
  { label: "月", value: "Month" },
  { label: "年", value: "Year" }
];

const planStatusMap: Record<MaintenancePlanStatus, { color: string; text: string }> = {
  Active: { color: "green", text: "启用" },
  Inactive: { color: "default", text: "停用" }
};

const todoStatusMap: Record<MaintenanceTodoStatus, { color: string; text: string }> = {
  Pending: { color: "gold", text: "待处理" },
  InProgress: { color: "blue", text: "进行中" },
  Completed: { color: "green", text: "已完成" },
  Overdue: { color: "red", text: "已逾期" },
  Cancelled: { color: "default", text: "已取消" }
};

export function MaintenanceManage() {
  const {
    plans,
    todos,
    dashboard,
    loadPlans,
    loadTodos,
    loadDashboard,
    createPlan,
    updatePlan,
    deletePlan,
    togglePlanStatus,
    generateTodos,
    executeTodo,
    updateTodoStatus
  } = useMaintenancePlanStore();

  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MaintenancePlan | null>(null);
  const [planForm] = Form.useForm();

  const [executeModalOpen, setExecuteModalOpen] = useState(false);
  const [currentTodo, setCurrentTodo] = useState<MaintenanceTodo | null>(null);
  const [executeForm] = Form.useForm();

  const [activeTab, setActiveTab] = useState("plans");

  useEffect(() => {
    loadPlans();
    loadTodos();
    loadDashboard();
    categoryApi.tree().then(setCategories).catch(() => {});
  }, [loadPlans, loadTodos, loadDashboard]);

  const handleCreatePlan = () => {
    setEditingPlan(null);
    planForm.resetFields();
    planForm.setFieldsValue({
      type: "Preventive",
      cycleUnit: "Month",
      cycleValue: 3,
      remindDaysBefore: 7,
      status: "Active"
    });
    setPlanModalOpen(true);
  };

  const handleEditPlan = (plan: MaintenancePlan) => {
    setEditingPlan(plan);
    planForm.setFieldsValue(plan);
    setPlanModalOpen(true);
  };

  const handlePlanSubmit = async (values: Record<string, unknown>) => {
    try {
      if (editingPlan) {
        await updatePlan(editingPlan.id, values);
        message.success("维护计划更新成功");
      } else {
        await createPlan(values as Partial<MaintenancePlan>);
        message.success("维护计划创建成功");
      }
      setPlanModalOpen(false);
      loadDashboard();
    } catch (error) {
      message.error("操作失败");
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      await deletePlan(id);
      message.success("删除成功");
      loadDashboard();
    } catch (error) {
      message.error("删除失败");
    }
  };

  const handleTogglePlan = async (id: string) => {
    try {
      await togglePlanStatus(id);
      message.success("状态更新成功");
      loadDashboard();
    } catch (error) {
      message.error("操作失败");
    }
  };

  const handleGenerateTodos = async (planId?: string) => {
    try {
      await generateTodos(planId);
      message.success("待办生成成功");
    } catch (error) {
      message.error("生成失败");
    }
  };

  const handleExecuteTodo = (todo: MaintenanceTodo) => {
    setCurrentTodo(todo);
    executeForm.resetFields();
    executeForm.setFieldsValue({
      content: todo.content,
      result: "Pass",
      cost: 0
    });
    setExecuteModalOpen(true);
  };

  const handleExecuteSubmit = async (values: Record<string, unknown>) => {
    if (!currentTodo) return;
    try {
      await executeTodo(currentTodo.id, values as { cost?: number; result?: string; content?: string });
      message.success("维护执行成功");
      setExecuteModalOpen(false);
      loadDashboard();
    } catch (error) {
      message.error("执行失败");
    }
  };

  const planColumns = [
    {
      title: "计划名称",
      dataIndex: "name",
      key: "name",
      width: 200
    },
    {
      title: "设备类别",
      dataIndex: "categoryId",
      key: "categoryId",
      width: 150,
      render: (categoryId: string) => {
        const cat = categories.find((c) => c.id === categoryId);
        return cat?.name || categoryId;
      }
    },
    {
      title: "维护类型",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type: MaintenanceType) => {
        const opt = typeOptions.find((o) => o.value === type);
        return opt?.label || type;
      }
    },
    {
      title: "周期",
      key: "cycle",
      width: 120,
      render: (_: unknown, record: MaintenancePlan) => {
        const unit = cycleUnitOptions.find((o) => o.value === record.cycleUnit);
        return `每 ${record.cycleValue} ${unit?.label || record.cycleUnit}`;
      }
    },
    {
      title: "提前提醒",
      dataIndex: "remindDaysBefore",
      key: "remindDaysBefore",
      width: 100,
      render: (days: number) => `${days} 天`
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: MaintenancePlanStatus) => {
        const info = planStatusMap[status];
        return <Tag color={info.color}>{info.text}</Tag>;
      }
    },
    {
      title: "操作",
      key: "actions",
      width: 250,
      render: (_: unknown, record: MaintenancePlan) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={record.status === "Active" ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={() => handleTogglePlan(record.id)}
          >
            {record.status === "Active" ? "停用" : "启用"}
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditPlan(record)}>
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleGenerateTodos(record.id)}
          >
            生成待办
          </Button>
          <Popconfirm title="确定删除此计划？" onConfirm={() => handleDeletePlan(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const todoColumns = [
    {
      title: "设备名称",
      dataIndex: "equipmentName",
      key: "equipmentName",
      width: 180,
      render: (_: unknown, record: MaintenanceTodo) => record.equipmentName || record.equipmentId
    },
    {
      title: "维护类型",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type: MaintenanceType) => {
        const opt = typeOptions.find((o) => o.value === type);
        return opt?.label || type;
      }
    },
    {
      title: "计划日期",
      dataIndex: "planDate",
      key: "planDate",
      width: 120
    },
    {
      title: "截止提醒",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 120
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: MaintenanceTodoStatus) => {
        const info = todoStatusMap[status];
        return <Tag color={info.color}>{info.text}</Tag>;
      }
    },
    {
      title: "负责人",
      dataIndex: "assigneeName",
      key: "assigneeName",
      width: 100,
      render: (_: unknown, record: MaintenanceTodo) => record.assigneeName || "-"
    },
    {
      title: "所属计划",
      dataIndex: "planName",
      key: "planName",
      width: 150,
      render: (_: unknown, record: MaintenanceTodo) => {
        const plan = plans.find((p) => p.id === record.planId);
        return plan?.name || "-";
      }
    },
    {
      title: "操作",
      key: "actions",
      width: 200,
      render: (_: unknown, record: MaintenanceTodo) => (
        <Space size="small">
          {record.status !== "Completed" && record.status !== "Cancelled" && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleExecuteTodo(record)}
            >
              执行维护
            </Button>
          )}
          {record.status === "Pending" && (
            <Button size="small" onClick={() => updateTodoStatus(record.id, "InProgress")}>
              开始
            </Button>
          )}
        </Space>
      )
    }
  ];

  const stats = dashboard?.stats;

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic title="活跃计划" value={stats?.activePlans ?? 0} valueStyle={{ color: "#3f8600" }} />
          </Col>
          <Col span={6}>
            <Statistic title="待处理待办" value={stats?.pendingTodos ?? 0} valueStyle={{ color: "#faad14" }} />
          </Col>
          <Col span={6}>
            <Statistic title="进行中" value={stats?.inProgressTodos ?? 0} valueStyle={{ color: "#1890ff" }} />
          </Col>
          <Col span={6}>
            <Statistic title="已逾期" value={stats?.overdueTodos ?? 0} valueStyle={{ color: "#cf1322" }} />
          </Col>
        </Row>
      </Card>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "plans",
              label: "维护计划",
              children: (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <Space>
                      <Button type="primary" icon={<PlusOutlined />} onClick={handleCreatePlan}>
                        新建计划
                      </Button>
                      <Button icon={<ReloadOutlined />} onClick={() => handleGenerateTodos()}>
                        批量生成待办
                      </Button>
                    </Space>
                  </div>
                  <Table
                    rowKey="id"
                    columns={planColumns}
                    dataSource={plans}
                    pagination={{ pageSize: 10 }}
                  />
                </>
              )
            },
            {
              key: "todos",
              label: "维护待办",
              children: (
                <Table
                  rowKey="id"
                  columns={todoColumns}
                  dataSource={todos.map((t) => {
                    const plan = plans.find((p) => p.id === t.planId);
                    return { ...t, planName: plan?.name };
                  })}
                  pagination={{ pageSize: 10 }}
                />
              )
            }
          ]}
        />
      </Card>

      <Modal
        title={editingPlan ? "编辑维护计划" : "新建维护计划"}
        open={planModalOpen}
        onCancel={() => setPlanModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={planForm} layout="vertical" onFinish={handlePlanSubmit}>
          <Form.Item name="name" label="计划名称" rules={[{ required: true, message: "请输入计划名称" }]}>
            <Input placeholder="请输入计划名称" />
          </Form.Item>

          <Form.Item name="categoryId" label="设备类别" rules={[{ required: true, message: "请选择设备类别" }]}>
            <Select placeholder="请选择设备类别" options={categories.map((c) => ({ label: c.name, value: c.id }))} />
          </Form.Item>

          <Form.Item name="type" label="维护类型" rules={[{ required: true, message: "请选择维护类型" }]}>
            <Select placeholder="请选择维护类型" options={typeOptions} />
          </Form.Item>

          <Form.Item label="维护周期">
            <Input.Group compact>
              <Form.Item name="cycleValue" noStyle rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: "50%" }} placeholder="周期值" />
              </Form.Item>
              <Form.Item name="cycleUnit" noStyle rules={[{ required: true }]}>
                <Select style={{ width: "50%" }} options={cycleUnitOptions} />
              </Form.Item>
            </Input.Group>
          </Form.Item>

          <Form.Item
            name="remindDaysBefore"
            label="提前提醒天数"
            rules={[{ required: true, message: "请输入提前提醒天数" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} placeholder="提前多少天提醒" />
          </Form.Item>

          <Form.Item name="content" label="维护内容">
            <TextArea rows={3} placeholder="请输入维护内容描述" />
          </Form.Item>

          <Form.Item name="status" label="状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="停用" defaultChecked />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingPlan ? "保存" : "创建"}
              </Button>
              <Button onClick={() => setPlanModalOpen(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="执行维护"
        open={executeModalOpen}
        onCancel={() => setExecuteModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form form={executeForm} layout="vertical" onFinish={handleExecuteSubmit}>
          <Form.Item label="设备">
            <div>{currentTodo?.equipmentName || currentTodo?.equipmentId}</div>
          </Form.Item>

          <Form.Item name="content" label="维护内容">
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item name="result" label="维护结果" rules={[{ required: true }]}>
            <Select
              options={[
                { label: "通过", value: "Pass" },
                { label: "不通过", value: "Fail" },
                { label: "需要跟进", value: "NeedsFollowUp" }
              ]}
            />
          </Form.Item>

          <Form.Item name="cost" label="维护费用 (元)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                确认执行
              </Button>
              <Button onClick={() => setExecuteModalOpen(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
