export interface ExecutiveStockEntry {
  readonly rcept_no: string
  readonly rcept_dt: string
  readonly corp_name: string
  readonly repror: string
  readonly isu_exctv_rgist_at: string
  readonly isu_exctv_ofcps: string
  readonly isu_main_shrholdr: string
  readonly sp_stock_lmp_cnt: string
  readonly sp_stock_lmp_irds_cnt: string
  readonly sp_stock_lmp_rate: string
  readonly sp_stock_lmp_irds_rate: string
}

export interface MajorShareholderChange {
  readonly rcept_no: string
  readonly rcept_dt: string
  readonly corp_name: string
  readonly report_tp: string
  readonly repror: string
  readonly stkqy: string
  readonly stkqy_irds: string
  readonly stkrt: string
  readonly stkrt_irds: string
  readonly ctr_stkqy: string
  readonly ctr_stkrt: string
  readonly change_on: string
  readonly mxmm_shrholdr_nm: string
}

export interface InsiderActivity {
  readonly id: string
  readonly date: string
  readonly name: string
  readonly position: string
  readonly type: "buy" | "sell" | "other"
  readonly shares: number
  readonly totalShares: number
  readonly ratio: number
  readonly ratioChange: number
}
