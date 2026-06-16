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
  'labels.orderStatus.pendingPI': '待开具 PI',
  'labels.orderStatus.piIssued': 'PI 已开具',
  'labels.orderStatus.shipped': '已发货',
  'labels.orderStatus.completed': '已完成',
  'labels.orderType.preWin': 'Pre-win',
  'labels.orderType.firstOrder': '首单',
  'labels.orderType.reorder': '翻单',
  'labels.orderKind.bulk': '大货订单',
  'labels.orderKind.sample': '样机订单',
  'labels.orderKind.reorder': '返单',
  'labels.poStatus.received': 'PO ✓',
  'labels.poStatus.pending': 'PO 待收',
  'labels.contractStatus.signed': '已签订',
  'labels.contractStatus.active': '有效',
  'labels.contractStatus.expiring': '即将到期',
  'labels.contractStatus.expired': '已到期',
  'labels.contractType.annualFramework': '年度框架',
  'labels.contractType.supplyAgreement': '供应协议',
  'labels.contractType.distributionAgreement': '经销协议',
  'labels.paymentStatus.confirmed': '已确认',
  'labels.paymentStatus.receivable': '应收',
  'labels.paymentStatus.partial': '部分到账',
  'labels.oppStage.prospect': '初步接触',
  'labels.oppStage.qualify': '需求确认',
  'labels.oppStage.proposal': '方案报价',
  'labels.oppStage.negotiate': '谈判中',
  'labels.oppStage.closedWon': '已赢单',
  'labels.campaignType.tradeshow': '展会',
  'labels.campaignType.paidAds': '付费广告',
  'labels.campaignType.webinar': '网络研讨会',
  'labels.campaignType.referral': '转介绍',
  'labels.campaignStatus.active': '进行中',
  'labels.campaignStatus.completed': '已完成',
  'labels.leadSource.campaign': '市场活动',
  'labels.leadSource.offlineEvent': '线下活动',
  'labels.leadStatus.new': '新线索',
  'labels.leadStatus.contacted': '已联系',
  'labels.leadStatus.qualified': '已确认意向',
  'labels.leadStatus.converted': '已转化',
  'labels.productCategory.commercial': '商用',
  'labels.productCategory.residential': '家用',
  'labels.productCategory.industrial': '工业',
  'labels.productCategory.strategic': '战略品',
  'labels.productStatus.onSale': '在售',
  'labels.productStatus.discontinued': '停产',
  'labels.productStatus.rnd': '研发中',
  'labels.activityType.finance': '财务',
  'labels.projectStage.survey': '现场勘测',
  'labels.projectStage.install': '安装',
  'labels.projectStage.commissioning': '调试验收',
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
