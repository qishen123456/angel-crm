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
  'labels.paymentStatus.normal': '正常',
  'labels.paymentStatus.overdueRisk': '逾期风险',
  'labels.activityType.email': '邮件',
  'labels.activityType.phone': '电话',
  'labels.activityType.meeting': '会议',
  'labels.activityType.visit': '拜访',
  'labels.activityType.wechat': '微信',
  'labels.activityType.other': '其他',
  'labels.paymentMethod.wire': '银行转账',
  'labels.paymentMethod.lc': '信用证',
  'labels.paymentMethod.check': '支票',
  'labels.paymentMethod.paypal': 'PayPal',
  'labels.paymentMethod.stripe': 'Stripe',
  'labels.collectionStatus.due': '即将到期',
  'labels.collectionStatus.overdue': '已逾期',
  'labels.productLine.commercial': '商用',
  'labels.productLine.retail': '零售',
  'labels.productLine.industrial': '工业',
  'labels.productLine.public': '公共场景',
  'labels.leadSource.campaign': '市场活动',
  'labels.leadSource.website': '官网',
  'labels.leadSource.referral': '转介绍',
  'labels.leadSource.tradeshow': '展会',
  'labels.leadSource.social': '社交媒体',
  'labels.leadSource.other': '其他',
  'labels.readWrite': '读写',
  'common.qty': '数量',
  'common.unit': '单价',
  'common.lineTotal': '小计',
  'common.selectProduct': '请选择产品',
  'placeholderPage.subtitle': '该页面正在持续完善中。',
  'placeholderPage.comingSoon': '敬请期待',
  'placeholderPage.description': '当前为高保真复刻过渡页，后续将补充完整交互与数据。',
  'orders.drawerSku': 'SKU',
  'orders.drawerProduct': '产品',
  'orders.drawerQty': '数量',
  'orders.drawerUnit': '单价',
  'orders.drawerLineTotal': '行合计',
  'orders.drawerSubtotal': '小计',
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
