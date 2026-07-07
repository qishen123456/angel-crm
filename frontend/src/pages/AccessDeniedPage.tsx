import { LockOutlined } from '@ant-design/icons'
import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'

export function AccessDeniedPage() {
  const navigate = useNavigate()

  return (
    <Result
      icon={<LockOutlined />}
      status="403"
      title="无权访问"
      subTitle="当前账号没有访问该页面或功能的权限。"
      extra={<Button type="primary" onClick={() => navigate('/app/today', { replace: true })}>返回今日工作台</Button>}
    />
  )
}
