declare interface JudgeRequest {
  code: string
  language: string
}

declare interface JudgeResponse {
  status: 'AC' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE' | 'ERROR'
  message?: string
  output?: string
  time?: number
  memory?: number
}
