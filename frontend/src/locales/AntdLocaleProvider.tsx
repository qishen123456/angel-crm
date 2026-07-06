import { useEffect, useState } from 'react'
import type { Locale } from 'antd/es/locale'
import { useTranslation } from 'react-i18next'

const antdLocaleMap: Record<string, () => Promise<{ default: Locale }>> = {
  'zh-CN': () => import('antd/locale/zh_CN'),
  'zh-HK': () => import('antd/locale/zh_TW'),
  'en-US': () => import('antd/locale/en_US'),
  'th-TH': () => import('antd/locale/th_TH'),
  'id-ID': () => import('antd/locale/id_ID'),
  'vi-VN': () => import('antd/locale/vi_VN'),
}

export function useAntdLocale() {
  const { i18n } = useTranslation()
  const [antdLocale, setAntdLocale] = useState<Locale | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const loader = antdLocaleMap[i18n.language] || antdLocaleMap['zh-CN']
      const mod = await loader()
      if (!cancelled) setAntdLocale(mod.default)
    }
    load()
    const handler = (lng: string) => {
      const loader = antdLocaleMap[lng] || antdLocaleMap['zh-CN']
      loader().then((mod) => setAntdLocale(mod.default))
    }
    i18n.on('languageChanged', handler)
    return () => {
      cancelled = true
      i18n.off('languageChanged', handler)
    }
  }, [i18n])

  return antdLocale
}
