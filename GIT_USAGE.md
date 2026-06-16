# Git Commands

## Repository

`https://github.com/qishen123456/crm.git`

## Local Repository Path

```powershell
cd "D:\CRMV1\10.海外CRM - 副本\10.海外CRM - 副本"
```

## Push Changes

```powershell
cd "D:\CRMV1\10.海外CRM - 副本\10.海外CRM - 副本"
git add -A
git commit -m "lin 1.0"
git push origin main
```

## First-Time Clone

```powershell
git clone https://github.com/qishen123456/crm.git
cd crm
```

## Pull Latest Changes

```powershell
cd "D:\CRMV1\10.海外CRM - 副本\10.海外CRM - 副本"
git pull origin main
```

## Alternative

If you stay in `D:\CRMV1`, use:

```powershell
git -C "D:\CRMV1\10.海外CRM - 副本\10.海外CRM - 副本" add -A
git -C "D:\CRMV1\10.海外CRM - 副本\10.海外CRM - 副本" commit -m "lin 1.0"
git -C "D:\CRMV1\10.海外CRM - 副本\10.海外CRM - 副本" push origin main
```
