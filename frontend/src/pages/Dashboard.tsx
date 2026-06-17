import { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, List, Tag, Space, Typography } from "antd";
import { WarningOutlined, ClockCircleOutlined, ToolOutlined } from "@ant-design/icons";
import { useMaintenancePlanStore } from "../stores/maintenancePlanStore";
import type { MaintenanceTodoStatus } from "../types/enums";

const { Title, Text } = Typography;

const todoStatusColorMap: Record<MaintenanceTodoStatus, string> = {
  Pending: "gold",
  InProgress: "blue",
  Completed: "green",
  Overdue: "red",
  Cancelled: "default"
};

const todoStatusTextMap: Record<MaintenanceTodoStatus, string> = {
  Pending: "待处理",
  InProgress: "进行中",
  Completed: "已完成",
  Overdue: "已逾期",
  Cancelled: "已取消"
};

export function Dashboard() {
  const { dashboard, loadDashboard } = useMaintenancePlanStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard().finally(() => setLoading(false));
  }, [loadDashboard]);

  const stats = dashboard?.stats;
  const upcoming = dashboard?.upcoming || [];
  const overdue = dashboard?.overdue || [];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        维护看板
      </Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃计划"
              value={stats?.activePlans ?? 0}
              valueStyle={{ color: "#3f8600" }}
              prefix={<ToolOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待处理"
              value={stats?.pendingTodos ?? 0}
              valueStyle={{ color: "#faad14" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中"
              value={stats?.inProgressTodos ?? 0}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已逾期"
              value={stats?.overdueTodos ?? 0}
              valueStyle={{ color: "#cf1322" }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={14}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined style={{ color: "#1890ff" }} />
                <span>即将到期维护（30天内）</span>
              </Space>
            }
            loading={loading}
          >
            <List
              dataSource={upcoming}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{item.equipmentName}</Text>
                        <Tag color={todoStatusColorMap[item.status as MaintenanceTodoStatus]}>
                          {todoStatusTextMap[item.status as MaintenanceTodoStatus]}
                        </Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <div style={{ marginBottom: 4 }}>
                          <Text type="secondary">计划：</Text>
                          {item.planName}
                        </div>
                        <div style={{ marginBottom: 4 }}>
                          <Text type="secondary">维护内容：</Text>
                          {item.content}
                        </div>
                        <div>
                          <Text type="secondary">计划日期：</Text>
                          <Text strong>{item.planDate}</Text>
                          <Text type="secondary" style={{ marginLeft: 16 }}>
                            负责人：
                          </Text>
                          {item.assigneeName || "-"}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
            {upcoming.length === 0 && !loading && (
              <div style={{ textAlign: "center", padding: "24px 0", color: "#999" }}>
                暂无即将到期的维护
              </div>
            )}
          </Card>
        </Col>

        <Col span={10}>
          <Card
            title={
              <Space>
                <WarningOutlined style={{ color: "#cf1322" }} />
                <span>已逾期维护</span>
              </Space>
            }
            loading={loading}
          >
            <List
              dataSource={overdue}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{item.equipmentName}</Text>
                        <Tag color="red">已逾期</Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <div style={{ marginBottom: 4 }}>
                          <Text type="secondary">到期日期：</Text>
                          <Text type="danger">{item.dueDate}</Text>
                        </div>
                        <div>
                          <Text type="secondary">维护内容：</Text>
                          {item.content}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
            {overdue.length === 0 && !loading && (
              <div style={{ textAlign: "center", padding: "24px 0", color: "#999" }}>
                暂无逾期维护
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
