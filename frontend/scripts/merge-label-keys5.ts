import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const localesDir = join(__dirname, '../src/locales')

function loadJson(name: string) {
  return JSON.parse(readFileSync(join(localesDir, name), 'utf-8'))
}

function saveJson(name: string, data: any) {
  writeFileSync(join(localesDir, name), JSON.stringify(data, null, 2) + '\n')
}

function setPath(obj: any, path: string, value: any) {
  const parts = path.split('.')
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) {
    cur[parts[i]] = cur[parts[i]] || {}
    cur = cur[parts[i]]
  }
  cur[parts[parts.length - 1]] = value
}

const additions: Record<string, string> = {
  'accounts.expiresOn': '到期 {{date}}',
  'labels.businessType.commercial': '商用',
  'labels.businessType.retail': '零售',
  'labels.businessType.industrial': '工业',
  'labels.businessType.public': '公共场景',
  'countryReports.periodYear': '年度',
  'countryReports.periodQ2': 'Q2',
  'countryReports.periodJune': '6月',
  'countryReports.periodWeek': '本周',
  'adminAvatar': '管理',
}

const locales = ['zh-CN.json', 'zh-HK.json', 'en-US.json', 'th-TH.json', 'id-ID.json', 'vi-VN.json']
for (const file of locales) {
  const data = loadJson(file)
  for (const [path, value] of Object.entries(additions)) {
    if (!path.split('.').reduce((o, p) => o?.[p], data)) {
      setPath(data, path, value)
    }
  }
  saveJson(file, data)
  console.log(`Updated ${file}`)
}
