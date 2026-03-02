export interface ILoginData {
  email: string
  password?: string
}

export interface IRegisterData {
  email: string
  firstName: string
  lastName: string
}

export interface IVerificationData {
  email: string
  code: string
}
