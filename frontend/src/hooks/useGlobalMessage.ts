import { App } from 'antd'

export function useGlobalMessage() {
  const { message } = App.useApp()

  const success = (content: string) => {
    message.success(content)
  }

  const info = (content: string) => {
    message.info(content)
  }

  const warning = (content: string) => {
    message.warning(content)
  }

  const error = (content: string) => {
    message.error(content)
  }

  return { success, info, warning, error }
}
